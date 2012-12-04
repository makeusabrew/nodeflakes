require('colors');

var Throughput = require('../throughput'),
    StatsD     = require ('node-statsd').StatsD;

var throughput = new Throughput(2000);

var stats = new StatsD(process.argv[2], 8125);

throughput.setStats(stats, 'processor');

var StreamProcessor = function() {
    this.process = function(data) {
        throughput.measure(data);

        var processed = null;
        try {
            processed = JSON.parse(data.toString('utf8'));
        } catch (e) {
            // couldn't parse
            stats.increment('nodeflakes.processor.parse_error');
            throw new Error("parse error of: "+data.toString('utf8'));
        }
        if (processed.text == null) {
            stats.increment('nodeflakes.processor.bad_format');
            throw new Error("discarding message with bad format - assuming delete or rate limit info".bold);
        }
            
        var filter = new RegExp("fuck|shit|bollocks|\bdick\b|pussy|cunt|\bporn\b|\bsex\b", "i");

        // see the footnote at the bottom of this file RE unicode issues
        var newText = quote(processed.text);

        if (processed.text != newText) {
            processed.text = newText.replace(/\\u([A-Fa-f0-9]){4}/g, '');
        }

        var fullTweet = processed.user.screen_name+": "+processed.text;

        if (filter.test(fullTweet)) {
            stats.increment('nodeflakes.processor.filter.profanity');
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
                    stats.increment('nodeflakes.processor.filter.spam');
                    throw new Error("SPAM FILTER:".yellow+" excessive link volume ("+j+"): "+fullTweet);
                } else if (j == 3 && processed.user.followers_count < 50 ||
                           j == 2 && processed.user.followers_count < 10 ||
                           j == 1 && processed.user.followers_count == 0) {

                    stats.increment('nodeflakes.processor.filter.spam');
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
        stats.increment('nodeflakes.processor.tweet');
        return JSON.stringify(tweetData);
    }
}

module.exports = StreamProcessor;

/**
 * thanks massively to the sockjs project for taking on this horrific unicode issue. This code is lifted directly from
 * https://github.com/sockjs/sockjs-node/blob/dev/src/utils.coffee - all credit to @majek whose work it is entirely
 */
var escapable, lookup, unroll_lookup, quote;

escapable = /[\x00-\x1f\ud800-\udfff\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufff0-\uffff]/g;

unroll_lookup = function(escapable) {
  var c, i, unrolled;
  unrolled = {};
  c = (function() {
    var _results;
    _results = [];
    for (i = 0; i < 65536; i++) {
      _results.push(String.fromCharCode(i));
    }
    return _results;
  })();
  escapable.lastIndex = 0;
  c.join('').replace(escapable, function(a) {
    return unrolled[a] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  });
  return unrolled;
};

lookup = unroll_lookup(escapable);

var doLog = false;
quote = function(string) {
  var quoted = string;
  //quoted = JSON.stringify(string);
  escapable.lastIndex = 0;
  if (!escapable.test(quoted)) return quoted;
  var retString = quoted.replace(escapable, function(a) {
    return lookup[a];
  });
  return retString;
};

