var Flake = function() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 0;
    this.elem = null;
    this.tweet = null;
    this.angle = 0;
    this.rotation = 0;
    this.dying = false;
    this.dead = false;
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

        this.elem = $(
            "<img class='tweet' title='"+this.tweet.text+"' src='img/flake.png' alt='' >"
        ).css({
            "left": this.x,
            "top": this.y,
            "width": this.size,
            "height": this.size
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

        if (this.vy > 25) {
            this.vy = 25;
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
    }
};
