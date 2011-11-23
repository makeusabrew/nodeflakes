var Throughput = require('../throughput');
require('colors');

var throughput = new Throughput();

var StreamProcessor = function() {
    this.process = function(data) {
        var rate = throughput.measure(data);
        console.log("processing message ("+rate.value+" "+rate.unit+")");
        var processed = null;
        try {
            processed = JSON.parse(data.toString('utf8'));
        } catch (e) {
            // couldn't parse
            throw new Error("parse error of: "+data.toString('utf8'));
        }
        if (processed.text == null) {
            throw new Error("discarding message with bad format - assuming delete or rate limit info".bold);
        }
            
        var filter = new RegExp("fuck|shit|bollocks|\bdick\b|pussy|cunt|\bporn\b|\bsex\b", "i");

        var fullTweet = processed.user.screen_name+": "+processed.text;

        if (filter.test(fullTweet)) {
            throw new Error("PROFANITY FILTER:".red+" ["+fullTweet+"]");
        }

        var orderedEntities = [];
        var entityTypes = ['urls', 'media', 'hashtags', 'user_mentions'];
        var i = entityTypes.length;

        // let's make a flat array of entities
        while (i--) {
            var eType = entityTypes[i];
            if (typeof processed.entities[eType] == 'undefined') {
                // media is a new entity so isn't always present
                continue;
            }

            var j = processed.entities[eType].length;

            var matchDups = false;
            if (eType == 'urls') {
                // spam stuff
                if (j >= 4) {
                    throw new Error("SPAM FILTER:".yellow+" excessive link volume ("+j+"): "+fullTweet);
                } else if (j == 3 && processed.user.followers_count < 50 ||
                           j == 2 && processed.user.followers_count < 10 ||
                           j == 1 && processed.user.followers_count == 0) {

                    throw new Error("SPAM FILTER:".yellow+" excessive link Vs follower count ("+j+" Vs "+processed.user.followers_count+"): "+fullTweet);

                } else if (j >= 2) {
                    matchDups = true;
                }
            }
            while (j--) {
                var entity = processed.entities[eType][j];
                entity.eType = eType;
                orderedEntities.push(entity);
            }
        }

        // get the entities array in ascending order
        orderedEntities.sort(function(a, b) {
            return a.indices[0] - b.indices[0];
        });

        var tweetData = {
            "id" : processed.id,
            "text" : processed.text,
            "entities" : orderedEntities,
            "user": {
                "followers_count": processed.user.followers_count,
                "screen_name": processed.user.screen_name
            }
        };
        return JSON.stringify(tweetData);
    }
}

module.exports = StreamProcessor;
