var mongoose = require("mongoose");
var Survey = require("./survey");
var User = require("./user");
var async = require("async");

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

courseSchema.post("save", function(doc) {
    let course = this;
    User.findOneAndUpdate({role: "teacher", fullname: course.teacher}, {$push: {courses: course._id}}).exec((err, res) => {
        if(err) throw err;
    });
});

courseSchema.method("isDone", function(username) {
    return this.done.includes(username);
});

courseSchema.method("isOverDue", function() {
    var now = new Date();
    return (now.getTime() > this.end.getTime())? true : false;
});

courseSchema.method("processResult", function(cbk) {
    if(this.done.length < 1) return null;
    // return calc(this.results.ques);
    var course = this;
    var res = calc(course.results.ques);
    var regex = new RegExp("^"+ this.code.substr(0, 7), "i");
    async.series({
        res1: function(callback) {
            Course.find({code: {$regex: regex}}).exec((err, cs) => {
                if(err) callback(err, null);
                var tmp = [];
                cs.forEach((value) => {
                    tmp = tmp.concat(value.results.ques);
                });
                callback(null, calc(tmp));
            });
        },
        res2: function(callback) {
            Course.find({teacher: course.teacher}).exec((err, cs) => {
                if(err) callback(err, null);
                var tmp = [];
                cs.forEach((value) => {
                    tmp = tmp.concat(value.results.ques);
                });
                callback(null, calc(tmp));
            });
        }
    }, function(err, results) {
        if(err) throw err;
        cbk({
            m: res.m,
            std: res.std,
            m1: results.res1.m,
            std1: results.res1.std,
            m2: results.res2.m,
            std2: results.res2.std
        });
    });
});

function calc(arr) {
    let res = {
        m: [],
        std: []
    };
    let n = arr[0].length;
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
}

var Course = mongoose.model("Course", courseSchema);
module.exports = Course;