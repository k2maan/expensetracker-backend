require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("./db/connection");
const expenses = require("./models/expenseSchema");
const Income = require("./models/incomeSchema");
const User = require("./models/userSchema");
var cors = require("cors");
const expense = require("./routes/expense");
const auth = require("./routes/auth");
const income = require("./routes/income");
const passport = require("passport");
const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());

// app.use('/register',require('./routes/router'))
app.use(cors(
    {
        origin: ["https://budgetbuddy.vercel.app"],
        methods: ["POST", "GET"],
        credentials: true
    }
));

app.get("/", (req, res) => {
  res.json("server start");
});

app.use(expense);
app.use(auth);
app.use(income);
app.use(passport.initialize());
app.use(passport.session());

app.listen(port, () => {
  console.log(`server is start port number ${port}`);
});
