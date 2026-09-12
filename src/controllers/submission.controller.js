const submissionModel = require("../models/submissions.model");
const assignmentModel = require("../models/assignments.model");
const studentModel = require("../models/students.model");

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

module.exports = {
    submitAssignment
}