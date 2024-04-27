import {
  dbConnection,
  closeConnection,
} from "./mongoConfig/mongoConnection.js";
import * as pokeMongo from "./data/pokemonMongo.js";
import * as pokeAPI from "./data/pokemonAPI.js";
import express from "express";
import session from "express-session";
import exphbs from "express-handlebars";
const app = express();
import configRoutes from "./routes/index.js";
import { createUserTest } from "./test/createUserTest.js";

app.use(
  session({
    name: "AuthState",
    secret: "mySecretKey_2024$#*@!092&*(9dkjfhskdhf",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

try {
  await dbConnection();
} catch (err) {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
}
console.log("Connected to MongoDB");

app.use((req, res, next) => {
  const isAuthenticated = req.session.user && req.session.user;
  const userRole = isAuthenticated
    ? "Authenticated User"
    : "Non-Authenticated User";
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    } (${userRole})`
  );

  if (req.originalUrl === "/") {
    if (isAuthenticated) {
      return res.redirect("/protected");
    } else {
      return res.redirect("/login");
    }
  } else {
    next();
  }
});

app.use("/login", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (isAuthenticated) {
      return res.redirect("/protected");
    }
  }
  next();
});

app.use("/register", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (isAuthenticated) {
      return res.redirect("/protected");
    }
  }
  next();
});

app.use("/trade", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (!isAuthenticated) {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/ranking", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (!isAuthenticated) {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/trade/:userName", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (!isAuthenticated) {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/viewtrades", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (!isAuthenticated) {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/protected", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (!isAuthenticated) {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/protected/:id", (req, res, next) => {
  if (req.method === "GET") {
    const isAuthenticated = req.session && req.session.user;
    if (!isAuthenticated) {
      return res.redirect("/login");
    }
  } else {
    next();
  }
  next();
});

app.use("/logout", (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  next();
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// runs every 5 minutes
configRoutes(app);
await pokeMongo.loadAllCards();


// runs check every 5 minutes, collection grows every 10 minutes from last update (depends on time user was last updated)
setInterval(() => pokeMongo.growCollection(), 300000);
// reward top 3 players every 15 minutes
setInterval(() => pokeMongo.rewardTop3Players(), 900000);

//uncomment this to seed user accounts
createUserTest();
