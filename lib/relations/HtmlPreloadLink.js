/**
 *  Implementation of http://w3c.github.io/preload/#dfn-preload
 */

var util = require('util'),
    extendWithGettersAndSetters = require('../util/extendWithGettersAndSetters'),
    HtmlRelation = require('./HtmlRelation');

function HtmlPreloadLink(config) {
    if (!config.to.url) {
        throw new Error('HtmlPreloadLink: The `to` asset must have a url');
    }

    HtmlRelation.call(this, config);
}

util.inherits(HtmlPreloadLink, HtmlRelation);

extendWithGettersAndSetters(HtmlPreloadLink.prototype, {
    get href() {
        return this.node.getAttribute('href');
    },

    set href(href) {
        this.node.setAttribute('href', href);
    },

    attach: function (asset, position, adjacentRelation) {
        this.node = asset.parseTree.createElement('link');
        this.node.setAttribute('rel', 'preload');
        this.node.setAttribute('type', this.to.contentType);
        this.attachNodeBeforeOrAfter(position, adjacentRelation);
        return HtmlRelation.prototype.attach.call(this, asset, position, adjacentRelation);
    },

    attachToHead: function (asset, position, adjacentNode) {
        this.node = asset.parseTree.createElement('link');
        this.node.setAttribute('rel', 'preload');

        if (this.as) {
            this.node.setAttribute('as', this.as);
        }

        if (this.to.contentType) {
            this.node.setAttribute('type', this.to.contentType);
        }

        HtmlRelation.prototype.attachToHead.call(this, asset, position, adjacentNode);

        if (this.crossorigin) {
            this.node.setAttribute('crossorigin', this.crossorigin);
        }
    },

    inline: function () {
        throw new Error('Not implemented');
    }
});

module.exports = HtmlPreloadLink;
