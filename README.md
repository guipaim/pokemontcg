# pokemontcg

This is a Pokemon Trading Card Game Web Application

In order to run:

1. type into command line: npm start
2. navigate to http://localhost:3000 on your web browser
3. You will be taken to our login page, please click the register link and it will allow you to register, and then after creating the account you can redirect to the login page
4. Log in and you will see our home page and any pending friend requests
5. You will have 5 options: Trade Now, View Trades, Search Users, List of Friends, Ranking Chart, View Collections
6. Trade Now: Page where you can search for user to trade with
7. View Trades: Page where you can view trades you currently have, outgoing and incoming, and allows you to either accept or decline incoming requests
8. Search Users: Search for users so that you can add them as a Friends and view the users collections
9. List of friends: View your list of friends that you currently have
10. Ranking chart: Shows you the ranking of various users that have an account, based on their card rankings
11. View Collections: Allows you to select another user to view their selection

After 20,000 request, the API https://pokemontcg.io/ will automatically throttle and deny our API requests and throw a 429 error. In this event, you would need to generated a new API key and replace the old one in /data/pokemonAPI.js

https://github.com/guipaim/pokemontcg