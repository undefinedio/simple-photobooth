let firebase = require('firebase')
require('firebase/database')
require('firebase/storage')
document.addEventListener('contextmenu', event => event.preventDefault());

$(document).ready(function () {
  const config = {
    apiKey: 'AIzaSyAuOGXSpLA689jx7uwBI5cWe5hadV7N8KQ',
    authDomain: 'shitty-radar.firebaseapp.com',
    databaseURL: 'https://shitty-radar.firebaseio.com',
    projectId: 'shitty-radar',
    storageBucket: 'shitty-radar.appspot.com',
    messagingSenderId: '847867314513',
    appId: '1:847867314513:web:8a7acc464448428104d370',
  }

  firebase.initializeApp(config)

  global.database = firebase.database()
  global.storage = firebase.storage()
  global.db = firebase.firestore();

  init()
});

function init() {
  // Grab elements, create settings, etc.
  var canvas = document.getElementById('canvas')
  var context = canvas.getContext('2d')
  var video = document.getElementById('video')

  var mediaConfig = { video: true }
  var errBack = function (e) {
    console.log('An error has occurred!', e)
  };

  listenForLocationChanges();

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(mediaConfig).then(function (stream) {
      //video.src = window.URL.createObjectURL(stream);
      video.srcObject = stream
      video.play()
    })
  } else if (navigator.getUserMedia) {
    /* Legacy code below! */
    // Standard
    navigator.getUserMedia(
      mediaConfig,
      function (stream) {
        video.src = stream
        video.play()
      },
      errBack
    )
  } else if (navigator.webkitGetUserMedia) {
    // WebKit-prefixed
    navigator.webkitGetUserMedia(
      mediaConfig,
      function (stream) {
        video.src = window.webkitURL.createObjectURL(stream)
        video.play()
      },
      errBack
    )
  } else if (navigator.mozGetUserMedia) {
    // Mozilla-prefixed
    navigator.mozGetUserMedia(
      mediaConfig,
      function (stream) {
        video.src = window.URL.createObjectURL(stream)
        video.play()
      },
      errBack
    )
  }

  $('.snap').on('click', function () {
    $.get('//192.168.68.144:1334/on').then(light => {
      console.log(light)
    });
    let count = 5
    $('.count').html(count)

    $('.count').addClass('show')
    $('.snap').addClass('hide')

    intervalId = setInterval(function () {
      count--
      $('.count').html(count)

      if (count == 0) {
        // default 6
        clearInterval(intervalId)
        $('.count').removeClass('show')
        snap()
      }
    }, 1000)
  })

  function snap() {
    context.drawImage(video, 0, 0, video.width, video.height)
    $('.js-pic').addClass('show')
    $.get('//192.168.68.144:1334/off').then(light => {
      console.log(light)
    });
  }

  $('.js-retry').on('click', function () {
    $('.snap').removeClass('hide')
    $('.js-pic').removeClass('show')
  })

  $('.js-done').on('click', function () {
    let b64 = canvas.toDataURL('image/jpg')

    sendToDrive(b64)
    reset()
  })

  function reset() {
    $('.snap').removeClass('hide')
    $('.js-pic').removeClass('show')
  }
}

function listenForLocationChanges() {
  global.db.collection('radars').doc("MbtRBMksjOpdICaqr3Z4")
    .onSnapshot(function (doc) {
      var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      console.log(source, " data: ", doc.data());
      $('.overlay').attr('src', `images/overlay-${doc.data().location}.png`);
    });
}

function sendToDrive(b64) {
  global.storage
    .ref('/camera/')
    .child(Date.now() + '.jpg')
    .putString(b64.replace('data:image/png;base64,', ''), 'base64', {
      contentType: 'image/jpg',
    })
}
