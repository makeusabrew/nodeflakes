var Flake = function() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.maxVelocity = 0;
    this.size = 0;
    this.elem = null;
    this.position = null;
    this.tweet = null;
    this.angle = 0;
    this.rotation = 0;
    this.rotationDir = "";
    this.rotationSpeed = 0;
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
        // we've de-spiced a lot so users can see their tweets quicker. Boring.
        this.vy = -1 + Math.random() * 2;

        this.maxVelocity = 10 + Math.random() * 20;
        this.rotationDir = Math.floor(Math.random()*2) ? "clockwise" : "anticlockwise";
        this.rotationSpeed = 9 + Math.floor(Math.random()*21);

        
        var img = null;
        var images = {
            "small": [
                "flake_10_3.png",
                "flake_16_1.png",
                "flake_16_2.png",
                "flake_16_3.png"
            ],
            "medium": [
                "flake_32_1.png",
                "flake_32_2.png",
                "flake_48_1.png",
                "flake_48_2.png",
                "flake_48_3.png"
            ],
            "large": [
                "flake_128_1.png",
                "flake_128_2.png",
                "flake_128_3.png"
            ]
        };

        if (this.tweet.text.search(/#nodeflakes/i) != -1) {
            if (this.size < 20) {
                this.y -= 20 - this.size;
                this.size = 20;
            }
            img = 'nodeflake.png';
            SoundManager.playSound('nodeflake');
        } else if (this.size < 17) {
            img = images.small[Math.floor(Math.random() * images.small.length)];
        } else if (this.size < 49) {
            img = images.medium[Math.floor(Math.random() * images.medium.length)];
        } else {
            img = images.large[Math.floor(Math.random() * images.large.length)];
        }

        this.elem = $(
            //"<img class='flake' src='http://localhost:7979/img/"+img+"' alt='' >"
            "<div class='flake'>*</div>"
        ).css({
            "left": this.x,
            "top": this.y,
            //"width": this.size,
            //"height": this.size,
            "font-size": this.size
        });
        
        if (Engine.setting('animations')) {
            this.animate();
        }

        if (Engine.setting('acceleration')) {
            this.elem.addClass('threedee');
        }


        Engine.getElement().append(this.elem);
        this.position = this.elem.get(0).style;

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

    animate: function() {
        this.elem.css({
            "-webkit-animation-name": "rotate-"+this.rotationDir,
            "-webkit-animation-duration": this.rotationSpeed+"s"
        }).addClass("animated");
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
        this.position.left = (this.x | 0) + "px";
        this.position.top = (this.y | 0) + "px";
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
        ).hide();

        Engine.getElement().append(elem);

        var position = {
            "left": 0,
            "top" : 0
        };

        // ensure tweet is rendered within bounds

        // ideally we want the tweet to render half way down the flake
        var idealTop = this.y + (this.size / 2) - (elem.height() / 2);
        if (idealTop >= 0) {
            // but only if it keeps the whole tweet on screen
            position.top = idealTop;
        }

        // by default we want to render the tweet 20px to the right of the flake
        if (this.getRight() + elem.width() + 20 < Engine.getViewport().x + Engine.getViewport().w) {
            position.left = this.getRight() + 20;
        } else {
            // but if that's not possible, settle for left instead
            position.left = this.x - 20 - elem.width();
        }

        elem.css(position);

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

            var photo = null;

            var i = this.tweet.entities.length;
            while (i--) {
                var entity = this.tweet.entities[i];
                var start = entity.indices[0];
                var end = entity.indices[1];

                var insert = "";
                switch (entity.eType) {
                    case 'urls':
                        var url = entity.display_url || entity.url
                        insert = "<a class='url' href='"+entity.url+"'>"+url+"</a>";
                        break;

                    case 'media':
                        var url = entity.display_url || entity.media_url
                        insert = "<a class='url' href='"+entity.media_url+"'>"+url+"</a>";

                        if (entity.type == 'photo' && photo == null) {
                            photo = "<img class='photo' src='"+entity.media_url+":thumb' alt='' />";
                        }
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

            if (photo) {
                str = photo+str;
            }

            this.processedTweet = str;
        }
        return this.processedTweet;
    }
};
