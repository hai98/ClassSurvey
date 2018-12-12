var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var surveySchema = new Schema({
    items: {
        type: [Object],
        required: true
    },
    isDefault: Boolean
});

module.exports = mongoose.model("Survey", surveySchema);