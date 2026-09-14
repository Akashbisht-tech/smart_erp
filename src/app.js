const express = require("express");
const cookieParser = require("cookie-parser");


const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routers/auth.route");
const studentRouter = require("./routers/student.route");
const facultyRouter = require("./routers/faculty.route");
const adminRouter = require("./routers/admin.route");
const attendanceRouter = require("./routers/attendence.route");
const marksRouter = require("./routers/marks.route");
const assignmentRouter = require("./routers/assignment.router");

const timetableRouter = require("./routers/timetable.router");



const path = require("path");

app.use("/uploads",express.static(path.join(__dirname, "uploads"))
);

/**
 * register, login, refresh, logout
 */
app.use("/api/auth", authRouter );

/**
 * profile, dashboard, academic data
 */
app.use("/api/student", studentRouter );

/**
 * profile, assigned subjects
 */
app.use("/api/faculty", facultyRouter)


/**
 * users, departments, subjects, management
 */
app.use("/api/admin", adminRouter )

/**
 * mark, update, student attendance, percentage
 */
app.use("/api/attendance", attendanceRouter)

/**
 * create, update, student marks, performance
 */
app.use("/api/marks", marksRouter)


/**
 * create, list, submit, statu
 */
app.use("/api/assignments", assignmentRouter)

/**
 * create, update, student/faculty timetable
 */

app.use("/api/timetable", timetableRouter )

module.exports = app;

