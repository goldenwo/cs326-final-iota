const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//static pages
app.use(express.static(''));
//fake info to send back
const faker = require("faker");

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

async function addUser(name, password) {
    return await connectAndRun(db => db.any("INSERT INTO users VALUES ($1, $2);", [name, password]));
}

async function findUser(name, password) {
    return await connectAndRun(db => db.any("SELECT * FROM users;"));
}

async function getRankings() {
    return await connectAndRun(db => db.any("SELECT * FROM rankings;"));
}

async function addRanking(name, percentage) {
    return await connectAndRun(db => db.any("INSERT INTO rankings VALUES ($1, $2);", [name, percentage]));
}

async function getGroups() {
    return await connectAndRun(db => db.any("SELECT * FROM groups;"));
}

async function addGroup(groupName) {
    return await connectAndRun(db => db.any("INSERT INTO groups VALUES ($1);", [groupName]))
}

async function getPortfolios() {
    return await connectAndRun(db => db.any("SELECT * FROM portfolios;"));
}

async function addPortfolio(name, author, percentage) {
    return await connectAndRun(db => db.any("INSERT INTO portfolios VALUES ($1, $2, $3);", [name, author, percentage]))
}

app.post('/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (password === confirmPassword) {
        await addUser(username, password);
        res.render('login', {
            message: 'Registration Complete. Please login to continue.',
            messageClass: 'alert-success'
        });
    }
    else {
        res.render('register', {
            message: 'Password does not match.',
            messageClass: 'alert-danger'
        });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = await findUser(username, password);

    if (user != NULL) {
        
        res.redirect('/home');
    }
    else {
        res.render('login', {
            message: 'Invalid username or password',
            messageClass: 'alert-danger'
        });
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
    await addPortfolio(req.query.name, req.query.author, req.query.percentage);
    res.send(req.query.name + ' ' + req.query.author + ' ' + req.query.percentage);
});

app.listen(port);
console.log("Server started on http://localhost:" + port);
