/**
 * User: vivin
 * Date: 5/30/13
 * Time: 6:21 PM
 *
 * Test server for asynchronous constraints
 */

var util = require("util");
var http = require("http");
var url = require("url");

http.createServer(function(request, response) {
    var pass = false;
    var parameterMap = url.parse(request.url, true).query;

    if(typeof parameterMap.shutdown === "undefined") {
        if(parameterMap.pass === "true") {
            console.log("[async-test-server] Request received to fail.");
            pass = true;
        } else {
            console.log("[async-test-server] Request received to pass.");
        }

        var seconds = Math.floor(Math.random() * 3) + 1;
        console.log("[async-test-server] Waiting for " + seconds + " seconds to elapse.");
        setTimeout(function() {
            console.log("[async-test-server] Done waiting.");
            response.writeHeader(200, {"Content-Type": "application/javascript"})
            response.write(parameterMap.callback + "(" + JSON.stringify({pass: pass}) + ");");
            response.end();
        }, seconds * 1000)
    } else {
        console.log("[async-test-server] Shutting down.");
        response.writeHeader(200, {"Content-Type": "text/plain"})
        response.write("Shutting down");
        response.end();
        request.connection.destroy();
        process.exit();
    }
}).listen(8888);

console.log("[async-test-server] Server running on port 8888.");
