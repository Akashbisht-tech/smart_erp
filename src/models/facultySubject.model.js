const mongoose = require("mongoose");

const facultySubjectSchema = new mongoose.Schema(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
            required: true,
        },

        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

facultySubjectSchema.index(
    { facultyId: 1, subjectId: 1 },
    { unique: true }
);

module.exports = mongoose.model("FacultySubject", facultySubjectSchema);