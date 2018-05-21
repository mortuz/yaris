'use strict';
var voiceAvailable = false;
var pausetime = 1;
var voiceId;

HTMLElement.prototype.requestFullscreen = HTMLElement.prototype.requestFullscreen || HTMLElement.prototype.webkitRequestFullscreen;
HTMLDocument.prototype.exitFullscreen = HTMLDocument.prototype.exitFullscreen || HTMLDocument.prototype.webkitExitFullscreen;

if (!('fullscreenElement' in document)) {
    Object.defineProperty(document, 'fullscreenElement', {
        get: function() {
            return document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement;
        }
    });
}

for (var prefixedFullscreenChangeEvent of['webkitfullscreenchange']) {
    document.addEventListener(prefixedFullscreenChangeEvent, function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();




        var fullscreenChange = document.createEvent('Event');
        fullscreenChange.initEvent('fullscreenchange', true /*bubbles */ , false /* cancelable */ );
        event.target.dispatchEvent(fullscreenChange);

        //   toggle class vjs-fullscreen
        // full screen issue fix
        var videoElem = document.getElementById('js--video-player');
        if (document.fullscreenElement)
            videoElem.classList.add('vjs-fullscreen');
        else
            videoElem.classList.remove('vjs-fullscreen');
    });
}

window.HELP_IMPROVE_VIDEOJS = false;

function Pictor(config) {
    var videoElem = document.createElement('video');
    if (config) {
        this.config = config;
        videoElem.setAttribute('src', config.videoUrl);
        videoElem.setAttribute('class', 'video-js vjs-fluid');
        videoElem.setAttribute('webkit-playsinline', '');
        videoElem.setAttribute('playsinline', '');
        videoElem.setAttribute('id', 'js--video-player');
        videoElem.setAttribute("data-matomo-title", 'HDFC Toyota Yaris');
        if (config.posterUrl) {
            videoElem.setAttribute("poster", config.posterUrl);
        }
        video = videoElem;
    }

    this.video = videoElem;
}

Pictor.prototype.animationStart = (function(el) {
    var animations = {
        animation: 'animationstart',
        OAnimation: 'oAnimationStart',
        MozAnimation: 'mozAnimationStart',
        WebkitAnimation: 'webkitAnimationStart',
    };

    for (var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
})(document.createElement('div'));

Pictor.prototype.animationEnd = (function(el) {
    var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
    };
    for (var t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
    animateFinish();
})(document.createElement('div'));

Pictor.prototype.fetchData = function(uri, callback) {
    var self = this;
    console.log('fetch', uri)
    fetch(uri)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            // self.data = myJson[0];
            self.data = myJson;
            callback();
        });
};


