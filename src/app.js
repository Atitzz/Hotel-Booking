const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();

const connectDB = require("./config/connectDB");
const configViewEngine = require("./config/viewEngine");
const router = require("./routes");

require("dotenv").config();
const config = process.env;

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("connect-flash")());

router(app);
configViewEngine(app);
connectDB();

app.listen(config.PORT, () => console.log(`listening on port ${config.PORT}`));
