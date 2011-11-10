var Flake = function() {
    this.x = 0;
    this.y = 0;
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
            "width": this.size,
            "height": this.size
        });
    },

    tick: function() {
        // gravity.
    },

    render: function() {
        this.elem.css({
            "left": this.x,
            "top": this.y
        });
    }
};
