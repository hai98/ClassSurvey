var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var surveySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    items: {
        type: [Object],
        required: true
    },
    isDefault: Boolean
});

var Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;