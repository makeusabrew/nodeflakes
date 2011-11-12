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
}

Flake.prototype = {
    spawn: function(options) {
        this.tweet = options.tweet;

        this.x = options.x;
        this.y = options.y;
        this.size = options.size;
        this.angle = Math.random() * 2*Math.PI;

        // how fast the flake will complete its rotary cycle, e.g. how fast it switches from left to right movement
        this.rotation = 0.05 + Math.random() * 2;

        // a little bit of vertical spice
        this.vy = -3 + Math.random() * 4;

        this.maxVelocity = 10 + Math.random() * 20;

        this.elem = $(
            "<img class='flake' src='img/flake.png' alt='' >"
        ).css({
            "left": this.x,
            "top": this.y,
            "width": this.size,
            "height": this.size
        });

        Engine.getElement().append(this.elem);

        // wire up hover handlers
        var that = this;
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
            this.tweet.text
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
    }
};
