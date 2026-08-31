const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        userid : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },

        refreshTokenHash : {
            type : String,
            required : [true, "refresToken is required"]
        },

        revoked : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps: true
    }
);

const sessionModel = mongoose.model("Session", sessionSchema);

module.exports = sessionModel;