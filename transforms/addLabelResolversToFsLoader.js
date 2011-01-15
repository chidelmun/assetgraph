var fs = require('fs'),
    path = require('path'),
    step = require('step'),
    error = require('../error'),
    resolvers = require('../loaders/Fs/resolvers'),
    fileUtils = require('../fileUtils');

exports.addLabelResolversToFsLoader = function addLabelResolversToFsLoader(fsLoader, labelDefinitions, cb) {
    step(
        function () {
            var group = this.group();
            labelDefinitions.forEach(function (labelDefinition) {
                var keyValue = labelDefinition.split('=');
                if (keyValue.length !== 2) {
                    throw "Invalid label syntax: " + labelDefinition;
                }
                var labelName = keyValue[0],
                    labelValue = keyValue[1],
                    callback = group(),
                    matchSenchaJSBuilder = labelValue.match(/\.jsb(\d)$/);
                if (matchSenchaJSBuilder) {
                    var url = fileUtils.dirnameNoDot(labelValue) || '',
                        version = parseInt(matchSenchaJSBuilder[1], 10);
                    fs.readFile(path.join(fsLoader.root, labelValue), 'utf8', error.passToFunction(cb, function (fileBody) {
                        fsLoader.addLabelResolver(labelName, resolvers.SenchaJSBuilder, {
                            url: url,
                            version: version,
                            body: JSON.parse(fileBody)
                        });
                        callback();
                    }));
                } else {
                    path.exists(path.join(fsLoader.root, labelValue), function (exists) {
                        if (!exists) {
                            callback(new Error("Label " + labelName + ": Dir not found: " + labelValue));
                        } else {
                            fsLoader.addLabelResolver(labelName, resolvers.Directory, {url: labelValue});
                            callback();
                        }
                    });
                }
            });
            process.nextTick(group()); // Make sure it's called at least once
        },
        cb
    );
};
