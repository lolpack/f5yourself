var path = require("path"),
    _ = require("underscore"),
    app = (require("express"))(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var trackedURLs = {};

app.set("views", path.join(__dirname, "templates"))
   .set("view engine", "hbs");


app.get("*", function(req, res) {
    var url = req.url;
    startTracking(url);
    res.render("pageview", {});
});

var startTracking = function(url) {
    trackedURLs[url] = io.of(url);
    trackedURLs[url].on("connection", function(client) {

    });
    checkURL(url);
};

var checkURL = function(url) {
    // ...
    _.delay(function(url){ checkURL(url); }, 5000);
}

var PORT = 3000
server.listen(PORT);
console.log("Started f5yourself on port " + PORT);
