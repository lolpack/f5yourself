var path = require("path"),
    _ = require("underscore"),
    express = require("express")
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    request = require('request');

app.use(express.static(path.join(__dirname, 'static')));

var trackedURLs = {};

app.set("views", path.join(__dirname, "templates"))
   .set("view engine", "hbs");


app.get("*", function(req, res) {
    var url = req.url;
    startTracking(url);
    res.render("pageview", {url: url});
});

var startTracking = function(url) {
    trackedURLs[url] = {
        sockets: io.of(url),
        tracker: setInterval(checkURL, 5000, url),
        html: null
    };
    trackedURLs[url].sockets.on("connection", function(client) {

    });
};

var stopTracking = function(url) {
    clearInterval(trackedURLs[url].tracker);
};

var checkURL = function(url) {
    request(url, function (error, response, body) {
        console.log('made it here')
        if (!error && response.statusCode == 200 && body !== trackedURLs[url].html) {
            trackedURLs[url].html = body;
            console.log(body);
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
