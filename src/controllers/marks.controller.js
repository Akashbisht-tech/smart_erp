const marksModle = require("../models/marks.model");
const studentModel = require("../models/students.model");
const subjectModel = require("../models/subject.model");

async function create(req, res){
    const {
        studentId,
        subjectId,
        examId,
        marksObtained,
        maxMarks,
        grade,
        remarks
    } = req.body;

    const isStudentExist = await studentModel.findById(studentId);

    if(!isStudentExist){
        return res.status(404).json({
            message : "student does not exist"
        })
    }


    const isSubjectExist = await subjectModel.findById(subjectId);

    if(!isSubjectExist){
        return res.status(404).json({
            message : "subject does not exist"
        })
    }

    if(marksObtained > maxMarks){
        return res.status(404).json({
            message : "please check student marks again"
        })
    }

    const marks = await marksModle.create({
        studentId,
        subjectId,
        examId,
        marksObtained,
        maxMarks,
        grade,
        remarks
    });

    res.status(201).json({
        message : "created",
        marks
    })


}

async function updateMarks(req, res){
    const {id} = req.params;
    const {
        marksObtained,
        grade,
        remarks
    } = req.body;

    const marks = await marksModle.findOneAndUpdate(
        {_id  : id},
        {marksObtained,
        grade,
        remarks},
        { new: true }

    
    );
    // console.log(marks);

    if(marksObtained > marks.maxMarks){
        return res.status(404).json({
            message : "please check student marks again"
        })
    }


    if (!marks) {
        return res.status(404).json({
            message: "marks not found"
        });
    }

    marks.save();

    res.status(200).json({
        message: "marks updated successfully",
        marks
    });


    
}

async function getStudentMarks(req, res) {
    const userId = req.user.id;
    console.log(userId);

    const student = await studentModel.findOne({
        userId: userId
    });

    if (!student) {
        return res.status(404).json({
            message: "student not found"
        });
    }

    const marks = await marksModle
        .find({ studentId: student._id })
        .populate("subjectId");

    if (marks.length === 0) {
        return res.status(404).json({
            message: "no marks found"
        });
    }

    const result = marks.map((item) => ({
        subject: item.subjectId.name,
        // exam: item.examId.name,
        marksObtained: item.marksObtained,
        maxMarks: item.maxMarks,
        grade: item.grade,
        remarks: item.remarks
    }));

    res.status(200).json({
        message: "marks fetched successfully",
        marks: result
    });
}

async function getPerformance(req, res) {
    const userId = req.user.id;

    const student = await studentModel.findOne({
        userId: userId
    });

    if (!student) {
        return res.status(404).json({
            message: "student not found"
        });
    }

    const marks = await marksModle.find({
        studentId: student._id
    });

    if (marks.length === 0) {
        return res.status(404).json({
            message: "no marks found"
        });
    }

    let totalObtained = 0;
    let totalMaxMarks = 0;

    const performance = marks.map((item) => {

        const percentage =
            (item.marksObtained / item.maxMarks) * 100;

        totalObtained += item.marksObtained;
        totalMaxMarks += item.maxMarks;

        return {
            subjectId: item.subjectId,
            marksObtained: item.marksObtained,
            maxMarks: item.maxMarks,
            percentage: Number(percentage.toFixed(2)),
            grade: item.grade
        };
    });

    const overallPercentage =
        (totalObtained / totalMaxMarks) * 100;

    res.status(200).json({
        message: "performance fetched successfully",
        performance,
        overallPercentage: Number(overallPercentage.toFixed(2))
    });
}

module.exports = {
    create,
    updateMarks,
    getStudentMarks,
    getPerformance
}