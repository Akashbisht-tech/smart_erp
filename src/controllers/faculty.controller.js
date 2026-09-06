const facultyModel = require("../models/faculty.model"); 
const userModel = require("../models/user.model");
const facultySubjectMOdel = require("../models/facultySubject.model");


async function createFacultyProfile(req, res) {

    const {
        userId,
        facultyId, 
        employeeId,
        departmentId, 
        designation, 
        qualification,
        specialization, 
        joiningDate, 
        phone, 
        officeRoom
    } = req.body;
    
    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (user.role !== "faculty") {
        return res.status(403).json({
            message: "User is not a faculty"
        });
    }

    const isFacultyExist = await facultyModel.findOne({userId});

    if(isFacultyExist){
        return res.status(409).json({
            message : "faculty already exists"
        })
    };

    const Faculty = await facultyModel.create({
        userId,
        facultyId, 
        employeeId,
        departmentId, 
        designation, 
        qualification,
        specialization, 
        joiningDate, 
        phone, 
        officeRoom
    });

    res.status(201).json({
        message : "new faculty added",
        Faculty : {
             facultyId : Faculty.facultyId,
             designation : Faculty.designation,
             qualification : Faculty.qualification,
             specialization : Faculty.specialization,
             phone : Faculty.phone,
             officeRoom : Faculty.officeRoom,
        }
    })
}


async function seeSubject(req, res){
    const userId = req.user.id;

    const faculty = await facultyModel.findOne({
        userId
    })
    

    // const assign = await facultySubjectMOdel.findOne({faculty._id});


    const assign = await facultySubjectMOdel.find({facultyId : faculty._id}).populate("subjectId");

    if (assign.length === 0) {
        return res.status(404).json({
        message: "No subjects assigned"
        });
    }

    res.status(200).json({
        message : "class fetch",
        sub : assign.map(sub=>sub.subjectId.name)
    })
}



module.exports = {
    createFacultyProfile,
    seeSubject
};