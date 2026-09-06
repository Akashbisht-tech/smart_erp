const userModel = require("../models/user.model");
const subjectModel = require("../models/subject.model");
const DepartmentModel = require("../models/department.model");
const FacultySubjectModel = require("../models/facultySubject.model");
const facultyModel = require("../models/faculty.model");


async function getAllUser(req, res){
    const users = await userModel.find();
    if(users.length === 0){
        return res.status(200).json({
            message : "No users found" 
        })
    }
    res.status(200).json({
            message : "Users fetched successfully",
            users 
        })
}

async function getUserById(req, res){
    
    const { id } = req.params;
    
    // const user = await userModel.findById(id);
    const user = await userModel.findById(id).select("-password");
    if(!user){
        return res.status(404).json({
            message : "user not found"
        })
    }

    res.status(200).json({
        message : "user found",
        user
    })

}

async function updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["student", "faculty", "admin"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid role"
        });
    }

    const user = await userModel.findById(id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
        message: "User role updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
}

async function createDepartment(req, res){
    const {
        name,
        code,
        description,
        hodId,
        establishedYear,
        isActive
    } = req.body;

    const name1 = await DepartmentModel.findOne({name});
    const code1 = await DepartmentModel.findOne({code});
    
    if(name1 || code1){
        return res.status(409).json({
            message : "department already exits"
        })
    }

    const department = await DepartmentModel.create({
        name,
        code,
        description,
        hodId,
        establishedYear,
        isActive
    });

    res.status(201).json({
        message : "department created",
        department
    })
}

async function getAllDepartments(req, res) {
    const departments = await DepartmentModel.find();

    if (departments.length === 0) {
        return res.status(200).json({
            message: "No departments found"
        });
    }

    res.status(200).json({
        message: "Departments fetched successfully",
        departments
    });
}

async function createSubject(req, res) {
    const {
        name,
        code,
        departmentId,
        semester,
        credits,
        type,
        description,
        isActive
    } = req.body;

    const existingSubject = await subjectModel.findOne({ code });

    if (existingSubject) {
        return res.status(409).json({
            message: "Subject already exists"
        });
    }

    const subject = await subjectModel.create({
        name,
        code,
        departmentId,
        semester,
        credits,
        type,
        description,
        isActive
    });

    res.status(201).json({
        message: "Subject created successfully",
        subject
    });
}

async function getAllSubjects(req, res) {
    const subjects = await subjectModel.find();

    if (subjects.length === 0) {
        return res.status(200).json({
            message: "No subjects found"
        });
    }

    res.status(200).json({
        message: "Subjects fetched successfully",
        subjects
    });
}

async function assignFacultyToSubject(req, res){
    const {facultyId , subjectId} = req.body;

    const faculty = await facultyModel.findById(facultyId);

    if (!faculty) {
        return res.status(404).json({
            message: "Faculty not found"
        });
    }

    const subject = await subjectModel.findById(subjectId);

    if (!subject) {
        return res.status(404).json({
            message: "Subject not found"
        });
    }

    const alreadyAssigned = await FacultySubjectModel.findOne({
        facultyId,
        subjectId
    });

    if(alreadyAssigned){
        return res.status(404).json({
            message: "already assign"
        });
    }


    const assignSubToFaculty = await FacultySubjectModel.create({
        facultyId,
        subjectId
    })

    res.status(201).json({
        message: "Faculty assigned to subject successfully",
        assignSubToFaculty
    });
}



module.exports = {
    getAllUser,
    getUserById,
    updateUserRole,
    createDepartment,
    getAllDepartments,
    createSubject,
    getAllSubjects,
    assignFacultyToSubject
}