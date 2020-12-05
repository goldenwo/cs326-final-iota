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

//Secrets
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

// Passport configuration
const strategy = new LocalStrategy(async (username, pw, done) => {
	//finds user and validates password after 500ms delay
	if (!findUser(username)) {
	    return done(null, false, { 'message' : 'Wrong username' });
	}
	if (!validatePassword(username, pw)) {
	    await new Promise((r) => setTimeout(r, 500));
	    return done(null, false, { 'message' : 'Wrong password' });
	}
	return done(null, username);
});

//App configuration
app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// Convert user object to a unique identifier.
passport.serializeUser((user, done) => {
    done(null, user);
});
// Convert a unique identifier to a user object.
passport.deserializeUser((uid, done) => {
    done(null, uid);
});

app.use(express.json()); // allow JSON inputs
app.use(express.urlencoded({'extended' : true})); // allow URLencoded data
app.use(express.static('app')); //Serves static files through app

//Psql setup
const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

//Heroku database configs
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
		console.log("db task: " + task); //debug
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

//Initializes env variables if run locally
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

//Helper functions for endpoints
function addUser(name, pw, assigned_group) {
	if (findUser(name)) {
		console.log("User is found"); //debug
		return false;
	}
	let hashedPw = mc.hash(pw);
	let salt = hashedPw[0];
	let hash = hashedPw[1];
	insertUser(name, salt, hash, assigned_group);
	connectAndRun(db => db.any("INSERT INTO users (name, salt, hash, assigned_group) VALUES ($1, $2, $3, $4);", [name, salt, hash, assigned_group]));
	return true;
}

async function insertUser(name, salt, hash, assigned_group) {
	return await connectAndRun(db => db.any("INSERT INTO users (name, salt, hash, assigned_group) VALUES ($1, $2, $3, $4);", [name, salt, hash, assigned_group]));
}

async function getRankings() {
    return await connectAndRun(db => db.any("SELECT * FROM rankings;")).then((result) => {
		return result;
	});
}

async function addRanking(name, percentage) {
	return await connectAndRun(db => db.any("INSERT INTO rankings (name, percentage) VALUES ($1, $2);", [name, percentage]));
}

async function getGroups() {
    return await connectAndRun(db => db.any("SELECT * FROM groups;")).then((result) => {
		return result;
	});
}

async function addGroup(groupName) {
    return await connectAndRun(db => db.any("INSERT INTO groups (name) VALUES ($1);", [groupName]))
}

async function findPortfolio(name, author) {
    return await connectAndRun(db => db.any("SELECT * FROM portfolios WHERE name = $1 AND author = $2;", [name, author])).then((result) => {
		return result;
	});
}

async function addPortfolio(name, author, stock, shares) {
    return await connectAndRun(db => db.any("INSERT INTO portfolios (name, author, stock, shares) VALUES ($1, $2, $3, $4);", [name, author, stock, shares]))
}

function findUser(username) {
	const response = getUser(username);
	console.log("This is the response in findUser: " + response); //debug
	console.log("Username of findUserResponse: " + response.name); //debug
	return (response.name !== undefined || response.name != null);
}

async function getUser(username) {
	return await connectAndRun(db => db.any("SELECT * FROM users WHERE name = $1;", [username])).then((result) => {
		return result;
	});
}

function validatePassword(name, pwd) {
    if (!findUser(name)) {
		return false;
	}
	const passwordInfo = getPasswordInfo(name);
	return mc.check(pwd, passwordInfo.salt, passwordInfo.hash);
}

async function getPasswordInfo(name) {
	return await connectAndRun(db => db.any("SELECT * FROM users WHERE name = $1;" [name])).then((result) => {
		return result;
	});
}

function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
		next();
    } else {
		res.redirect('/login.html');
    }
}

// Routes
app.get('/',
	checkLoggedIn,
	(req, res) => {
		console.log("sending userID: " + req.params.userID); //debug
	    res.send(JSON.stringify({'username' : req.params.userID}));
	});

app.post('/login',
	 passport.authenticate('local' , {
	     'successRedirect' : '/index.html',
	     'failureRedirect' : '/login.html' 
	 }));

app.get('/login',
	(req, res) => res.redirect('/login.html'));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login.html');
});

app.post('/register',
	 (req, res) => {
	     const username = req.body['username'];
	     const password = req.body['password'];
	     if (addUser(username, password, null)) {
		 res.redirect('/login.html');
	     } else {
		 res.redirect('/register.html');
	     }
	 });

app.get('/register',
	(req, res) => res.redirect('/register.html'));

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