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

let storyData = null;
let storyPoints = null;
let storyParameters = null;

let audioFile = null;

function fetchStory() {
    let storyId = document.getElementById('storybox').value;
    let storyData = null;
    let response = db.ref('/stories/' + '-' + storyId).once('value').then((snapshot) => {
        storyData = snapshot.val();
        storyParameters = storyData.parameters;
        storyPoints = storyData.points;

        store.ref('/audio/' + storyId).getDownloadURL().then(function(url) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function(event) {
                var blob = xhr.response;
                const audioUrl = URL.createObjectURL(blob);
                audioFile = new Audio(audioUrl);
                audioFile.play();
            };
            xhr.open('GET', url);
            xhr.send();
        });

        drawPoints(storyPoints);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

async function drawPoints(points) {
    let playbackCanvas = document.getElementById('overlay-playback');
    let playbackCanvas2d = playbackCanvas.getContext("2d");
    playbackCanvas2d.fillStyle = "#FF0000";

    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          playbackCanvas2d.fillRect(points[i][j][0], points[i][j][1], 4, 4);
        }
        await sleep(22);
        playbackCanvas2d.clearRect(0, 0, 400, 300);
      }
}

