var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml'); //TODO: implement yaml saving.

var log = function () {
    console.warn.apply(console, Array.prototype.concat.apply(['[Project Editor]'], arguments));
};

var ProjectEditor = function (config) {
    this.config = config;

    //A bit of a hack. Include our custom JS files as long as this module isn't available via NPM
    this.addFrontJS(["/kosmtik-project-editor/node_modules/sortablejs/Sortable.min.js", "/kosmtik-project-editor/front/editor.js"])
    config.on('server:init', this.attachRoutes.bind(this));
};

ProjectEditor.prototype.saveLayers = function (req, res) {
    var outer = this;

    if (req.method == 'POST') {
        var jsonString = '';

        req.on('data', function (data) {
            jsonString += data;
        });

        req.on('end', function () {
            var layerList = JSON.parse(jsonString);

            if (path.extname(outer.config.parsed_opts.path) !== ".mml") {
                outer.sendResponse(res, 500, "Currently only saving of mml projects is supported, sorry.");
                return;
            }

            fs.readFile(outer.config.parsed_opts.path, 'utf8', function (err, data) {
                if (err) {
                    log("Error when reading project file!", e);
                    outer.sendResponse(res, 500, "Error when reading project file.");
                    return;
                }
                var mml = JSON.parse(data);
                mml.Layer = layerList;

                fs.writeFile(outer.config.parsed_opts.path,JSON.stringify(mml, null, 3),function(err) {
                    if (err) {
                        log("Error when writing project file!", e);
                        outer.sendResponse(res, 500, "Error when writing project file.");
                        return;
                    }
                    log("Wrote project file to", outer.config.parsed_opts.path);
                    outer.sendResponse(res);
                });
            });
        });
    }
};

ProjectEditor.prototype.sendResponse = function(res, status, message) {
    status = status || 200;
    message = message || "Ok";

    var buffer = '{"msg":"' + message + '"}';
    res.writeHead(status, {'Content-Type': 'text/json', 'Content-Length': buffer.length});
    res.write(buffer);
    res.end();
};

ProjectEditor.prototype.addFrontJS = function(ary) {
    this.frontJS = ary || [];

    var outer = this;
    this.frontJS.forEach(function(file) {
        outer.config.addJS(file);
    });
}

ProjectEditor.prototype.attachRoutes = function (e) {
    var outer = this;

    var wrapper = function(req, res) {
        return outer.saveLayers(req, res);
    }

    var serveJS = function(req, res) {
        log(req.url);
        var path = __dirname + req.url.replace("/kosmtik-project-editor", "");

        this.serveFile(path, res);
    }

    e.server.addRoute('/save-layer/', wrapper);

    this.frontJS.forEach(function(file) {
        e.server.addRoute(file, serveJS);
    });
};

exports.Plugin = ProjectEditor;
