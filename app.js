var path = require("path"),
    _ = require("underscore"),
    express = require("express")
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    request = require('request'),
    jsdom = require("jsdom");

app.use(express.static(path.join(__dirname, 'static')));

var trackedURLs = {};

app.set("views", path.join(__dirname, "templates"))
   .set("view engine", "hbs");


app.get("*", function(req, res) {
    var url = req.url.slice(1);
    if (!trackedURLs[url] || trackedURLs[url].clientCount < 1)
        startTracking(url);
    res.render("pageview", {url: url});
});

var startTracking = function(url) {
    trackedURLs[url] = {
        sockets: io.of("/" + url),
        tracker: setInterval(checkURL, 5000, url),
        html: null,
        clientCount: 0        
    };
    trackedURLs[url].sockets.on("connection", function(client) {
        trackedURLs[url].clientCount++
        trackedURLs[url].sockets.emit("clientCount", {clients: trackedURLs[url].clientCount});

        client.on("disconnect", function() {
            trackedURLs[url].clientCount--
            if (trackedURLs[url].clientCount < 1) {
                stopTracking(url);
            } else {
                trackedURLs[url].sockets.emit("clientCount", {clients: trackedURLs[url].clientCount});
            }
        });
    });
};

var stopTracking = function(url) {
    clearInterval(trackedURLs[url].tracker);
};

var checkURL = function(url) {
    // console.log("checking:", url);
    // console.log("clients:", trackedURLs[url].clientCount);
    if (trackedURLs[url].clientCount) {
        jsdom.env(
            "http://" + url, //GET html
            ["http://code.jquery.com/jquery.js"], //Inject jquery into dom
                function (errors, window) {
                    var body = window.$('body p').html();
                    var timestamp = new Date().getTime();
                    if (body !== trackedURLs[url].html) { //No longer checking for errors on GET req. May need to look into this
                        trackedURLs[url].html = body;
                        console.log(timestamp -= new Date().getTime());
                        console.log(body);
                        timestamp = new Date().getTime()
                        updateIframe(url);
                    }
                }
        );
    };
};

var updateIframe = function (url) {
    trackedURLs[url].sockets.emit("update", { url: url, time: (new Date()).getTime() });
}

var PORT = 3000
server.listen(PORT);
console.log("Started f5yourself on port " + PORT);
