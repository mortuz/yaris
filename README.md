# Pictore Plugin

# Installation
```
Install nodejs
npm i gulp -g
npm install
gulp
```
pictor is a tool that helps you to create HTML5 elements on HTML5 VIDEO  player.

# Setup

```
var config = {
  videoUrl: 'path/to/video',
    posterUrl: 'path/to/poster',
    textUrl: 'path/to/json_file',
    rules: [
        {
          id: 'desired id of the element',
          animations: 'name of the animations comma separated',
          times: 'timing',
          target: 'JSON key to hook with',
          class: 'class name',
          parent: 'if you want to make it a child element, provide jQuery selector of parent',
          tag: 'by default it will create a div, if you want anchor tag provide "a"'
          href: 'for anchor to refer',
          text: 'text inside',
          newWindow: 'true or false, this will open link in  a new window',
        }
    ]
};

var pictor = new Pictor(config);
pictor.init();
```
# Added new brach "croma"
Place all the configuration in config.js
For logs open pictor.js, there in _handleError method add the codes for pushing logs. 