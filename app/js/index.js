'use strict';
window.HELP_IMPROVE_VIDEOJS = false;

function VideoPlayer() {
    var videoElem = document.createElement('VIDEO');
    videoElem.setAttribute('src', 'https://storage.googleapis.com/dynamic-video-hdfc/hdfc_yaris_final.mp4');
    videoElem.setAttribute('class', 'video-js vjs-fluid');
    videoElem.setAttribute('webkit-playsinline', '');
    videoElem.setAttribute('playsinline', '');
    videoElem.setAttribute('id', 'js--video-player');
    videoElem.setAttribute("poster", "./app/img/fon.png");
    this.video = videoElem;
    console.log(videoElem);
}

VideoPlayer.prototype.animationStart = (function(el) {
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

VideoPlayer.prototype.animationEnd = (function(el) {
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

VideoPlayer.prototype.fetchData = function(uri, callback) {
    var self = this;
    fetch(uri)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            self.data = myJson;
            callback();
        });
};

// VideoPlayer.prototype.init = function() {
//     var self = this;
//     var video = self.video;
//     let params = (new URL(document.location)).searchParams;
//     let name = params.get("id");

//     //this.fetchData ('data.json', function callback () {
//     this.fetchData('http://35.200.136.182:8083/video/' + name, function callback() {
//         console.log(self.data);
//         $('.js-name').text(self.data.text1);
//         $('.js-month').text(self.data.text2);
//         $('#animate3 .animate3__line2').append(
//             self.data.text3
//         );
//         CHARLIE.setup(video);
//         return;
//     });

VideoPlayer.prototype.init = function() {
    var self = this;
    var video = self.video;
    this.fetchData('data.json', function callback() {
        $('.js-name').text(self.data.text1);
        $('.js-month').text(self.data.text2);

        $('#animate3 .animate3__line2').append(
            self.data.text3
        );
        $('#animate4 .animate4__line2').text (
            self.data.text4line2
        );
        $('#animate4 .animate4__line3').text (
          self.data.text4line3
        );
        $('#animate4 .animate4__line4').text (
        self.data.text4line4
        );
        $('#animate6').text (
          self.data.special
        );
        // retargeting video element
        video = document.getElementsByClassName('vjs-tech')[0];
        CHARLIE.setup(video);
        return;
    });


    $('#videoPlayerWrapper').append(video);
    self.myPlayer = videojs('js--video-player', {
        controls: true,
        autoplay: false,
        preload: false,
    });

    self.myPlayer.el_.addEventListener(
        'webkitfullscreenchange',
        function() {
            self.handleFullScreen.call(this, event)
        }
    );
    var currentTime = 0;

    //This example allows users to seek backwards but not forwards.
    //To disable all seeking replace the if statements from the next
    //two functions with myPlayer.currentTime(currentTime);

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
        $(this.bigPlayButton.contentEl()).show();
        self.myPlayer.currentTime(0);
        self.myPlayer.controlBar.hide();
        self.myPlayer.bigPlayButton.show();
        self.myPlayer.cancelFullScreen();

    });
    self.myPlayer.on('play', function() {
        $(".button").removeClass('button-opacity');
        self.myPlayer.posterImage.hide();
        self.myPlayer.controlBar.show();
        self.myPlayer.bigPlayButton.hide();
    });

};
var vPlayer = new VideoPlayer(),
    video = vPlayer.video,
    textAnimationBlock = document.getElementById('textAnimationBlock');

VideoPlayer.prototype.handleFullScreen = function(event) {
    var self = this;
    console.log('handleFullScreen', event);
    /* Fullscreen */
    lockScreenInLandscape();

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
                // Note: It may silently fail in browsers that don't allow requesting
                // fullscreen from the orientation change event.
                // https://github.com/whatwg/fullscreen/commit/e5e96a9da944babf0e246980559cd80a46a300ca
                requestFullscreenVideo();
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



// };
// var vPlayer = new VideoPlayer (),
//   video = vPlayer.video,
//   textAnimationBlock = document.getElementById ('textAnimationBlock');

$(document).ready(function() {

    vPlayer.init();
    $('.vjs-fluid').append(textAnimationBlock);
    textAnimationBlock.classList.add('is-ready');


    // detect iOS full screen
    var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        
    if(iOS) {
        $('.vjs-fullscreen-control').hide();
    }

    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;
    if (isAndroid) {
        $('.vjs-fullscreen-control').hide();
    }

    // iOS special treatment
    var vidEl = document.getElementsByClassName('vjs-tech')[0];
    vidEl.addEventListener('pause', function() {

        if(iOS) {
            $('.charlie').each(function(){
                if ($(this).hasClass('animated')) {
                    $(this).css('-webkit-transform', $(this).css('-webkit-transform'))
                }
            })
        }
    })
    
   //controlbar at bottom
   function controlbarAtBottom() {
       var height = $('.vjs-control-bar').height();
       $('.vjs-control-bar').css('bottom', '-' + height + 'px');
   }
    controlbarAtBottom();
    window.addEventListener('resize', controlbarAtBottom);
    window.addEventListener('orientationchange', controlbarAtBottom);
});
