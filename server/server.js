require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const minicrypt = require('./miniCrypt');
const yahooFinance = require('yahoo-finance');
const { quote } = require('yahoo-finance');

const mc = new minicrypt();

let password;
let secrets;
let thisSecret;
if (!process.env.SECRET) {
	secrets = require('../secrets.json');
	thisSecret = secrets.SECRET;
	} else {
		thisSecret = process.env.SECRET;
	}
const session = {
    secret : thisSecret,
    resave : false,
    saveUninitialized: false
};


const strategy = new LocalStrategy(async (username, pw, done) => {
	if (!findUser(username)) {
	    return done(null, false, { 'message' : 'Wrong username' });
	}
	if (!validatePassword(username, pw)) {
	    await new Promise((r) => setTimeout(r, 500));
	    return done(null, false, { 'message' : 'Wrong password' });
	}
	return done(null, username);
});

app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((uid, done) => {
    done(null, uid);
});

app.use(express.json());
app.use(express.urlencoded({'extended' : true}));
app.use(express.static('app'));

const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

let url = process.env.DATABASE_URL;
if (!process.env.DATABASE_URL) {
	secrets = require('../secrets.json');
	url = secrets.DATABASE_URL;
	} else {
		url = process.env.DATABASE_URL;
	}
const db = pgp(url);

async function connectAndRun(task) {
    let connection = null;

    try {
        connection = await db.connect();
        return await task(connection);
    } catch (e) {
        throw e;
    } finally {
        try {
            connection.done();
        } catch(ignored) {

        }
    }
}

if (!process.env.PASSWORD) {
	secrets = require('../secrets.json');
	password = secrets.password;
	} else {
		password = process.env.PASSWORD;
	}
if (!process.env.USERNAME) {
	secrets = require('../secrets.json');
	password = secrets.USERNAME;
	} else {
		password = process.env.USERNAME;
	}

async function addUser(name, pw, assigned_group) {
	if (findUser(name)) {
		return false;
	}
	let hashedPw = mc.hash(pw);
	let salt = hashedPw[0];
	let hash = hashedPw[1];
	await connectAndRun(db => db.any("INSERT INTO users VALUES ($1, $2, $3, $4);", [name, salt, hash, assigned_group]));
	return true;
}

async function getUser(name) {
    return await connectAndRun(db => db.any("SELECT * FROM users WHERE name = $1", [name]));
}

async function getRankings() {
    return await connectAndRun(db => db.any("SELECT * FROM rankings;"));
}

async function addRanking(name, percentage) {
	if (Object.keys(await connectAndRun(db => db.any("SELECT * FROM rankings VALUES ($1);", [name]))).length === 0) {
		return false;
	}
	await connectAndRun(db => db.any("INSERT INTO rankings VALUES ($1, $2);", [name, percentage]));
	return true;
}

async function getGroups() {
    return await connectAndRun(db => db.any("SELECT * FROM groups;"));
}

async function addGroup(groupName) {
    return await connectAndRun(db => db.any("INSERT INTO groups VALUES ($1);", [groupName]))
}

async function findPortfolio(name, author) {
    return await connectAndRun(db => db.any("SELECT * FROM portfolios WHERE name = $1 AND author = $2;", [name, author]));
}

async function addPortfolio(name, author, stock, shares) {
    return await connectAndRun(db => db.any("INSERT INTO portfolios VALUES ($1, $2, $3, $4);", [name, author, stock, shares]))
}

async function findUser(username) {
    return (Object.keys(await connectAndRun(db => db.any("SELECT * FROM users WHERE name = $1;", [username]))).length === 0); //if json object returned is not empty
}

async function validatePassword(name, pwd) {
    if (!findUser(name)) {
	return false;
	}
	const passwordInfo = await connectionAndRun(db => db.any("SELECT * FROM users WHERE name = $1;" [name]));
	return mc.check(pwd, passwordInfo.salt, passwordInfo.hash);
}

function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
	next();
    } else {
	res.redirect('/login');
    }
}

app.get('/',
	checkLoggedIn,
	(req, res) => {
	    res.send(JSON.stringify({'username' : req.params.userID}));
	});

app.post('/login',
	 passport.authenticate('local' , {
	     'successRedirect' : '../index.html',
	     'failureRedirect' : '../login.html' 
	 }));

app.get('/login',
	(req, res) => res.sendFile('../login.html',
				   { 'root' : __dirname }));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.post('/register',
	 (req, res) => {
	     const username = req.body['username'];
	     const password = req.body['password'];
	     if (addUser(username, password)) {
		 res.redirect('/login');
	     } else {
		 res.redirect('/register');
	     }
	 });

app.get('/register',
	(req, res) => res.sendFile('../register.html',
				   { 'root' : __dirname }));

app.get('/private',
	checkLoggedIn,
	(req, res) => {
	    res.redirect('/private/' + req.user);
	});

app.get('/private/:userID/',
	checkLoggedIn,
	(req, res) => {
	    if (req.params.userID === req.user) {
		res.writeHead(200, {"Content-Type" : "text/html"});
		res.write('<H1>Hello ' + req.params.userID + "</H1>");
		res.write('<br/><a href="/logout">click here to logout</a>');
		res.end();
	    } else {
		res.redirect('/private/');
	    }
	});

app.get("/getRankings", async (req, res) => {
    const rankings = await getRankings();
    res.send(JSON.stringify(rankings));
});

app.get("/addRanking", async (req, res) => {
    await addRanking(req.query.name, req.query.percentage);
    res.send(req.query.name + ' ' + req.query.percentage);
});

app.get("/getGroups", async (req, res) => {
    const groups = await getGroups();
    res.send(JSON.stringify(groups));
});

app.get("/addGroup", async (req, res) => {
    await addGroup(req.query.name);
    res.send(req.query.name);
});

app.get("/getPortfolios", async (req, res) => {
    const portfolios = await getPortfolios();
    res.send(JSON.stringify(portfolios));
});

app.get("/addPortfolio", async (req, res) => {
    await addPortfolio(req.query.name, req.query.author, req.query.stock, req.query.shares);
});

app.get("/stockInfo", async (req, res) => {
	const result = await quote(req.query.symbol, ['price']);
	res.send(JSON.stringify({'price': result.price.regularMarketPrice, 'percentchange': result.price.regularMarketChangePercent}));
});

app.get("*", (req, res) => {
    res.send("Error");
});

app.listen(port);
console.log("Server started on http://localhost:" + port);