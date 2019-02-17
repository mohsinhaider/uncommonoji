var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var lastGlobalPositions = [];
var globalPositions = [];

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
// set up video
if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
  navigator.getUserMedia({video : true}, gumSuccess, gumFail);
} else {
  insertAltVideo(vid);
  document.getElementById('gum').className = "hide";
  document.getElementById('nogum').className = "nohide";
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}
vid.addEventListener('canplay', enablestart, false);

/*********** Setup of video/webcam and checking for webGL support *********/
function enablestart() {
  var startbutton = document.getElementById('startbutton');
  startbutton.value = "Record Story";
  startbutton.disabled = null;
}

var insertAltVideo = function(video) {
  // insert alternate video if getUserMedia not available
  if (supports_video()) {
    if (supports_webm_video()) {
      video.src = "./media/cap12_edit.webm";
    } else if (supports_h264_baseline_video()) {
      video.src = "./media/cap12_edit.mp4";
    } else {
      return false;
    }
    return true;
  } else return false;
}

function adjustVideoProportions() {
  // resize overlay and video if proportions of video are not 4:3
  // keep same height, just change width
  var proportion = vid.videoWidth/vid.videoHeight;
  vid_width = Math.round(vid_height * proportion);
  vid.width = vid_width;
  overlay.width = vid_width;
}

function gumSuccess( stream ) {
  // add camera stream if getUserMedia succeeded
  if ("srcObject" in vid) {
    vid.srcObject = stream;
  } else {
    vid.src = (window.URL && window.URL.createObjectURL(stream));
  }
  vid.onloadedmetadata = function() {
    adjustVideoProportions();
    vid.play();
  }
  vid.onresize = function() {
    adjustVideoProportions();
    if (trackingStarted) {
      ctrack.stop();
      ctrack.reset();
      ctrack.start(vid);
    }
  }
}

function gumFail() {
  // fall back to video if getUserMedia failed
  insertAltVideo(vid);
  document.getElementById('gum').className = "hide";
  document.getElementById('nogum').className = "nohide";
  alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
}


/*********** Code for face tracking *********/
var ctrack = new clm.tracker();
ctrack.init();
var trackingStarted = false;

function startVideo() {
  // start video
  vid.play();
  // start tracking
  ctrack.start(vid);
  trackingStarted = true;

  // start recording audio
  recordAudio();

  // drawLoop()
}

var mediaRecorder = null;
var lastAudio = null;

function recordAudio() {
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    drawLoop();

    console.log("Log1");

    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    console.log("Log 2");

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      lastAudio = audio.cloneNode();
      console.log("Logging Audio object");
      console.log(lastAudio);
    });
  });
}

function drawLoop() {
  requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0, vid_width, vid_height);
  if (ctrack.getCurrentPosition()) {
    // get points
    var positions = ctrack.getCurrentPosition();
    
    globalPositions.push(positions);
    
    ctrack.draw(overlay);
    
    var pupilLeft = positions[27];
    var pupilRight = positions[32];
    
    // draw circles over eyes
    overlayCC.fillStyle = '#faa732';
    overlayCC.beginPath();
    overlayCC.arc(pupilLeft[0], pupilLeft[1], 20, 0, Math.PI*2, true);
    overlayCC.arc(pupilRight[0], pupilRight[1], 20, 0, Math.PI*2, true);
    overlayCC.closePath();
    overlayCC.fill();
  }
}


function stopVideo() {
  ctrack.stop();
  ctrack.reset();
  mediaRecorder.stop();
  lastGlobalPositions = globalPositions;
  console.log(globalPositions);
  globalPositions = [];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var overplayPlayback = document.getElementById('overlay-playback');

async function startPlayback() {
  console.log("Hey there!");
  let playbackCanvas = document.getElementById('overlay-playback');
  let playbackCanvas2d = playbackCanvas.getContext("2d");
  playbackCanvas2d.fillStyle = "#FF0000";

  lastAudio.play();
  for (let i = 0; i < lastGlobalPositions.length; i++) {
    for (let j = 0; j < lastGlobalPositions[i].length; j++) {
      playbackCanvas2d.fillRect(lastGlobalPositions[i][j][0], lastGlobalPositions[i][j][1], 4, 4);
    }
    await sleep(22);
    playbackCanvas2d.clearRect(0, 0, 400, 300);
  }
}