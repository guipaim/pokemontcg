// Setup server, session and middleware here.

/*
You will have the following middleware functions:

1. This middleware will apply to the root route / (note, a middleware applying to the root route is the same as a middleware that fires for every request) and will do one of the following: 

A. This middleware will log to your console for every request made to the server, with the following information:

Current Timestamp: new Date().toUTCString()
Request Method: req.method
Request Route: req.originalUrl
Some string/boolean stating if a user is authenticated
There is no precise format you must follow for this. The only requirement is that it logs the data stated above.

An example would be:

[Sun, 14 Apr 2019 23:56:06 GMT]: GET / (Non-Authenticated User)
[Sun, 14 Apr 2019 23:56:14 GMT]: POST /login (Non-Authenticated User)
[Sun, 14 Apr 2019 23:56:19 GMT]: GET /protected (Authenticated User)
[Sun, 14 Apr 2019 23:56:44 GMT]: GET / (Authenticated User)
B. After you log the request info in step A,  if the user is authenticated AND they have a role of admin, the middleware function will redirect them to the /admin route, if the user is authenticated AND they have a role of user, you will redirect them to the /protected route. If the user is NOT authenticated, you will redirect them to the GET /login route. 

2. This middleware will only be used for the GET /login route and will do one of the following: If the user is authenticated AND they have a role of admin, the middleware function will redirect them to the /admin route, if the user is authenticated AND they have a role of user, you will redirect them to the /protected route. If the user is NOT authenticated, you will allow them to get through to the GET /login route. A logged in user should never be able to access the login form.

 3. This middleware will only be used for the GET /register route and will do one of the following: If the user is authenticated AND they have a role of admin, the middleware function will redirect them to the /admin route, if the user is authenticated AND they have a role of user, you will redirect them to the /protected route. If the user is NOT authenticated, you will allow them to get through to the GET /register route. A logged in user should never be able to access the registration form.

4. This middleware will only be used for the GET /protected route and will do one of the following:

If a user is not logged in, you will redirect to the GET /login route.
If the user is logged in, the middleware will "fall through" to the next route calling the next() callback.
Users with both roles admin or user should be able to access the /protected route, so you simply need to make sure they are authenticated in this middleware.
5. This middleware will only be used for the GET /admin route and will do one of the following:

If a user is not logged in, you will redirect to the GET /login route.
If a user is logged in, but they are not an admin user, you will redirect to /error and render a HTML error page saying that the user does not have permission to view the page, and the page must issue an HTTP status code of 403.
If the user is logged in AND the user has a role of admin, the middleware will "fall through" to the next route calling the next() callback.
ONLY USERS WITH A ROLE of admin SHOULD BE ABLE TO ACCESS THE /admin ROUTE!
6. This middleware will only be used for the GET /logout route and will do one of the following:

1. If a user is not logged in, you will redirect to the GET /login route.

2. if the user is logged in, the middleware will "fall through" to the next route calling the next() callback.

*/
import middleware from "./middleware.js";
import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";

/*
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(middleware.logging);

app.use(session({
      name: "AuthState",
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.engine("handlebars",exphbs.engine({defaultLayout: "main"}));
  app.set('view engine', 'handlebars');
  app.use(configRoutes);
  //configRoutes(app);

  app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });*/
  
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setting up session middleware
app.use(
  session({
    name: "AuthState",
    secret: "lab10 secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Using middlewares
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: {
        roleCheck: function (a, b) {
          return a === b;
        },
      },
  })
);
app.use('/public', express.static('public'));

app.use(middleware.logging);
app.get("/", middleware.registerRedirect, (req, res) => {
  res.send("You should not be here");
});

app.get("/logout", middleware.logoutRedirect, (req, res) => {
  res.clearCookie("AuthState");
  req.session.destroy((e) => {
    if (e) {
      console.error("Error destroying session:", e);
    }
    res.render("logout");
  });
});
app.set("view engine", "handlebars");
configRoutes(app)

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });