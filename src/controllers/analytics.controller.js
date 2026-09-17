const attendanceModel = require("../models/attendance.model");
const marksModel = require("../models/marks.model");
const studentModel = require("../models/students.model");
const subjectModel = require("../models/subject.model");



async function getAttendanceAnalytics(req, res) {
    try {

        // Find logged-in student
        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }


        // Get subject-wise attendance
        const attendance = await attendanceModel.aggregate([

            {
                $match: {
                    studentId: student._id
                }
            },

            {
                $group: {
                    _id: "$subjectId",

                    totalLectures: {
                        $sum: 1
                    },

                    presentLectures: {
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
                    totalLectures: 1,
                    presentLectures: 1,

                    percentage: {
                        $multiply: [
                            {
                                $divide: [
                                    "$presentLectures",
                                    "$totalLectures"
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
                message: "no attendance data found"
            });
        }


        // Get subject names
        const result = await Promise.all(

            attendance.map(async (item) => {

                const subject = await subjectModel.findById(
                    item.subjectId
                );

                return {
                    subject: subject
                        ? subject.code
                        : "Unknown",

                    totalLectures: item.totalLectures,

                    presentLectures: item.presentLectures,

                    percentage: Number(
                        item.percentage.toFixed(2)
                    ),

                    status:
                        item.percentage < 75
                            ? "Low"
                            : "Good"
                };
            })
        );


        res.status(200).json({
            message: "attendance analytics fetched successfully",
            attendance: result
        });

    } catch (error) {

        res.status(500).json({
            message: "failed to fetch attendance analytics",
            error: error.message
        });
    }
}


async function getMarksAnalytics(req, res) {
    try {

        // Find logged-in student
        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }


        // Get marks
        const marks = await marksModel.find({
            studentId: student._id
        })
        .populate("subjectId", "name code");


        if (marks.length === 0) {
            return res.status(404).json({
                message: "no marks data found"
            });
        }


        let totalObtained = 0;
        let totalMaximum = 0;


        const result = marks.map((item) => {

            totalObtained += item.marksObtained;
            totalMaximum += item.maxMarks;


            const percentage =
                (item.marksObtained / item.maxMarks) * 100;


            return {

                subject: item.subjectId
                    ? item.subjectId.code
                    : "Unknown",

                marksObtained: item.marksObtained,

                maxMarks: item.maxMarks,

                percentage: Number(
                    percentage.toFixed(2)
                ),

                performance:
                    percentage >= 75
                        ? "Good"
                        : percentage >= 50
                            ? "Average"
                            : "Low"
            };
        });


        const overallPercentage =
            (totalObtained / totalMaximum) * 100;


        res.status(200).json({

            message: "marks analytics fetched successfully",

            overallPercentage:
                Number(overallPercentage.toFixed(2)),

            totalObtained,

            totalMaximum,

            subjects: result
        });

    } catch (error) {

        res.status(500).json({
            message: "failed to fetch marks analytics",
            error: error.message
        });
    }
}


async function getRiskAnalysis(req, res) {
    try {

        // Find logged-in student
        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "student not found"
            });
        }


        // ==========================
        // ATTENDANCE
        // ==========================

        const attendance = await attendanceModel.aggregate([

            {
                $match: {
                    studentId: student._id
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
                                    $eq: [
                                        "$status",
                                        "present"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);


        let attendancePercentage = 0;


        if (attendance.length > 0) {

            attendancePercentage =
                (attendance[0].present /
                    attendance[0].total) * 100;
        }


        // ==========================
        // MARKS
        // ==========================

        const marks = await marksModel.find({
            studentId: student._id
        });


        let marksPercentage = 0;


        if (marks.length > 0) {

            const totalObtained = marks.reduce(
                (sum, item) =>
                    sum + item.marksObtained,
                0
            );

            const totalMaximum = marks.reduce(
                (sum, item) =>
                    sum + item.maxMarks,
                0
            );


            marksPercentage =
                (totalObtained /
                    totalMaximum) * 100;
        }


        // ==========================
        // RISK CALCULATION
        // ==========================

        let riskLevel = "Low";

        const reasons = [];


        if (attendancePercentage < 75) {

            reasons.push(
                "Attendance is below 75%"
            );
        }


        if (marksPercentage < 50 && marks.length > 0) {

            reasons.push(
                "Academic performance is low"
            );
        }


        // High Risk
        if (
            attendancePercentage < 60 ||
            (marksPercentage < 40 && marks.length > 0)
        ) {

            riskLevel = "High";

        }

        // Medium Risk
        else if (
            attendancePercentage < 75 ||
            (marksPercentage < 60 && marks.length > 0)
        ) {

            riskLevel = "Medium";
        }


        res.status(200).json({

            message: "risk analysis completed",

            attendancePercentage:
                Number(
                    attendancePercentage.toFixed(2)
                ),

            marksPercentage:
                Number(
                    marksPercentage.toFixed(2)
                ),

            riskLevel,

            reasons
        });

    } catch (error) {

        res.status(500).json({
            message: "failed to perform risk analysis",
            error: error.message
        });
    }
}


module.exports = {
    getAttendanceAnalytics,
    getMarksAnalytics,
    getRiskAnalysis
};