Pictor.prototype.init = function() {
    var self = this,
        config = self.config;
    // var video = self.video;
    var pathArray = window.location.pathname.split('/');
    var id = pathArray[pathArray.length - 1]
    this.fetchData('data.json', function callback() {
        voiceId = id;

        new Promise(function(resolve, reject) {
            self._handleRules(config.rules);
            resolve('done');
        }).then(function() {
            // retargeting video element 
            var firstName = self.data['text1'].split(" ");
            firstName = firstName[0];
            var payload = {
                id: id,
                message: "Hello " + firstName
            };

            $.ajax({
                url: '/voice/' + id,
                type: 'get',
                dataType: 'json',
                success: function(data) {
                    console.log("Got: " + data.success);
                    if (data.success == "failed") {
                        voiceAvailable = false;
                    } else {
                        voiceAvailable = true;

                    }
                    //alert("Data: " + data.success); 
                },
                data: payload
            });
            var v = document.getElementsByClassName('vjs-tech')[0];
            CHARLIE.setup(v);

            $('.charlie').on(self.animationStart, function(el) {
                var $number = $(this).find('.number');
                // console.log('animate start', $number)
                if ($number.hasClass('shuffle') && !$number.hasClass('shuffled')) {
                    $number.addClass('shuffled');
                    self.numberAnimation(parseFloat($number.text()), this);
                }
            });
        });
    });

    $('#videoPlayerWrapper').append(self.video);
    self.myPlayer = videojs('js--video-player', {
        controls: true,
        autoplay: false,
        preload: false,
    });

    // create restart button
    $('#js--video-player').append('<button class="vjs-icon-replay vjs-replay-button"></button>');

    if (self.isiOS()) {
        $('.vjs-fullscreen-control').hide();
    }

    $('.vjs-fluid').prepend(textAnimationBlock);
    textAnimationBlock.classList.add('is-ready');

    var currentTime = 0;
    self.myPlayer.el_.addEventListener('webkitfullscreenchange', function() {
        self.handleFullScreen.call(this, event);
    });

    self.controlbarAtBottom();
    self.iOSHotFix();
    //This example allows users to seek backwards but not forwards. 
    //To disable all seeking replace the if statements from the next 
    //two functions with myPlayer.currentTime(currentTime); 

    //Sound vars
    var timeout
    var assetsPath = "/sounds/";
    var sounds;

    function soundLoaded(event) {
        //examples.hideDistractor(); 
        // var div = document.getElementById(event.id); 
        // div.style.backgroundImage = "url('../_assets/art/audioButtonSheet.png')"; 
    }

    //This example allows users to seek backwards but not forwards.
    //To disable all seeking replace the if statements from the next
    //two functions with myPlayer.currentTime(currentTime);
    var timeout;
    self.myPlayer.on('waiting', function() {
        if (!shouldWait) return;
        if (self.myPlayer.currentTime() < 1) return;
        self.myPlayer.pause();
        if (timeout) return;
        timeout = setTimeout(function() {
            self.myPlayer.play();
            timeout = '';
        }, 5000)
    })


    self.myPlayer.on('seeking', function(event) {
        if (currentTime < self.myPlayer.currentTime()) {
            self.myPlayer.currentTime(currentTime);
        }
    });

    self.myPlayer.on('seeked', function(event) {
        if (currentTime < self.myPlayer.currentTime()) {
            self.myPlayer.currentTime(currentTime);
        }
    });
    self.myPlayer.on('ended', function() {
        $(".button").addClass("button-opacity");
        self.myPlayer.posterImage.show();
        $(this.posterImage.contentEl()).show();
        self.myPlayer.currentTime(0);
        self.myPlayer.controlBar.hide();
        self.myPlayer.bigPlayButton.removeClass('video-paused');
        self.myPlayer.bigPlayButton.hide();
        // self.myPlayer.cancelFullScreen();
        $('.vjs-replay-button').removeClass('video-paused').show();

    });
    self.myPlayer.on('play', function() {
        $(".button").removeClass('button-opacity');
        shouldWait = false;
        self.myPlayer.posterImage.hide();
        self.myPlayer.controlBar.show();
        self.myPlayer.bigPlayButton.hide();
        if (self.myPlayer.bigPlayButton.hasClass('video-paused')) {
            self.myPlayer.bigPlayButton.removeClass('video-paused');
        }
        if ($('.vjs-replay-button').hasClass('video-paused')) {
            $('.vjs-replay-button').removeClass('video-paused');
        }
        $('.vjs-replay-button').hide();
        if ($('.shuffle').hasClass('shuffled')) {
            $('.shuffle').removeClass('shuffled');
        }
        //Sound init
        if (voiceAvailable == true) {
            sounds = [{
                    src: voiceId + ".mp3",
                    id: 1
                } //OJR would prefer a new sound rather than a copy 
            ];
            createjs.Sound.alternateExtensions = ["mp3"]; // add other extensions to try loading if the src file extension is not supported 
            createjs.Sound.addEventListener("fileload", createjs.proxy(soundLoaded, this)); // add an event listener for when load is completed 
            createjs.Sound.registerSounds(sounds, assetsPath);
        }


    });

    self.myPlayer.on('timeupdate', function() {
        if (self.myPlayer.currentTime() > 0) {
            shouldWait = true;
        }
        if (Math.floor(self.myPlayer.currentTime()) == pausetime && self.myPlayer.currentTime() < 1.3) {

            if (voiceAvailable == true) {
                console.log("Speaking now" + Math.floor(self.myPlayer.currentTime()));
                var instance = createjs.Sound.play(1);
            }
        }
    });

    $('.vjs-replay-button').on('click', function() {
        shouldWait = false;
        self.myPlayer.currentTime(0);
        $(this).hide();
        self.myPlayer.play();
    });

    self.myPlayer.on('pause', function() {
        // console.log('video pause');
        // console.log(self.video.currentTime);
        self.myPlayer.bigPlayButton.addClass('video-paused');
        $('.vjs-replay-button').addClass('video-paused').show();
    });

};
var video,
    shouldWait = false,
    textAnimationBlock = document.getElementById('textAnimationBlock');
console.log(video, textAnimationBlock)

