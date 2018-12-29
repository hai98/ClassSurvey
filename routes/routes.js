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
        // successRedirect: "/home",
        failureRedirect: "/login",
        failureMessage: "Invalid username or password"
    }), (req, res) => {
        if(req.user.role == "admin") res.redirect("/manage");
        else res.redirect("/home");
    });

    app.get("/home", isLoggedIn, (req, res) => {
        var opt = {
            fname: req.user.fullname,
            std: (req.user.role == "student"),
            tea: (req.user.role == "teacher")
        };
        res.render("home", opt);
    });

    // app.get("/manage", isLoggedIn, (req, res) => {
    app.get("/manage", isLoggedIn, (req, res) => {
        res.locals.flash = req.session.flash;
        delete req.session.flash;
        res.render("manage", {fname: req.user.fullname});
    });

    app.get("/students", (req, res) => {
        User.find({ role: "student" }, "username fullname class").exec(function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });

    app.get("/teachers", (req, res) => {
        User.find({ role: "teacher" }, "username fullname email").exec(function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });

    app.get("/surveys", (req, res) => {
        Course.find({}).exec(function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });

    app.delete("/manage/survey/:id", (req, res) => {
        Course.findByIdAndRemove(req.params.id, (err, course) => {
            if(err) throw err;
            User.updateMany({}, {$pull: {courses: course._id}}).exec((err, ok) => {
                if(err) throw err;
            });
            res.json({ok: 1});
        });
    });

    app.post("/manage/survey/edit", (req, res) => {
        console.log(req.body);
        Course.updateOne({_id: req.body.surveyid}, {end: new Date(req.body.enddate)}).exec((err, ok) => {
            if(err) {
                console.log(err);
                req.session.flash = {
                    type: "danger",
                    intro: "Opps!",
                    message: "Something went wrong"
                };
            } else req.session.flash = {
                type: "success",
                intro: "Success!",
                message: "Saved"
            };
            res.redirect(303, "/manage");
        });
    });

    app.post("/teachers", (req, res) => {
        User.create({
            username: req.body.teaid,
            password: req.body.teapasswd,
            fullname: req.body.teaname,
            email: req.body.teaid + "@vnu.edu.vn",
            role: "teacher",
            courses: []
        }, (err, u) => {
            if(err) {
                console.log(err);
                req.session.flash = {
                    type: "danger",
                    intro: "Opps!",
                    message: "Something went wrong"
                };
            } else req.session.flash = {
                type: "success",
                intro: "Success!",
                message: "Added 1 teacher"
            };
            res.redirect(303, "/manage");
        });
    });

    app.post("/manage/teachers/edit", (req, res) => {
        User.update({username: req.body.teaid.trim()}, {
            password: req.body.teapasswd,
            fullname: req.body.teaname.trim(),
        }).exec((err, ok) => {
            if(err) {
                console.log(err);
                req.session.flash = {
                    type: "danger",
                    intro: "Opps!",
                    message: "Something went wrong"
                };
            } else req.session.flash = {
                type: "success",
                intro: "Success!",
                message: "Saved"
            };
            console.log(ok);
            res.redirect(303, "/manage");
        });
    });

    app.get("/survey/:id/result", (req, res) => {
        Course.findById(req.params.id).populate("survey").exec((err, course) => {
            if(err) throw err;
            User.find({role: "student", courses: course._id}, "username fullname class", (err, users) => {
                if(err) throw err;
                res.json({
                    heading: course.code + " - " + course.name,
                    done: course.done,
                    result: course.processResult(),
                    survey: course.survey.items,
                    stdList: users,
                });
            });
        });
    });

    app.get("/survey/:id", (req, res) => {
        Survey.findById(req.params.id).exec((err, survey) => {
            res.json(survey.items);
        });
    });

    app.post("/survey/submit/:courseid", (req, res) => {
        Course.findById(req.params.courseid).exec((err, course) => {
            if(course.isDone(req.user.username) || course.isOverDue()) res.redirect(303, "/home");
            var tmp = course.results;
            var data = Object.values(req.body);
            var cmt = data.pop().trim();
            if(tmp.comments && cmt.length > 0) {
                tmp.comments.push(cmt);
            }
            data = data.map(Number);
            tmp.ques.push(data);
            // if(tmp.ques && tmp.ques.length > 0) {
            //     for(let i=0; i<data.length; ++i) {
            //         if(tmp.ques[i]) tmp.ques[i] += data[i];
            //         else tmp.ques[i] = data[i];
            //         console.log(i);
            //     }
            // } else tmp.ques = data;
            Course.update({_id: course._id}, {$set: {results: tmp}, $push: {done: req.user.username}}, (err, raw) => {
                console.log(raw);
                res.redirect(303, "/home");
            });
        });
        console.log(req.params.courseid);
        console.log(Object.values(req.body));
    });

    app.get("/templates", (req, res) => {
        Survey.find({}).exec(function(err, data) {
            if(err) throw err;
            res.json(data);
        });
    });

    app.get("/templates/:id", (req, res) => {
        Survey.findById(req.params.id).exec((err, tmp) => {
            if(err) throw err;
            res.json(tmp);
        });
    });

    app.delete("/manage/template/:id", (req, res) => {
        Survey.countDocuments({}).exec((err, num) => {
            if(err || num <2) res.json({ok: 0});
            Survey.deleteOne({_id: req.params.id}).exec((err, result) => {
                if(err) throw err;
                res.json(result);
            });
        });
    });

    app.post("/manage/templates", (req, res) => {
        var tmp = {
            name: req.body.tempName,
            isDefault: false,
            items: []
        };
        var len = JSON.parse("[" + req.body.lengths + "]");
        var titles = req.body.title;
        var x=0;
        for(let i=0; i<titles.length; ++i) {
            var itm = {
                title: titles[i],
                contents: req.body.ques.slice(x, x+len[i])
            };
            tmp.items.push(itm);
            x+=len[i];
        }
        Survey.create(tmp, (err, u) => {
            if(err) {
                console.log(err);
                req.session.flash = {
                    type: "danger",
                    intro: "Opps!",
                    message: "Something went wrong"
                };
            } else req.session.flash = {
                type: "success",
                intro: "Success!",
                message: "Added 1 template"
            };
            res.redirect(303, "/manage");
        });
    });

    app.get("/student/surveys", (req, res) => {
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
                        status: [course.isDone(user.username), course.isOverDue()],
                        surveyid: course.survey,
                        end: course.end
                    });
                    callback();
                });
            }, (err) => {
                if(err) throw err;
                res.json(data);
            });
        });
    });

    app.post("/students", (req, res) => {
        User.create({
            username: req.body.stdid,
            password: req.body.stdpasswd,
            fullname: req.body.stdname,
            class: req.body.stdclass,
            email: req.body.stdid + "@vnu.edu.vn",
            role: "student",
            courses: []
        }, (err, u) => {
            if(err) {
                console.log(err);
                req.session.flash = {
                    type: "danger",
                    intro: "Opps!",
                    message: "Something went wrong"
                };
            } else req.session.flash = {
                type: "success",
                intro: "Success!",
                message: "Added 1 student"
            };
            res.redirect(303, "/manage");
        });
    });

    app.post("/manage/students/edit", (req, res) => {
        User.update({username: req.body.stdid.trim()}, {
            password: req.body.stdpasswd,
            fullname: req.body.stdname.trim(),
            class: req.body.stdclass.trim(),
        }).exec((err, ok) => {
            if(err) {
                console.log(err);
                req.session.flash = {
                    type: "danger",
                    intro: "Opps!",
                    message: "Something went wrong"
                };
            } else req.session.flash = {
                type: "success",
                intro: "Success!",
                message: "Saved"
            };
            console.log(ok);
            res.redirect(303, "/manage");
        });
    });

    app.delete("/manage/user/:id", (req, res) => {
        User.deleteOne({username: req.params.id}).exec((err, result) => {
            if(err) throw err;
            res.json(result);
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

    // app.get("/tours", (req, res) => {
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