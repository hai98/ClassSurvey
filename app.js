var express = require("express");
var helmet = require("helmet");
var logger = require("morgan");
var bodyParser = require("body-parser");
var formidable = require("formidable");
// var path = require("path");

var app = express();

//set up handlebars view engine
var handlebars = require("express-handlebars").create({
    defaultLayout: "main", helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

app.use(helmet());
app.use(logger("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    // res.render("home");
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    console.log(req.body.username);
    console.log(req.body.password);
    
    res.set("Content-Type", "text/plain");
    res.send("success");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/header", (req, res) => {
    res.set("Content-Type", "text/plain");
    var s = "";
    for (var name in req.headers) s += name + ": " + req.headers[name] + "\n";
    res.send(s);
});

var fortunes = [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple.",
];

var tours = [{ id: 0, name: "Hood River", price: 99.99 }, { id: 1, name: "Oregon Coast", price: 193.33 }];

app.get("/api/tours", (req, res) => {
    res.json(tours);
});

app.get("/about", (req, res) => {
    var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render("about", { fortune: randomFortune });
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

module.exports = app;