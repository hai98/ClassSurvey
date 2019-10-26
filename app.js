var express = require("express");
var helmet = require("helmet");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require("express-session"); //handle session
// var path = require("path");

var credentials = require("./credentials");

var app = express();

//set up handlebars view engine
var handlebars = require("express-handlebars").create({
    defaultLayout: "main", helpers: {
        section: function (name, options) {
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

app.use(session({
    secret: credentials.cookieSecret,
    saveUninitialized: false,
    resave: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require("cookie-parser")(credentials.cookieSecret));
app.use(express.static(__dirname + "/public"));

require("./routes/routes")(app);

module.exports = app;
