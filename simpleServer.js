var http = require("http");
var fs = require("fs");

function load_album_list(callback) {
    fs.readdir("albums/", function (err, files) {
        if(err){
            callback(err);
            process.exit(0);
        }

        var onlyDirs = [];

        (function iterator(index) {
            if (index === files.length){
                callback(null, onlyDirs);
                process.exit(0);
            }

            fs.stat("albums/" + files[index], function (err, stats) {
                if(err){
                    callback(err);
                    process.exit(1);
                }

                if(stats.isDirectory){
                    onlyDirs.push(files[index]);
                }
                iterator(index + 1);
            });
        })(0);

        // Sostituiamo il for con un iterator.
        /*for (var i = 0; i < files.length; i++)
        fs.stat("albums/" + files[i], function (err, stats) {
            if(err){
                callback(err);
                process.exit(1);
            }

            if(stats.isDirectory){
                onlyDirs.push(files[i]);
            }
        });
        callback(null, onlyDirs);*/
    });
}

function handle_incoming_request(req, res) {
    console.log("Richiesta in Arrivo: " + req.method + " " + req.url);
    load_album_list(function (err, albums) {
        if (err) {
            res.writeHead(503, {"Content-Type": "application/json"});
            res.end(JSON.stringify(err) + "\n")
        }

        var out = {
            error: null,
            data: {albums: albums}
        };
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(out) + "\n");
    });
}


var s = http.createServer(handle_incoming_request);
s.listen(8080);
console.log("Server Started");
