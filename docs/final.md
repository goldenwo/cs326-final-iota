# Team Iota

## [Stonks](https://cs326-final-iota.herokuapp.com/)

## Fall 2020 

## Overview:
Stonks is a website that allows the user to track their stock portfolio and see how it is performing. The user is able to create an account and log in. They will be able to see rankings of other user's portfolios compared to theirs. On the sidebars they will also be able to see trending portfolios and track their own portfolio.

One unique way that Stonks is different compared to other investing sites is the groups page that has the different groups of investors that the user is currently in. 

## Team Members: 
- Golden Wo: @goldenwo
- Zachary Simonelli: @zsimonelli
- William Parsons: @wparsons1

## User Interface:

## Index
![Index](final_img/Index.png)
Homepage is the landing page for our website. This is where users start off and can then login or create an account.

## Login
![Login](final_img/Login.png)
This is where users login to our website.

## Register
![Register](final_img/Register.png)
This is where users can create an account. If successfull in creating an account, the site will prompt user to login.

## Rankings 
![Rankings](final_img/Rankings.png)
This is the rankings page where users can see how they match up against other users. There is also sidebars where you can see trending portfolios and your own portfolio.

## Groups
![Groups](final_img/Groups.png)
This is the groups page where users can see groups they are apart. The sidebar is still visible on this page.

## User
![User](final_img/User.png)
This is the user page where users can search any stocks on the market. 

## APIs: A final up-to-date list/table describing your application’s API

| API Route       | Description                                                                        |
|-----------------|------------------------------------------------------------------------------------|
| /               | Checks for logged in user and sends userID as a response                           |
| /login          | GET: redirects to login.html, POST: authenticates login info and redirects         |
| /logout         | Logs user out and redirects to login.html                                          |
| /register       | GET: redirects to register.html, POST: adds user to database and redirects         |
| /private        | Checks for logged in user and redirects to user page                               |
| /priate/:userID | Checks for logged in user and shows logout button, if not logged in, redirect      |
| /getRankings    | Sends a stringified JSON object of all rankings to response                        |
| /addRanking     | Adds a ranking from a name and percentage to the rankings database                 |
| /getGroups      | Sends a stringified JSON object of all groups to response                          |
| /addGroup       | Adds a group from a name to the groups database                                    |
| /getPorfolios   | Sends a stringified JSON object of all portfolios to response                      |
| /addPortfolio   | Adds a portfolio from a name, author, stock, and shares to the portfolios database |
| /stockInfo      | Takes an input of a stock symbol and sends back the price and percent change info  |
| *               | Sends an error to all pages and endpoints that does not exist                      |

## Database:

1. Groups

| Column       | Data Type | Description                    |
|--------------|-----------|--------------------------------|
| name         | text      | The name of the group          |

This table stores the name of the specific group that any number of users could be apart of. 

2. Portfolios

| Column       | Data Type | Description                    |
|--------------|-----------|--------------------------------|
| name         | text      | The name of the portfolio      |
| author       | text      | The author of the portfilio    |
| stock        | text      | The stocks in the portfolio    |
| shares       | integer   | The # of shares of stock       |

This table holds all of the portfolio information needed. This includes the name of the portfolio, the investor behind it, the stocks in the portfolio and the number of shares associated with each stock. These will be used to show users specific portfolios where they will be able to see more details that explains the user's percentage gain or loss.

3. Rankings

| Column       | Data Type | Description                    |
|--------------|-----------|--------------------------------|
| name         | text      | The name of the investor       |
| percentage   | integer   | Percentage positive or negative|

This table holds the rankings information from the website. This includes the names of all of the individual investors which are all linked to a percentage integer. This can be used to rank the user based off of positive percentage gain in the stock market off of their investments. 

4. Users

| Column          | Data Type | Description                    |
|-----------------|-----------|--------------------------------|
| username        | text      | Username of user               |
| salt            | text      | Salt for password              |
| hash            | text      | Encrypted vers of password     |
| assigned_group  | text      | Which groups user is assigned  |

This table holds all of the users information, which includes username, salt, hash, and assigned group. There are essential to determing users accounts and which group each user is in. There is a hash for the password which is used for password authentication. There is also an additional salt added onto the password which then alters the hash value. 

## URL Routes/Mappings:

1. Home Page : https://cs326-final-iota.herokuapp.com/
2. Login : https://cs326-final-iota.herokuapp.com/login.html
3. Register : https://cs326-final-iota.herokuapp.com/register.html
4. Rankings : https://cs326-final-iota.herokuapp.com/rankings.html
5. Groups : https://cs326-final-iota.herokuapp.com/groups.html
6. User Information : https://cs326-final-iota.herokuapp.com/user.html

## Authentication/Authorization:

Users are authenticated using the passport api that we learned from class. Each user would first register on the registration page, then javascript code runs to ensure all fields are valid. Afterwards, it sends the information to our endpoint and updates the database with the information. For the login, it compares the information retreived from the database that matches the login username to the hashed password and salt using miniCrpyt.js. The user.html page would not be accessible until the user logged on and is authenticated.

## Division of Labor: 
William Parsons: 
- Designed Groups html page
- Worked on homepage html page and main.css 
- Provided explanations for wireframe / pages, helped edit wireframes. 
- Helped create login.js
- Helped create register.js
- Connected github repo to Heroku + deployed and worked on bug fixes
- Helped write all milestones
- Added rubric material and instructions to setup.md

Zachary Simonelli:
- Helped design wireframes
- Coded user.js
- Helped design/code all html pages
- Linked html pages
- Helped with server communication
- Worked on styling through css and bootstrap

Golden Wo:
- Worked on server-sided enpoints
- Worked on login/registration functions
- Worked on user authentication
- Helped design wireframes
- Helped create databases
- Worked on creating sidebars of our pages
- Worked on creating css file for our pages

## Conclusion: 

Our group's experience working on this semester's project was that we learned a lot while working on it while at the same time it was pretty difficult. Creating all parts of the web design process and combining them all together was not an easy task. This project helped us see how all of these aspects all worked together to create a final product. We thought the design and layout was easier to work with, and the javascript gave us some trouble once we started trying to integrate the website with the database. The harder parts of the project were our difficulties working on the yahoo finance API. There was little support from the developers and ultimately we did not get it working which was a large part of our proposal for the interactive website. Dealing with async functions, promises, and updating the databases was hard for us. We didn’t really understand how async functions returned data, especially using pg promises and database queries. The login functionality took us a bit of time to figure out too due to how confusing the database integration was. Another factor that added to the confusion was how information was sent back and forth through endpoints using res.send and other similar functions. Overall, most issues we faced were server-sided, while the client sided things were easier to work with. If we were to continue working on this project we would work to get the stock api to function which would greatly benefit the whole website's functionality. 
