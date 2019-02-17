var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var lastGlobalPositions = [];
var globalPositions = [];

var lastGlobalParameters = [];
var globalParameters = [];

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
var mediaRecorder = null;
var lastAudio = null;
var lastAudioBlob = null;

function startVideo() {
  globalParameters = [];
  globalPositions = [];

  mediaRecorder = null;
  lastAudio = null;
  lastAudioBlob = null;

  // start video
  vid.play();
  // start tracking
  ctrack.start(vid);
  trackingStarted = true;

  // start recording audio
  recordAudio();

  // drawLoop()
}

function recordAudio() {
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    drawLoop();

    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      lastAudioBlob = audioBlob.slice();
      lastAudio = audio.cloneNode();
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

    var parameters = ctrack.getCurrentParameters();
    globalParameters.push(parameters)

    
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
  lastGlobalParameters = globalParameters;
  globalPositions = [];
  globalParameters = [];

  let playbackCanvas = document.getElementById('overlay-playback');
  let playbackCanvas2d = playbackCanvas.getContext("2d");
  playbackCanvas2d.fillStyle = "#FF0000";
  playbackCanvas2d.fillRect(lastGlobalPositions[0][0], lastGlobalPositions[0][1], 4, 4);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




var overplayPlayback = document.getElementById('overlay-playback');

async function startPlayback() {
 var images = [

	    "https://upload.wikimedia.org/wikipedia/commons/5/54/Red_Fedora.svg", 
	    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Fedora_hat.svg", 
	    "https://upload.wikimedia.org/wikipedia/commons/6/69/Tux_Paint_blue_fedora.svg",
	    "http://images.clipartpanda.com/fedora-clipart-fedora_yellow.svg",
]
	
  var e = document.getElementById("fedoraChoice");
  var fedoraUrl = images[e.selectedIndex];
	
  let playbackCanvas = document.getElementById('overlay-playback');
  let playbackCanvas2d = playbackCanvas.getContext("2d");
  playbackCanvas2d.fillStyle = "#FF0000";

  lastAudio.play();
  for (let i = 0; i < lastGlobalPositions.length; i++) {
    for (let j = 0; j < lastGlobalPositions[i].length; j++) {
      playbackCanvas2d.fillRect(lastGlobalPositions[i][j][0], lastGlobalPositions[i][j][1], 4, 4);
    }

    var img = new Image();	
    img.onload = function() {

		            // var scanvas = document.getElementById('overlay-playback');
		      //       // var sctx = scanvas.getContext("2d");
		      //
	    
	var wid =  distance(lastGlobalPositions[i][0], lastGlobalPositions[i][14]);
		      //
		      //
		      //                   // FLIP DAT FEDORA PLZ
		      //                         // if(distance(lastGlobalPositions[i][0], lastGlobalPositions[i][23]) < distance(lastGlobalPositions[i][14], lastGlobalPositions[i][28])) {
		      //                               //   //flipHorizontally(sctx, wid / 2);
		      //                                     //   sctx.scale(-1, -1);
		      //                                           // }
		      //
        playbackCanvas2d.drawImage(img, lastGlobalPositions[i][0][0] + (lastGlobalPositions[i][14][0] - lastGlobalPositions[i][0][0]) / 2 - 1.2 * wid / 2, lastGlobalPositions[i][16][1] - 1.1 *  wid, 1.5 * wid, 1.5 * wid);
    }
    img.src = fedoraUrl;

    await sleep(22);
    playbackCanvas2d.clearRect(0, 0, 400, 300);
  }
}

function distance(p1, p2) {
	  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}


// doesn't work 
function flipHorizontally(context, around) {
	  context.translate(around, 0);
	  context.scale(-1, 1);
	  context.translate(-around, 0);
}


const config = {
  apiKey: "AIzaSyBgsxxtDg89j2EKlO4qcUrJlPQJ_G4MkCM",
  authDomain: "uncommonfacedb.firebaseapp.com",
  databaseURL: "https://uncommonfacedb.firebaseio.com",
  projectId: "uncommonfacedb",
  storageBucket: "uncommonfacedb.appspot.com",
  messagingSenderId: "917895134735"
};

const FirebaseApp = firebase.initializeApp(config);
const db = FirebaseApp.database();
const store = FirebaseApp.storage();

var newAudioKey = null;

function sendPoints() {

  db.ref('stories/').push({
    points: lastGlobalPositions,
    parameters: lastGlobalParameters
  }).then((res) => {
    newAudioKey = res.key;

    let storageRef = store.ref();
    let audioRef = storageRef.child('audio/' + newAudioKey.slice(1));

    audioRef.put(lastAudioBlob).then(snapshot => {
      console.log('[Animoji] Audio Blob successfully uploaded.');
    });
  });
}

function shareStory() {
  alert("Share this Story Key: " + newAudioKey);
}
