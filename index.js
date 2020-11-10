const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

const express = require("express");
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

app.get("/getRankings", async (req, res) => {
    const books = await getBooks();
    res.send(JSON.stringify(books));
});

app.listen(port);
console.log("Server started on http://localhost:" + port);