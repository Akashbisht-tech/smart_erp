const express = require("express");
const cookieParser = require("cookie-parser");


const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routers/auth.route");
const studentRouter = require("./routers/student.route");


/**
 * register, login, refresh, logout
 */
app.use("/api/auth", authRouter );

/**
 * profile, dashboard, academic data
 */
app.use("/api/student", studentRouter );



module.exports = app;

