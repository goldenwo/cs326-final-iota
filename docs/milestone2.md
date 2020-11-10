# Server APIs
4 Different Endpoints for Various Functionalities on Site

## Accounts
This API allows for users to have individual accounts on the website. This allows them to have their own portfolios and track their own stocks and be apart of their own groups. It will prompt the user to login and there will be a username and password that links to a user id to be able to be connected to the users groups and portfolios. If the user is unsuccessful then they will be prompted to try again as there was an incorrect password / username. An example input would be user: WillyP, password: happy123, with an output of userID:9810

## Rankings
This API will allow individual users to be ranked on a scale on the rankings page. It will be able to retrieve user's portfolio gain % and returns to display an aggregate of who has the highest gain %. It will retrive user's information through utilizing the userID. You would be able to sort through the rankings by time horizons.

## Groups
This API will be behind the whole group system of the website where users can be placed into various groups with other users that form their own little ranking view. Instead of the rankings which are public and have all users, in the groups it will only show userIDs that are included in that group. The groups will also be able to make changes to the group such as add or remove users. 

## Portfolios
The portfolio API is based on the concept of always being able to see the user portfolio while navigating the website. The API will have various portfolio information specific to the user to be able to be displayed on the sidebars. All of this information is linked to the other APIs and the users through the userID which is the unique key that every user account possesses. 

## Screenshots

## URL 
https://cs326-final-iota.herokuapp.com/

## Division of Labor
William Parsons:
Zachary Simonelli:
Golden Wo: 