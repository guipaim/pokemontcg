
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
import { createUserTest } from "./test/createUserTest.js"

app.use(
  session({
    name: "AuthState",
    secret: "mySecretKey_2024$#*@!092&*(9dkjfhskdhf",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/public", express.static("public"));

try {
  await dbConnection();
} catch (err) {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
}
console.log("Connected to MongoDB");
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use((req, res, next) => {
  const isAuthenticated = req.session.user
    ? "Authenticated User"
    : "Non-Authenticated User";
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    } (${isAuthenticated})`
  );
  next();
});

configRoutes(app);

app.get("/", (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      res.redirect("/admin");
    } else if (req.session.user.role === "user") {
      res.redirect("/protected");
    }
  } else {
    res.redirect("/login");
  }
});

app.use((req, res, next) => {
  res.status(404).render("/error", { error: "404: Page Not Found" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

pokeMongo.loadAllCards();
//uncomment this to seed user accounts
createUserTest();

