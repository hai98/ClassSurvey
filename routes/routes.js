var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var fs = require("fs");
const exec = require("child_process").execSync;
var mgdb = require("../database/mongoose");
var User = require("../models/user");
var Course = require("../models/course");
var Survey = require("../models/survey");
var formidable = require("formidable"); //for file uploads
var readExcel = require("../database/readexcel");
var async = require("async");

module.exports = function (app) {
    passport.use(new LocalStrategy(User.authenticate));
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function (userId, done) {
        User.findById(userId, (err, user) => {
            if (err) return done(err);
            done(null, user);
        });
    });
    app.use(passport.initialize());
    app.use(passport.session());


    // app.use((req, res, next) => {
    //     res.locals.flash = req.session.flash;
    //     delete req.session.flash;
    //     next();
    // });

    app.get("/", isLoggedIn, (req, res) => {
        res.redirect(303, "/home");
    });

    app.get("/login", (req, res) => {
        if (req.session.messages) {
            res.locals.flash = {
                type: "danger",
                intro: req.session.messages[0],
                messages: ""
            };
            console.log(req.session.messages[0]);
            delete req.session.messages;
        }
        res.render("login");
    });

    // app.post("/login", (req, res) => {
    //     User.authenticate(req.body.username, req.body.password, function(err, u) {
    //         if(err || !u) {
    //             req.session.flash = {
    //                 type: "danger",
    //                 intro: "Wrong username or password.",
    //                 message: ""
    //             };
    //             res.redirect(303, "/login");
    //         } else {
    //             req.session.uname = { fname: u.fullname };
    //             res.redirect("/home");
    //         }
    //     });
    // });

    app.post("/login", passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/login",
        failureMessage: "Invalid username or password"
    }));

    app.get("/home", isLoggedIn, (req, res) => {
        res.render("home", { fname: req.user.fullname });
    });

    // app.get("/manage", isLoggedIn, (req, res) => {
    app.get("/manage", (req, res) => {
        res.render("manage");
    });

    app.get("/api/students", (req, res) => {
        User.find({ role: "student" }, "-_id username fullname class").exec(function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });

    app.get("/api/teachers", (req, res) => {
        User.find({ role: "teacher" }, "-_id username fullname email").exec(function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });

    app.get("/api/surveys", (req, res) => {
        Course.find({}).exec(function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });

    app.get("/api/survey/:id", (req, res) => {
        Survey.findById(req.params.id).exec((err, survey) => {
            res.json(survey.items);
        });
    });

    app.post("/api/survey/submit/:courseid", (req, res) => {
        console.log(req.params.courseid);
        console.log(req.body);
        res.redirect(303, "/home");
    });

    app.get("/api/templates", (req, res) => {
        Survey.find({}).exec(function(err, data) {
            if(err) throw err;
            res.json(data);
        });
    });

    app.get("/api/student/surveys", (req, res) => {
        User.findById(req.user._id).exec((err, user) => {
            if(err) throw err;
            var data = [];
            async.each(user.courses, (item, callback) => {
                Course.findById(item._id).exec((err, course) => {
                    if(err) callback(err);
                    if(course) data.push({
                        id: course._id,
                        name: course.name,
                        code: course.code,
                        teacher: course.teacher,
                        status: course.isDone(user.username),
                        surveyid: course.survey
                    });
                    callback();
                });
            }, (err) => {
                if(err) throw err;
                res.json(data);
            });
        });
    });

    app.post("/manage/upload/students", (req, res) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = __dirname + "/../uploads/";
        fs.existsSync(form.uploadDir) || fs.mkdirSync(form.uploadDir);
        form.parse(req, (err, fields, files) => {
            if (err) return res.redirect(303, "/error");
            console.log("received files");
            console.log(files.excelFile.name);
            var oldPath = files.excelFile.path;
            var newPath = form.uploadDir + files.excelFile.name;
            fs.renameSync(oldPath, newPath);
            var data = readExcel.parseStudents(newPath);
            //TODO: response to ajax request??
            res.json(data);
            // res.redirect(303, "/manage");
        });
    });

    app.post("/manage/upload/teachers", (req, res) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = __dirname + "/../uploads/";
        fs.existsSync(form.uploadDir) || fs.mkdirSync(form.uploadDir);
        form.parse(req, (err, fields, files) => {
            if (err) return res.redirect(303, "/error");
            console.log("received files");
            console.log(files.excelFile.name);
            var oldPath = files.excelFile.path;
            var newPath = form.uploadDir + files.excelFile.name;
            fs.renameSync(oldPath, newPath);
            var data = readExcel.parseTeacher(newPath);
            //TODO: response to ajax request??
            res.json(data);
            // res.redirect(303, "/manage");
        });
    });

    app.post("/manage/upload/course", (req, res) => {
        var form = new formidable.IncomingForm();
        form.uploadDir = __dirname + "/uploads/";
        fs.existsSync(form.uploadDir) || fs.mkdirSync(form.uploadDir);
        form.parse(req, (err, fields, files) => {
            if (err) return res.redirect(303, "/error");
            console.log("received files");
            console.log(files.excelFile.name);
            var oldPath = files.excelFile.path;
            var newPath = form.uploadDir + files.excelFile.name;
            fs.renameSync(oldPath, newPath);
            var data = readExcel.parseCourse(newPath);
            //TODO: response to ajax request??
            res.json(data);
            // res.redirect(303, "/manage");
        });
    });

    // app.get("/header", (req, res) => {
    //     res.set("Content-Type", "text/plain");
    //     var s = "";
    //     for (var name in req.headers) s += name + ": " + req.headers[name] + "\n";
    //     res.send(s);
    // });

    // var fortunes = [
    //     "Conquer your fears or they will conquer you.",
    //     "Rivers need springs.",
    //     "Do not fear what you don't know.",
    //     "You will have a pleasant surprise.",
    //     "Whenever possible, keep it simple.",
    // ];

    // var tours = [{ id: 0, name: "Hood River", price: 99.99 }, { id: 1, name: "Oregon Coast", price: 193.33 }];

    // app.get("/api/tours", (req, res) => {
    //     res.json(tours);
    // });

    // app.get("/about", (req, res) => {
    //     var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    //     res.render("about", { fortune: randomFortune });
    // });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect(303, "/login");
    });

    //custom 404 page
    app.use((req, res, next) => {
        res.status(404);
        res.render("404");
    });

    //custom 500 page
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500);
        res.render("500");
    });

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect("/login");
    }
};