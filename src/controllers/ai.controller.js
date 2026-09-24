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
        }).populate("subjectId", "name code");

        // -----------------------------------
        // Subject-wise Attendance Calculation
        // -----------------------------------

        const subjectWise = {};

        attendance.forEach(record => {

            const subjectId = record.subjectId._id.toString();

            // Create subject object if not already present
            if (!subjectWise[subjectId]) {
                subjectWise[subjectId] = {
                    subjectName: record.subjectId.name,
                    subjectCode: record.subjectId.code,
                    totalClasses: 0,
                    presentClasses: 0,
                    absentClasses: 0,
                    lateClasses: 0
                };
            }

            // Total classes
            subjectWise[subjectId].totalClasses++;

            // Present classes
            if (record.status === "present") {
                subjectWise[subjectId].presentClasses++;
            }

            // Absent classes
            if (record.status === "absent") {
                subjectWise[subjectId].absentClasses++;
            }

            // Late classes
            if (record.status === "late") {
                subjectWise[subjectId].lateClasses++;
            }
        });


        // -----------------------------------
        // Calculate Subject-wise Percentage
        // -----------------------------------

        Object.values(subjectWise).forEach(subject => {

            subject.attendancePercentage =
                subject.totalClasses > 0
                    ? Number(
                        (
                            (
                                subject.presentClasses +
                                subject.lateClasses
                            ) / subject.totalClasses * 100
                        ).toFixed(2)
                    )
                    : 0;
        });


        // Convert subjectWise object into array
        const subjects = Object.values(subjectWise);


        let lowestAttendanceSubject = null;

        if (subjects.length > 0) {
            lowestAttendanceSubject = subjects.reduce((lowest, current) => {
                return current.attendancePercentage <
                    lowest.attendancePercentage
                    ? current
                    : lowest;
            });
        }
        let highestAttendanceSubject = null;

        if (subjects.length > 0) {
            highestAttendanceSubject = subjects.reduce((highest, current) => {
                return current.attendancePercentage >
                    highest.attendancePercentage
                    ? current
                    : highest;
            });
        }
        


        // -----------------------------------
        // Overall Attendance Calculation
        // -----------------------------------

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


        const isEligibleFor75Percent = attendancePercentage >= 75;

        let classesNeededFor75Percent = 0;

        if (attendancePercentage < 75 && totalClasses > 0) {
            while (
                ((presentClasses + classesNeededFor75Percent) /
                    (totalClasses + classesNeededFor75Percent)) * 100 < 75
            ) {
                classesNeededFor75Percent++;
            }
        }

        let classesCanMiss = 0;

        if (attendancePercentage >= 75 && totalClasses > 0) {
            while (
                ((presentClasses) /
                    (totalClasses + classesCanMiss + 1)) * 100 >= 75
            ) {
                classesCanMiss++;
            }
        }
        // -----------------------------------
        // Final Attendance Data
        // -----------------------------------

        const attendanceData = {
            totalClasses,
            presentClasses,
            lateClasses,
            absentClasses,
            attendancePercentage: Number(attendancePercentage.toFixed(2)),
            subjects,
            lowestAttendanceSubject,
            highestAttendanceSubject,
            isEligibleFor75Percent,
            classesNeededFor75Percent,
            classesCanMiss
            
        };


        // -----------------------------------
        // Gemini Prompt
        // -----------------------------------

  const prompt = `
You are a Smart ERP AI Assistant.

Answer the student's question using ONLY the attendance data provided below.

Attendance Data:
${JSON.stringify(attendanceData)}

Student Question:
${question}

Rules:
1. Use only the provided attendance data.
2. For overall attendance questions, use the overall attendance values.
3. For specific subject questions, use the subjectCode or subjectName from the subjects array.
4. For lowest attendance questions, use lowestAttendanceSubject.
5. For highest attendance questions, use highestAttendanceSubject.
6. For 75% eligibility questions, use isEligibleFor75Percent.
7. For questions about how many classes are needed to reach 75%, use classesNeededFor75Percent.
8. For questions about how many classes can be missed, use classesCanMiss.
9. Do not perform a different calculation when the required calculated value is already provided.
10. Do not invent or assume any information.
11. If the required information is not available, clearly say that it is not available.
12. Keep the answer simple and clear.

Give a direct answer to the student's question.
`;

        // Ask Gemini
        const answer = await askGemini(prompt);


        // -----------------------------------
        // Final Response
        // -----------------------------------

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