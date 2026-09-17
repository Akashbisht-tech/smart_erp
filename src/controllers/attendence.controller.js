const attendanceModel = require("../models/attendance.model");
const studentModel = require("../models/students.model");
const subjectModel = require("../models/subject.model");
const userModel = require("../models/user.model");
const facultyModel = require("../models/faculty.model");

const {
    createNotification
} = require("./notification.controller");


// =========================
// MARK ATTENDANCE
// =========================
async function markAttendence(req, res) {
    try {
        const {
            studentId,
            subjectId,
            date,
            status,
            lectureNumber
        } = req.body;

        const isStudentExist = await studentModel.findById(studentId);

        if (!isStudentExist) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        const isSubjectExist = await subjectModel.findById(subjectId);

        if (!isSubjectExist) {
            return res.status(404).json({
                message: "subject not found"
            });
        }

        const faculty = await facultyModel.findOne({
            userId: req.user.id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "faculty not found"
            });
        }

        const attendance = await attendanceModel.create({
            studentId,
            subjectId,
            facultyId: faculty._id,
            date,
            status,
            lectureNumber
        });


        // =========================
        // SMART ATTENDANCE ALERT
        // =========================

        const attendanceData = await attendanceModel.aggregate([
            {
                $match: {
                    studentId: isStudentExist._id,
                    subjectId: subjectId
                }
            },
            {
                $group: {
                    _id: null,

                    total: {
                        $sum: 1
                    },

                    present: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "present"]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);


        if (attendanceData.length > 0) {

            const total = attendanceData[0].total;
            const present = attendanceData[0].present;

            const percentage = (present / total) * 100;


            // If attendance is below 75%
            if (percentage < 75) {

                await createNotification({
                    userId: isStudentExist.userId,

                    title: "Low Attendance Alert",

                    message:
                        `Your attendance in ${isSubjectExist.code} is ${percentage.toFixed(2)}%. Please maintain at least 75% attendance.`,

                    type: "smart_alert",

                    relatedId: subjectId
                });
            }
        }


        res.status(201).json({
            message: "attendance marked successfully",
            attendance
        });

    } catch (error) {

        res.status(500).json({
            message: "failed to mark attendance",
            error: error.message
        });
    }
}


// =========================
// GET STUDENT ATTENDANCE
// =========================
async function getStudentAttendance(req, res) {

    const userId = req.user.id;

    const student = await studentModel.findOne({
        userId: userId
    });

    if (!student) {
        return res.status(404).json({
            message: "student not found"
        });
    }

    const findStudnetAttendence = await attendanceModel.find({
        studentId: student._id
    })
        .populate("subjectId")
        .populate("facultyId");

    if (findStudnetAttendence.length === 0) {
        return res.status(404).json({
            message: "no attendance record found"
        });
    }

    const attendance = findStudnetAttendence.map((item) => ({
        subject: item.subjectId.code,
        teacher: item.facultyId.facultyId,
        date: item.date,
        status: item.status,
        lectureNumber: item.lectureNumber
    }));

    res.status(200).json({
        message: "attendance fetched successfully",
        attendance
    });
}


// =========================
// GET ATTENDANCE PERCENTAGE
// =========================
async function getAttendancePercentage(req, res) {

    try {

        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }

        const attendance = await attendanceModel.aggregate([

            {
                $match: {
                    studentId: student._id
                }
            },

            {
                $group: {

                    _id: "$subjectId",

                    total: {
                        $sum: 1
                    },

                    present: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "present"]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },

            {
                $project: {

                    _id: 0,

                    subjectId: "$_id",

                    total: 1,

                    present: 1,

                    percentage: {
                        $multiply: [
                            {
                                $divide: [
                                    "$present",
                                    "$total"
                                ]
                            },
                            100
                        ]
                    }
                }
            }
        ]);


        if (attendance.length === 0) {
            return res.status(404).json({
                message: "no attendance record found"
            });
        }


        const result = await Promise.all(

            attendance.map(async (item) => {

                const subject = await subjectModel.findById(
                    item.subjectId
                );

                return {

                    subject: subject
                        ? subject.code
                        : "Unknown",

                    present: item.present,

                    total: item.total,

                    percentage: item.percentage
                };
            })
        );


        res.status(200).json({

            message:
                "attendance percentage fetched successfully",

            attendance: result
        });

    } catch (error) {

        res.status(500).json({

            message:
                "failed to fetch attendance percentage",

            error: error.message
        });
    }
}


module.exports = {

    markAttendence,

    getStudentAttendance,

    getAttendancePercentage
};