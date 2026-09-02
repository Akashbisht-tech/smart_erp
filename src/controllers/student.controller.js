const studentModel = require("../models/students.model");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt  = require("jsonwebtoken");


async function createStudentProfile(req, res){
    const {
        userId,
        studentId,
        rollNumber,
        departmentId,
        semester,
        section,
        admissionYear,
        dateOfBirth,
        gender,
        address,
        guardianName,
        guardianPhone
    } = req.body;

    const student = await studentModel.findOne({ userId });

    if (student) {
        return res.status(409).json({
            message: "Student profile already exists"
        });
    }


    const newStudent = await studentModel.create({
        userId,
        studentId,
        rollNumber,
        departmentId,
        semester,
        section,
        admissionYear,
        dateOfBirth,
        gender,
        address,
        guardianName,
        guardianPhone
    });

     res.status(201).json({
        message: "Student profile created",
        student: newStudent
    });
}


async function getStudentDashboard(req, res){
    console.log(req.user.id);
    const student = await studentModel.findOne({userId : req.user.id});

    if (!student) {
        return res.status(404).json({
            message: "Student profile not found"
        });
    }
    const user = await userModel.findOne({_id : req.user.id});
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.status(200).json({
        message: "Student dashboard",
        student: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            studentId: student.studentId,
            rollNumber: student.rollNumber,
            semester: student.semester,
            section: student.section,
            admissionYear: student.admissionYear,
            status: student.status
        }
    })
}


async function getAcademicData(req, res) {

    const student = await studentModel.findOne({
        userId: req.user.id
    });

    if (!student) {
        return res.status(404).json({
            message: "Student profile not found"
        });
    }

    res.status(200).json({
        message: "Academic data",
        academicData: {
            studentId: student.studentId,
            rollNumber: student.rollNumber,
            semester: student.semester,
            section: student.section
        }
    });
}

module.exports = {
    createStudentProfile,
    getStudentDashboard,
    getAcademicData
};
