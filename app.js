var path = require("path"),
    _ = require("underscore"),
    app = (require("express"))(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    request = require('request');

var trackedURLs = {};

prevHTML = null;
intervalID = null;

app.set("views", path.join(__dirname, "templates"))
   .set("view engine", "hbs");


app.get("*", function(req, res) {
    var url = req.url;
    startTracking(url);
    res.render("pageview", {url: url});
});

var startTracking = function(url) {
    trackedURLs[url] = io.of(url);
    trackedURLs[url].on("connection", function(client) {

    });
    intervalID = setInterval(checkURL, 5000, url);
};

var stopTracking = function() {
    clearInterval(intervalID)
};

var checkURL = function(url) {
    request(url, function (error, response, body) {
        console.log('made it here')
        if (!error && response.statusCode == 200 && body !== prevHTML) {
            prevHTML = body;
            console.log(prevHTML);
            updateIframe(url);
        }
    })
};

var updateIframe = function (url) {
    //Send update 
}

var PORT = 3000
server.listen(PORT);
console.log("Started f5yourself on port " + PORT);

startTracking("http://www.homestarrunner.com/")
