var Flake = function() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.maxVelocity = 0;
    this.size = 0;
    this.elem = null;
    this.tweet = null;
    this.angle = 0;
    this.rotation = 0;
    this.dying = false;
    this.dead = false;
    this.tweetVisible = false;
    this.processedTweet = null;
}

Flake.prototype = {
    spawn: function(options) {
        this.tweet = options.tweet;

        this.x = options.x;
        this.y = options.y;
        this.size = options.size;
        this.angle = Math.random() * 2*Math.PI;

        // how fast the flake will complete its rotary cycle, e.g. how fast it switches from left to right movement
        this.rotation = 0.02 + Math.random() * 1.5;

        // a little bit of vertical spice
        this.vy = -3 + Math.random() * 4;

        this.maxVelocity = 10 + Math.random() * 20;
        
        var rotationDir = Math.floor(Math.random()*2) ? "clockwise" : "anticlockwise";
        var rotationSpeed = 9 + Math.floor(Math.random()*21);

        this.elem = $(
            "<img class='flake' src='http://localhost:7979/img/flake.png' alt='' >"
        ).css({
            "left": this.x,
            "top": this.y,
            "width": this.size,
            "height": this.size,
            //"-webkit-animation-name": "rotate-"+rotationDir,
            "-webkit-animation-duration": rotationSpeed+"s"
        });

        Engine.getElement().append(this.elem);

        // wire up hover handlers
        var that = this;

        // we could change this to $("body").delegate(".flake") - might be faster?
        // but we'll have to attach a reference to our flake somehow if so.
        this.elem.mouseover(function(e) {
            if (!that.isTweetVisible()) {
                that.showTweet();
            }
        });

    },

    tick: function(delta) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        // NB no delta on the (horribly hard coded) velocity, since when we actually
        // add vx to the current position, we account for delta there. So, this value
        // will be capped from 0 - 40 based on the angle.
        this.vx = Math.cos(this.angle) * (40);

        // @todo move this hard coded acceleration value
        this.vy += 5 * delta;

        if (this.vy > this.maxVelocity) {
            this.vy = this.maxVelocity;
        }

        this.angle += this.rotation * delta;
    },
    
    kill: function() {
        this.dying = false;
        this.dead = true;
        this.elem.remove();
    },

    render: function() {
        this.elem.css({
            "left": this.x | 0,
            "top": this.y | 0
        });
    },

    getBottom: function() {
        return this.y + this.size;
    },

    getRight: function() {
        return this.x + this.size;
    },

    isDying: function() {
        return this.dying;
    },

    isDead: function() {
        return this.dead;
    },

    isWithinViewport: function(viewport) {
        // we only care about y for now
        return (this.getBottom() >= viewport.y && this.y <= (viewport.y + viewport.h));
    },

    startDeath: function(fadeTime) {
        this.dying = true;
        var that = this;
        this.elem.fadeOut(fadeTime, function() {
            that.kill();
        });
    },
    
    getProjectedBottom: function(msec) {
        return this.getBottom() + (this.vy * (msec/1000));
    },

    isTweetVisible: function() {
        return this.tweetVisible;
    },

    showTweet: function() {
        this.tweetVisible = true;
        // render it
        var elem = $(
            "<div class='tweet'></div>"
        ).html(
            this.renderTweet()
        ).css({
            "left": this.getRight() + 20
        }).hide();

        Engine.getElement().append(elem);

        elem.css({
            "top":  this.y + (this.size / 2) - (elem.height() / 2)
        });

        // this looks worse than it is, it's just a chain of callbacks to
        // 1. show the tweet
        // 2. fade out the tweet
        // 3. remove the tweet from DOM and set the isVisible boolean back to false
        var that = this;
        elem.fadeIn(1000, function() {
            setTimeout(function() {
                elem.fadeOut(1000, function() {
                    elem.remove();
                    that.tweetVisible = false;
                });
            }, 3000);
        });
    },

    renderTweet: function() {
        if (this.processedTweet == null) {
            var text = this.tweet.text;
            var str = "<a class='author' href='http://twitter.com/"+this.tweet.user.screen_name+"'>"+this.tweet.user.screen_name+"</a>: ";

            var orderedEntities = [];
            var entityTypes = ['urls', 'media', 'hashtags', 'user_mentions'];
            var i = entityTypes.length;

            // let's make a flat array of entities
            while (i--) {
                var eType = entityTypes[i];
                if (typeof this.tweet.entities[eType] == 'undefined') {
                    // media is a new entity so isn't always present
                    continue;
                }

                var j = this.tweet.entities[eType].length;
                while (j--) {
                    var entity = this.tweet.entities[eType][j];
                    entity.type = eType;
                    orderedEntities.push(entity);
                }
            }

            // get the entities array in ascending order
            orderedEntities.sort(function(a, b) {
                return a.indices[0] - b.indices[0];
            });

            var i = orderedEntities.length;
            while (i--) {
                var entity = orderedEntities[i];
                var start = entity.indices[0];
                var end = entity.indices[1];

                var insert = "";
                switch (entity.type) {
                    case 'urls':
                        var url = entity.display_url || entity.url
                        insert = "<a class='url' href='"+entity.url+"'>"+url+"</a>";
                        break;

                    case 'media':
                        var url = entity.display_url || entity.media_url
                        insert = "<a class='url' href='"+entity.media_url+"'>"+url+"</a>";
                        break;

                    case 'user_mentions':
                        insert = "<a class='mention' href='http://twitter.com/"+entity.screen_name+"'>"+text.substring(start, end)+"</a>";
                        break;

                    case 'hashtags':
                        insert = "<strong class='hashtag'>"+text.substring(start, end)+"</strong>";
                        break;

                    default:
                        break;
                }

                text = text.substring(0, start) + insert + text.substring(end);
            }
            str += text;

            this.processedTweet = str;
        }
        return this.processedTweet;
    }
};
