const { askGemini } = require("../services/ai.service");

const Attendance = require("../models/attendance.model");
const Student = require("../models/students.model");


const queryAIController = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const user = req.user;

        // Only student for now
        if (user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "AI assistant is currently available for students only"
            });
        }

        // Find logged-in student's profile
        const student = await Student.findOne({
            userId: user.id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        // Get student's attendance
        const attendance = await Attendance.find({
            studentId: student._id
        });

        // Calculate attendance
        const totalClasses = attendance.length;

        const presentClasses = attendance.filter(
            record => record.status === "present"
        ).length;

        const lateClasses = attendance.filter(
            record => record.status === "late"
        ).length;

        const absentClasses = attendance.filter(
            record => record.status === "absent"
        ).length;

        const attendancePercentage =
            totalClasses > 0
                ? ((presentClasses + lateClasses) / totalClasses) * 100
                : 0;

        const attendanceData = {
            totalClasses,
            presentClasses,
            lateClasses,
            absentClasses,
            attendancePercentage: Number(attendancePercentage.toFixed(2))
        };

        // Send only relevant data to Gemini
        const prompt = `
You are a Smart ERP AI Assistant.

Answer the student's question using ONLY the attendance data provided.

Attendance Data:
${JSON.stringify(attendanceData)}

Student Question:
${question}

If the provided data is not enough to answer the question,
clearly say that the required information is not available.
`;

        const answer = await askGemini(prompt);

        return res.status(200).json({
            success: true,
            question: question.trim(),
            attendance: attendanceData,
            answer
        });

    } catch (error) {
        console.error("AI Query Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};


module.exports = {
    queryAIController
};