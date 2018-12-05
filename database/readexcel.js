var xlsx = require("xlsx");
var User = require("../models/user");

module.exports = {
    parseStudents: function(filePath) {
        var wb = xlsx.readFile(filePath);
        var data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: [null, "username", "password", "fullname", "email", "class"] });
        data.shift();
        User.create(data, (err, arr) => { if (err) throw err; });
        return data;
    },
    
    parseTeacher: function(filePath) {
        var wb = xlsx.readFile(filePath);
        var data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: [null, "username", "password", "fullname", "email", "class"] });
        data.shift();
        User.create(data, (err, arr) => { if (err) throw err; });
        return data;
    },

    parseCourse: function(filePath) {
        var wb = xlsx.readFile(filePath);
        var wsh = wb.Sheets[wb.SheetNames[0]];
        var ids = [];
        var code = console.log(wsh["C9"].v);
        var lecturer = console.log(wsh["C7"].v);
        var name = console.log(wsh["C10"].v);
        for (var i = 12; ; ++i) {
            var cell = wsh["B" + i];
            if (cell) {
                // console.log(cell.v);
                ids.push(cell.v);
            } else break;
        }
    }

};