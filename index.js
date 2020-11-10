const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
//static pages
app.use(express.static('./'));

const pgp = require("pg-promise")({
    connect(client) {
        console.log('Connected to database:', client.connectionParameters.database);
    },

    disconnect(client) {
        console.log('Disconnected from database:', client.connectionParameters.database);
    }
});
const url = process.env.DATABASE_URL || "postgres://powcrkcrnpbbzb:c2ec7aa8488758fbde1745685d1e0f0cee3a8b698cb7dee8cae68dc50046bc91@ec2-23-23-36-227.compute-1.amazonaws.com:5432/d3e8rpc484cq6";
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

async function addUser(name, password, assigned_group) {
    return await connectAndRun(db => db.any("INSERT INTO users VALUES ($1, $2, $3);", [name, password, assigned_group]));
}

async function findUser(name, password) {
    return await connectAndRun(db => db.any("SELECT * FROM users WHERE name = $1 AND password = $2;", [name, password]));
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
        addUser(username, password, NULL);
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
    const user = findUser(username, password);

    if (user != NULL) {
        res.redirect('/index.html');
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
