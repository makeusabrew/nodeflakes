var Flake = function() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 0;
    this.elem = null;
    this.tweet = null;
}

Flake.prototype = {
    spawn: function(options) {
        this.tweet = options.tweet;

        this.x = options.x;
        this.y = options.y;

        this.size = Math.round(10 + (this.tweet.user.followers_count / 100));
        this.elem = $(
            "<img class='tweet' title='"+this.tweet.text+"' src='img/flake.gif' alt='' >"
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

        this.vy += 10 * delta;
    },

    render: function() {
        this.elem.css({
            "left": this.x | 0,
            "top": this.y | 0
        });
    }
};
