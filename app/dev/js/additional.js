'use strict'
Pictor.prototype.splitUp = function (word, id, separator, time) {
  console.log(id)
  var arr = word.split(" ");
  time = parseFloat(time)

  var i = 0;
  $.each(arr, function (index) {
    // идем по массиву
    if (i === 9) {
      time += 1;
      i = 0;
      time = +time.toFixed(2);
    } else {
      time += 0.1;
      i = 0;
      time = +time.toFixed(2);
    }

    $(id).append(
      '<span class="charlie" data-animations="textAnimateLetter" data-times=" ' + time +
      '">' +
      (this == ' ' ? '&nbsp;' : this) +
      '</span>' + '&nbsp;'
    );

    i++;
  });
};

Pictor.prototype.numberAnimation = function (amount, parent) {
  var options = {
    amount: amount,
    delay: 0,
    duration: 50,
  };
  var amount = options.amount;
  var time = amount / options.duration;
  var number = 0;
  var fixed = 0;
  if (amount.toString().split('.')[1]) {
    fixed = amount.toString().split('.')[1].length;
  }
  requestAnimationFrame(function interval() {
    number += time;
    parent.querySelector('.number').innerHTML =
      // Math.round(number * 100) / 100;
      number.toFixed(fixed);
    if (number >= amount) {
      document.querySelector('.number').innerHTML = amount;
      cancelAnimationFrame(interval);
    } else {
      requestAnimationFrame(interval);
    }
  });
};