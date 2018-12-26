var mongoose = require("mongoose");
var Survey = require("./survey");

var Schema = mongoose.Schema;

//TODO: add time due

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
    survey: { type: Schema.Types.ObjectId, ref: "Survey" },
    done: {
        type: [String],
        default: []
    },
    results: {
        type: Object,
        default: {comments: [], ques: []}
    },
    start: Date,
    end: {
        type: Date,
        default: new Date()
    }
});

courseSchema.pre("save", function(next) {
    var course = this;
    Survey.findOne({isDefault: true}).exec(function(err, res) {
        if(err) throw err;
        course.survey = res._id;
        next();
    });
});

courseSchema.method("isDone", function(username) {
    return this.done.includes(username);
});

courseSchema.method("isOverDue", function() {
    var now = new Date();
    return (now.getTime() > this.end.getTime())? true : false;
});

courseSchema.method("processResult", function() {
    if(this.done.length < 1) return null;
    var res = {
        m: [],
        std: []
    };
    var arr = this.results.ques;
    var n = arr[0].length;
    for(let i=0; i<n; ++i) {
        let sum =0;
        let nn = arr.length;
        for(let j=0; j<nn; ++j) {
            sum += arr[j][i];
        }
        res.m.push(sum/nn);
    }
    for(let i=0; i<n; ++i) {
        let ps =0;
        let nn = arr.length;
        for(let j=0; j<nn; ++j) {
            ps += Math.pow(res.m[i] - arr[j][i], 2);
        }
        res.std.push(Math.sqrt(ps/(nn-1)));
    }
    return res;
});

var Course = mongoose.model("Course", courseSchema);
module.exports = Course;