/*global describe, it*/
var expect = require('../unexpected-with-plugins'),
    AssetGraph = require('../../lib');

describe('assets/Css', function () {
    it('should handle a test case with a parse error in an inline Css asset', function (done) {
        var err;
        new AssetGraph({root: __dirname + '/../../testdata/assets/Css/parseErrors/'})
            .on('warn', function (_err) {
                err = _err;
            })
            .loadAssets('parseErrorInInlineCss.html')
            .queue(function () {
                expect(err, 'to be an', Error);
                expect(err.message, 'to match', /parseErrorInInlineCss\.html/);
            })
            .run(done);
    });

    it('should handle a test case with a parse error in an external Css asset', function (done) {
        var err;
        new AssetGraph({root: __dirname + '/../../testdata/assets/Css/parseErrors/'})
            .on('warn', function (_err) {
                err = _err;
            })
            .loadAssets('parseErrorInExternalCss.html')
            .populate()
            .queue(function (assetGraph) {
                expect(err, 'to be an', Error);
                expect(err.message, 'to match', /parseError\.css/);
            })
            .run(done);
    });

    it('should handle a test case that has multiple neighbour @font-face rules', function (done) {
        new AssetGraph({root: __dirname + '/../../testdata/assets/Css/multipleFontFaceRules/'})
            .loadAssets('index.css')
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain asset', 'Css');
                expect(assetGraph.findAssets({type: 'Css'})[0].text.match(/@font-face/g), 'to have length', 3);

                assetGraph.findAssets({type: 'Css'})[0].markDirty();
                expect(assetGraph.findAssets({type: 'Css'})[0].text.match(/@font-face/g), 'to have length', 3);
            })
            .run(done);
    });

    it('should minify Css text', function () {
        var cssText = 'body {\n    background: red;\n}\n';
        var asset = new AssetGraph.Css({
            text: cssText
        });

        expect(asset.text, 'to be', cssText);

        asset.minify();
        expect(asset.text, 'to be', 'body{background:red}');
    });

    it('should pretty print Css text', function () {
        var cssText = 'body{background:red}';
        var asset = new AssetGraph.Css({
            text: cssText
        });

        expect(asset.text, 'to be', cssText);

        asset.prettyPrint();
        expect(asset.text, 'to be', 'body {background: red;}\n');
    });
});
