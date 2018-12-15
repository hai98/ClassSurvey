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

module.exports = mongoose.model("Survey", surveySchema);