Pictor.prototype.handleFullScreen = function(event) {
    var self = this;
    // console.log('handleFullScreen', event);
    /* Fullscreen */
    lockScreenInLandscape();
    // console.log(video, textAnimationBlock)


    function requestFullscreenVideo() {
        if (videoPlayerWrapper.requestFullscreen) {
            videoPlayerWrapper.requestFullscreen();
        } else {
            video.webkitEnterFullscreen();
        }
    }

    if ('orientation' in screen) {
        screen.orientation.addEventListener('change', function() {
            // Let's automatically request fullscreen if user switches device in landscape mode.
            if (screen.orientation.type.startsWith('landscape')) {
                console.log('orientation change')
                    // Note: It may silently fail in browsers that don't allow requesting
                    // fullscreen from the orientation change event.
                    // https://github.com/whatwg/fullscreen/commit/e5e96a9da944babf0e246980559cd80a46a300ca
                    // requestFullscreenVideo();
            } else if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        });
    }

    function lockScreenInLandscape() {
        if (!('orientation' in screen)) {
            return;
        }

        // Let's force landscape mode only if device is in portrait mode and can be held in one hand.
        if (
            matchMedia('(orientation: portrait) and (max-device-width: 768px)')
            .matches
        ) {
            screen.orientation.lock('landscape').then(function() {
                // When screen is locked in landscape while user holds device in
                // portrait, let's use the Device Orientation API to unlock screen only
                // when it is appropriate to create a perfect and seamless experience.
                listenToDeviceOrientationChanges();
            });
        }
    }

    function listenToDeviceOrientationChanges() {
        if (!('DeviceOrientationEvent' in window)) {
            return;
        }

        var previousDeviceOrientation, currentDeviceOrientation;
        window.addEventListener(
            'deviceorientation',
            function onDeviceOrientationChange(event) {
                // event.beta represents a front to back motion of the device and
                // event.gamma a left to right motion.
                if (Math.abs(event.gamma) > 10 || Math.abs(event.beta) < 10) {
                    previousDeviceOrientation = currentDeviceOrientation;
                    currentDeviceOrientation = 'landscape';
                    return;
                }
                if (Math.abs(event.gamma) < 10 || Math.abs(event.beta) > 10) {
                    previousDeviceOrientation = currentDeviceOrientation;
                    // When device is rotated back to portrait, let's unlock screen orientation.
                    if (previousDeviceOrientation == 'landscape') {
                        screen.orientation.unlock();
                        window.removeEventListener(
                            'deviceorientation',
                            onDeviceOrientationChange
                        );
                    }
                }
            }
        );
    }
};

Pictor.prototype._handleRules = function(rules) {

    var self = this;
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        self._createElem(rule);
    }
}

Pictor.prototype._createElem = function(elem) {
    var element;
    var self = this;
    if (elem.tag) {
        element = document.createElement(elem.tag);
    } else {
        element = document.createElement('div');
    }

    var textContainer = document.getElementById('textAnimationBlock');

    if (elem.id) {
        element.setAttribute('id', elem.id);
    }

    if (elem.href) {
        element.setAttribute('href', elem.href);
    }

    if (elem.hrefTarget) {
        element.setAttribute('href', self.data[elem.hrefTarget]);
    }

    if (elem.newWindow) {
        element.setAttribute('target', '_blank');
    }

    if (elem.animations) {
        element.setAttribute('data-animations', elem.animations);
    }

    if (elem.times) {
        element.setAttribute('data-times', elem.times);
    }

    if (elem.class) {
        element.setAttribute('class', elem.class);
    }

    if (elem.target && !elem.split) {
        var text = document.createTextNode(self.data[elem.target]);
        element.appendChild(text);
    }

    if (elem.text) {
        var text = document.createTextNode(elem.text);
        element.appendChild(text);
    }

    if (elem.bgImg) {
        element.style.background = "url(" + self.data[elem.bgImg] + ") center no-repeat";
        element.style.backgroundSize = "contain";
    }



    if (elem.parent) {
        // append to parent
        $(elem.parent).append(element);
    } else {
        $('#textAnimationBlock').append(element);
    }
    if (elem.split) {
        self.splitUp(self.data[elem.target], '#' + elem.id, elem.split.separator, elem.split.time)
    }
}

Pictor.prototype._handleOrientationChange = function() {
    var self = this;
    // var portrait = (window.orientation % 180 == 0);
    // if( window.orientation % 180 == 0) {
    //   // $("body").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "");

    // }
    switch (window.orientation) {
        case 90 || -90:
            break;
        default:
            console.log('Portrait');
            // alert('Portrait');
            var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (fullscreenElement) {
                fullscreenElement.exitFullscreen();
            }
    }

}

Pictor.prototype.isiOS = function() {
    return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
}

Pictor.prototype.isAndroid = function() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("android") > -1;
}

Pictor.prototype.controlbarAtBottom = function() {
    var self = this;
    var height = $('.vjs-control-bar').height();
    $('.vjs-control-bar').css('bottom', '-' + height + 'px');

    window.addEventListener('resize', self.controlbarAtBottom);
    window.addEventListener('orientationchange', self.controlbarAtBottom);
    window.addEventListener('orientationchange', self._handleOrientationChange);
}

Pictor.prototype.iOSHotFix = function() {
    var self = this;

    self.myPlayer.on('pause', function() {

        if (self.isiOS()) {
            $('.charlie').each(function() {
                if ($(this).hasClass('animated')) {
                    $(this).css('-webkit-transform', $(this).css('-webkit-transform'));
                }
            })
        }
    })
}