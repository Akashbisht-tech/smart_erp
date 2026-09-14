const timetableModel = require("../models/timetable.model");
const studentModel = require("../models/students.model");
const facultyModel = require("../models/faculty.model");

async function createTimetable(req, res) {
    try {
        const {
            departmentId,
            subjectId,
            facultyId,
            semester,
            section,
            day,
            startTime,
            endTime,
            room,
            type
        } = req.body;

        const timetable = await timetableModel.create({
            departmentId,
            subjectId,
            facultyId,
            semester,
            section,
            day,
            startTime,
            endTime,
            room,
            type
        });

        res.status(201).json({
            message: "Timetable created successfully",
            timetable
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating timetable",
            error: error.message
        });
    }
}

async function updateTimetable(req, res) {
    try {
        const { id } = req.params;

        const {
            departmentId,
            subjectId,
            facultyId,
            semester,
            section,
            day,
            startTime,
            endTime,
            room,
            type
        } = req.body;

        const timetable = await timetableModel.findByIdAndUpdate(
            id,
            {
                departmentId,
                subjectId,
                facultyId,
                semester,
                section,
                day,
                startTime,
                endTime,
                room,
                type
            },
            { new: true, runValidators: true }
        );

        if (!timetable) {
            return res.status(404).json({
                message: "Timetable not found"
            });
        }

        res.status(200).json({
            message: "Timetable updated successfully",
            timetable
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating timetable",
            error: error.message
        });
    }
}

async function getStudentTimetable(req, res) {
    try {
        // Find logged-in student
        const student = await studentModel.findOne({
            userId: req.user.id
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Find timetable according to student's details
        const timetable = await timetableModel.find({
            semester: student.semester,
            section: student.section
            /**
             * departmentId: student.departmentId,
             */
        })
        .populate("subjectId", "name code")
        .populate("facultyId", "facultyId designation")
        .populate("departmentId", "name");


        console.log({
            departmentId: student.departmentId,
            semester: student.semester,
            section: student.section
        });


        res.status(200).json({
            message: "Student timetable fetched successfully",
            timetable
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching student timetable",
            error: error.message
        });
    }
}


async function getFacultyTimetable(req, res) {
    try {
        // Find logged-in faculty
        const faculty = await facultyModel.findOne({
            userId: req.user.id
        });

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty profile not found"
            });
        }

        // Find timetable for this faculty
        const timetable = await timetableModel.find({
            facultyId: faculty._id
        })
        .populate("subjectId", "name code")
        .populate("departmentId", "name")
        .populate("facultyId", "facultyId designation");

        res.status(200).json({
            message: "Faculty timetable fetched successfully",
            timetable
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching faculty timetable",
            error: error.message
        });
    }
}

module.exports = {
    createTimetable,
    updateTimetable,
    getStudentTimetable,
    getFacultyTimetable
}