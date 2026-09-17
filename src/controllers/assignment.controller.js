const assignmentModel = require("../models/assignments.model");
const facultyModel = require("../models/faculty.model");
const studentModel = require("../models/students.model");
const submissionModel = require("../models/submissions.model");


const {
    createNotification
} = require("./notification.controller");




async function createAssignment(req, res) {
    try {
        const {
            title,
            description,
            subjectId,
            assignedTo,
            dueDate,
            maxMarks,
            attachment,
            status
        } = req.body;

        // Find faculty using logged-in user
        const faculty = await facultyModel.findOne({
            userId: req.user.id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        const assignment = await assignmentModel.create({
            title,
            description,
            subjectId,
            facultyId: faculty._id,
            assignedTo,
            dueDate,
            maxMarks,
            attachment,
            status
        });

        res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating assignment",
            error: error.message
        });
    }
}

async function listAssignments(req, res) {
    try {
        const assignments = await assignmentModel.find()
            .populate("subjectId", "name code")
            .populate("facultyId", "facultyId designation")
            .populate("assignedTo", "name code");

        res.status(200).json({
            message: "Assignments fetched successfully",
            assignments
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching assignments",
            error: error.message
        });
    }
}

async function submitAssignment(req, res) {
    try {
        const { id } = req.params;
        const { fileUrl } = req.body;

        // Find assignment
        const assignment = await assignmentModel.findById(id);

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Find student using logged-in user
        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Check whether already submitted
        const existingSubmission = await submissionModel.findOne({
            assignmentId: id,
            studentId: student._id
        });

        if (existingSubmission) {
            return res.status(400).json({
                message: "Assignment already submitted"
            });
        }

        // Check late submission
        const status = new Date() > new Date(assignment.dueDate)
            ? "late"
            : "submitted";

        const submission = await submissionModel.create({
            assignmentId: id,
            studentId: student._id,
            fileUrl,
            status
        });

        res.status(201).json({
            message: "Assignment submitted successfully",
            submission
        });

    } catch (error) {
        res.status(500).json({
            message: "Error submitting assignment",
            error: error.message
        });
    }
}

async function assignmentStatus(req, res) {
    try {
        const { id } = req.params;

        // Find logged-in student
        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Find submission
        const submission = await submissionModel.findOne({
            assignmentId: id,
            studentId: student._id
        })
        .populate("assignmentId", "title description dueDate maxMarks status");

        if (!submission) {
            return res.status(200).json({
                message: "Assignment not submitted",
                status: "pending"
            });
        }

        res.status(200).json({
            message: "Assignment status fetched successfully",
            submission
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching assignment status",
            error: error.message
        });
    }
}

async function generateAssignmentAlerts() {
    try {
        const now = new Date();

        const tomorrow = new Date();
        tomorrow.setHours(
            tomorrow.getHours() + 24
        );

        // Find assignments due within next 24 hours
        const assignments = await assignmentModel.find({
            dueDate: {
                $gte: now,
                $lte: tomorrow
            },
            status: "published"
        });

        for (const assignment of assignments) {

            // Find students of the assignment department
            const students = await studentModel.find({
                departmentId: assignment.assignedTo
            });

            for (const student of students) {

                // Check whether student already submitted
                const submission = await submissionModel.findOne({
                    assignmentId: assignment._id,
                    studentId: student._id
                });

                // If not submitted
                if (!submission) {

                    await createNotification({
                        userId: student.userId,

                        title: "Assignment Due Soon",

                        message:
                            `${assignment.title} is due soon. Please submit it before the deadline.`,

                        type: "smart_alert",

                        relatedId: assignment._id
                    });
                }
            }
        }

    } catch (error) {
        console.error(
            "Assignment smart alert error:",
            error.message
        );
    }
}

module.exports = {
    createAssignment,
    listAssignments,
    submitAssignment,
    assignmentStatus,
    generateAssignmentAlerts
};