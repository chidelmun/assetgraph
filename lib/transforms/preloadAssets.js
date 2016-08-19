// Map Assetgraph relations to request destination (<link as="${destination}">).
// See https://fetch.spec.whatwg.org/#concept-request-destination
var RelationToType = {
    'HtmlScript': 'script',
    'HtmlStyle': 'style'
    // FIXME: Add all relevant relation types
};

module.exports = function (queryObj) {
    // DICSUSSION: Assetgraph internals. Should this transform take a query object or be opinionated?

    return function preloadAssets(assetGraph) {
        // Gather all relations that make sense to preload
        // FIXME: Have a discussion with community about a strategy here
        var preloadRelations = assetGraph.findRelations({
            type: ['HtmlStyle', 'HtmlScript'], // DISCUSSION: Which assets are the most important to preload?
            crossorigin: false, // DISCUSSION: Should cross origin assets be excluded?
            to: {
                url: function (url) { return url; } // not inline
            }
        }, true);

        preloadRelations.forEach(function (relation) {
            // Make sure a preload link doesn't already exist
            var existingLink = relation.from.outgoingRelations.some(function (outgoing) {
                return outgoing.type === 'HtmlPreloadLink' && outgoing.to.url === relation.to.url;
            });

            if (!existingLink) {
                var preloadRelation = new assetGraph.HtmlPreloadLink({
                    to: {
                        url: relation.to.url
                    },
                    as: RelationToType[relation.type]
                });

                preloadRelation.attachToHead(relation.from, 'last'); // DISCUSSION: What is the optimal position in <head> for a preload link?
            }
        });

    };
};
