var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var Schema = mongoose.Schema;

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
    }
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

userSchema.static.authenticate = function(uname, password, callback) {
    User.findOne({ username: uname }).exec(function(err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            var error = new Error("username not found");
            error.status = 401;
            return callback(error);
        }
        bcrypt.compare(password, User.password, function(err, result) {
            if (result === true) return callback(null, user);
            else return callback();
        });
    });
};

var User = mongoose.model("User", userSchema);
module.exports = User;