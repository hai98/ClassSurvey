var xlsx = require("xlsx");
var User = require("../models/user");
var Course = require("../models/course");
var Survey = require("../models/survey");

module.exports = {
    parseStudents: function(filePath) {
        var wb = xlsx.readFile(filePath);
        var data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: [null, "username", "password", "fullname", "email", "class"] });
        data.shift();
        data.forEach((value, index, arr) => {
            value.role = "student";
        });
        User.create(data, (err, arr) => {
            if (err){
                console.error(err);
                return null;
            } else return data;
        });
    },
    
    parseTeacher: function(filePath) {
        var wb = xlsx.readFile(filePath);
        var data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: [null, "username", "password", "fullname", "email", "class"] });
        data.shift();
        data.forEach((value, index, arr) => {
            value.role = "teacher";
        });
        User.create(data, (err, arr) => { if (err) throw err; });
        return data;
    },

    parseCourse: function(filePath) {
        var wb = xlsx.readFile(filePath);
        var wsh = wb.Sheets[wb.SheetNames[0]];
        var data = {};
        var ids = [];
        data.code = wsh["C9"].v;
        data.teacher = wsh["C7"].v;
        data.name = wsh["C10"].v;
        for (var i = 12; ; ++i) {
            var cell = wsh["B" + i];
            if (cell) {
                // console.log(cell.v);
                ids.push(cell.v);
            } else break;
        }
        Course.create(data, function(err, course) {
            if(err) throw err;
            User.updateMany({username: {$in: ids}}, {$push: {courses: course._id}}).exec((err, res) => {
                if (err) throw err;
                console.log(res);
            });
        });
        data.ids = ids;
        return data;
    }

};