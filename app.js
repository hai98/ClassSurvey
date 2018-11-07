const expresss = require("express");
const helmet = require("helmet");
const logger = require("morgan");

const app = expresss();

app.use(helmet());
app.use(logger("dev"));

app.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
});

app.get("/", (req, res) => {
    res.send("Hello, world<br><small>Requested at: " + req.requestTime + "</small>");
});

// app.use((req, res, next) => {
//     res.type("text/plain");
//     res.status(404);
//     res.send("404 - Not Found");
// });

// app.listen(3000, () => {
//     console.log("Example app listening on port 3000!");
// });

module.exports = app;