var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var Schema = mongoose.Schema;

//TODO: add enum prop

var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    class: {
        type: String,
        trim: true
    },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }]
});

userSchema.pre("save", function(next) {
    var user = this;
    console.log(user.password);
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

userSchema.statics.authenticate = function(uname, password, callback) {
    User.findOne({ username: uname }).exec(function(err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            return callback(null, false);
        }
        bcrypt.compare(password, user.password, function(err, result) {
            if (result === true) return callback(null, user);
            else return callback(null, false);
        });
    });
};

var User = mongoose.model("User", userSchema);
module.exports = User;