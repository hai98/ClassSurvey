var mongoose = require("mongoose");
var Survey = require("./survey");

var Schema = mongoose.Schema;

//TODO: add time due, save survey result

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
    surveys: [{ type: Schema.Types.ObjectId, ref: "Survey" }],
    done: {
        type: [String],
        default: []
    },
    start: Date,
    end: Date
});

courseSchema.pre("save", function(next) {
    var course = this;
    Survey.findOne({isDefault: true}).exec(function(err, res) {
        if(err) throw err;
        course.surveys.push(res._id);
        next();
    });
});

courseSchema.method("isDone", function(username) {
    return this.done.includes(username);
});

var Course = mongoose.model("Course", courseSchema);
module.exports = Course;