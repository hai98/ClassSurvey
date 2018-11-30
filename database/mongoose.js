var mongoose = require("mongoose"); //for mongodb

var dbURI = "mongodb://localhost/class_survey";

var opts = {
    useNewUrlParser: true
};

mongoose.connect(dbURI, opts);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = db;