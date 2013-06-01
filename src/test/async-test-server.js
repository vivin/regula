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
var sleep = require("sleep");

http.createServer(function(request, response) {
    var pass = false;
    var parameterMap = url.parse(request.url, true).query;

    if(parameterMap.pass === "true") {
        util.puts("Request received to fail.");
        pass = true;
    } else {
        util.puts("Request received to pass.");
    }

    var seconds = Math.floor(Math.random() * 3) + 1;
    util.puts("Sleeping for " + seconds + " seconds.");
    sleep.sleep(seconds)

    response.writeHeader(200, {"Content-Type": "application/javascript"})
    response.write(parameterMap.callback + "(" + JSON.stringify({pass: pass}) + ");");
    response.end();
}).listen(8888);

util.puts("Server running in 8888");
