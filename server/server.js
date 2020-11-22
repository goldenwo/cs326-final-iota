require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const minicrypt = require('./miniCrypt');
//static pages

const mc = new minicrypt();

app.use(express.static('html'));

// Session configuration

const session = {
    secret : process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
    resave : false,
    saveUninitialized: false
};

// Passport configuration

const strategy = new LocalStrategy(async (username, password, done) => {
	if (!findUser(username)) {
	    // no such user
	    return done(null, false, { 'message' : 'Wrong username' });
	}
	if (!validatePassword(username, password)) {
	    // invalid password
	    // should disable logins after N messages
	    // delay return to rate-limit brute-force attacks
	    await new Promise((r) => setTimeout(r, 2000)); // two second delay
	    return done(null, false, { 'message' : 'Wrong password' });
	}
	// success!
	// should create a user object here, associated with a unique identifier
	return done(null, username);
});

// App configuration

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

//Psql setup
const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});

const url = process.env.DATABASE_URL;
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
let password;
let username;

if (!process.env.PASSWORD) {
	secrets = require('secrets.json');
	password = secrets.password;
	} else {
		password = process.env.PASSWORD;
	}
if (!process.env.USERNAME) {
	secrets = require('secrets.json');
	password = secrets.USERNAME;
	} else {
		password = process.env.USERNAME;
	}

		
	

async function addUser(name, password, assigned_group) {
	if (findUser(name)) {
		return false;
	}
	let hashedPw = mc.hash(password);
	let salt = hashedPw[0];
	let hash = hashedPw[1];
	await connectAndRun(db => db.any("INSERT INTO users VALUES ($1, $2, $3, $4, $5);", [name, password, salt, hash, assigned_group]));
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

function validatePassword(name, pwd) {
    if (!findUser(name)) {
	return false;
    }
	return mc.check(pwd, users[name][0], users[name][1]);
}

// Routes

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
	    res.send(res.params.userID);
	});

app.post('/login',
	 passport.authenticate('local' , {
	     'successRedirect' : '/private',
	     'failureRedirect' : '/login' 
	 }));

app.get('/login',
	(req, res) => res.sendFile('html/login.html',
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
	(req, res) => res.sendFile('html/register.html',
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
		res.write('<H1>HELLO ' + req.params.userID + "</H1>");
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
    res.send(req.query.name + ' ' + req.query.author + ' ' + req.query.stock + ' ' + req.query.shares);
});

app.listen(port);
console.log("Server started on http://localhost:" + port);
