var SoundManager = (function() {
    var self = {};

    var _loadedSounds = {},
        _aliases = {},
        _muted = false,
        _booted = false;

    self.toggleSounds = function() {
        _muted = !_muted;
    }

    self.mute = function() {
        _muted = true;
    }

    self.unmute = function() {
        _muted = false;
    }

    self.preloadSound = function(path, alias) {
        if (_loadedSounds[path] == null) {

            var sound = new Audio(path);
            sound.load();

            _loadedSounds[path] = sound;
        } else {
            console.log("not preloading sound - already loaded ["+path+"]");
        }

        if (alias != null) {
            _aliases[alias] = path;
        }
    }

    self.playSound = function(path) {
        if (_muted) {
            return;
        }

        if (_loadedSounds[path] == null) {
            // check aliases
            if (_aliases[path] != null) {
                path = _aliases[path];
            } else {
                console.log("warning - "+path+" was not preloaded - aborting");
                return;
            }
                
        }
        _loadedSounds[path].play();
    }

    self.pauseSound = function(path) {
        if (_muted) {
            return;
        }

        if (_loadedSounds[path] == null) {
            if (_aliases[path] != null) {
                path = _aliases[path];
            }
        }

        _loadedSounds[path].pause();
    }

    /**
     * filthy workaround to attempt to get iOS devices to load each sound properly
     * doesn't work though - well, only for one sound
    self.bootSounds = function() {
        if (_booted) {
            return;
        }
        var asArray = [];
        for (var i in _loadedSounds) {
            asArray.push(i);
        }
        function playSound(index) {
            if (asArray.length <= index) {
                return;
            }
            var p = asArray[index];
            _loadedSounds[p].addEventListener('ended', function() {
                alert("ended");
                //_loadedSounds[p].removeEventListener('ended', arguments.callee, false);
                playSound(++index);
            });
            _loadedSounds[p].play();
        }
        playSound(0);
        _booted = true;
    }
    */

    return self;
})();
