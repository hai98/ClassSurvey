var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var courseSchema = new Schema({
    code: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    teacher: {
        type: String,
        trim: true
    },
    surveys: [{ type: Schema.Types.ObjectId, ref: "Survey" }]
});

var Course = mongoose.model("Course", courseSchema);
module.exports = Course;