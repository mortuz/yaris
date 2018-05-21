var config = {
  // config here
  videoUrl:
    'https://storage.googleapis.com/pictor-demo-videos/hdfc-yaris/yaris_empty.mp4',
  // posterUrl: './app/img/yaris_poster.png',
  textUrl: 'data.json',
  rules: [
    {
      id: 'animate1',
      class: 'charlie',
      animations: 'animate-start, animate-finish',
      times: '1,5.4',
      target: 'text1'
    },
    {
      id: 'fon-animate1',
      class: 'charlie',
      animations: 'animate-start, animate-finish',
      times: '1,5.4',
      target: 'text1'
    },
    {
      id: 'animate2',
      class: 'charlie',
      animations: 'animate-start, animate-finish',
      times: '11.2,16',
      text: '₹ '
    },
    {
      tag: 'span',
      class: 'number shuffle',
      parent: '#animate2',
      target: 'text2'
    },
    {
      tag: 'span',
      text: ' Lacs',
      parent: '#animate2'
    },
    {
      id: 'animate3',
      tag: 'a',
      hrefTarget: 'urlButton',
      class: 'charlie',
      animations: 'animate-start2, animate-finish',
      times: '12.3, 32',
      newWindow: true,
      target: 'text3'
    },
    {
      id: 'animate4',
      class: 'charlie',
      animations: 'animate-start',
      times: '32.5',
      target: 'text4'
    },
    {
      tag: 'a',
      id: 'animate5',
      class: 'charlie',
      animations: 'animate-start',
      times: '32.5',
      newWindow: true,
      hrefTarget: 'urlButton'
    }
  ]
};
var pictor = new Pictor(config);

pictor.init();

// Only for this project
pictor.myPlayer.on('ended', function() {
  pictor.myPlayer.poster('./app/img/yaris_poster.png');
  $('#animate4').css('opacity', 1);
});

pictor.myPlayer.on('play', function () {
  // console.log()
  $('#animate1').css('opacity', 0);
  $('#animate4').css('opacity', 0);
});

pictor.myPlayer.on('pause', function() {
  if ($('#animate1').hasClass('animated') ) {
    $('#animate1').css('opacity', $('#animate1').css('opacity'));

    $('#animate1').on(pictor.animationEnd, function () {
      // console.log('animation end');
      $('#animate1').css('opacity', 0);
    })

    pictor.myPlayer.on('seeked', function() {
      $('#animate1').css('opacity', 0);
    });
  }
});
