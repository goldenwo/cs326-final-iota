## Milestone 3

# Database Documentation 
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

# Division of Labor
Golden Wo: Worked on implementing login features using passport and express session, helped work on implementing databases to the server, fixed some linking issues on different pages.
Zachary Simonelli: Created user page and backend functionality, worked on page linking, worked on implementing finance api and created stock ticker autocomplete search bar.
William Parsons: Worked on Heroku Implementation, Password problem, helped fix bugs with modules, Wrote Milestone 3.md
