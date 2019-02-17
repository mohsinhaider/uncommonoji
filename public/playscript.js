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
let storyHatId = null;

let audioFile = null;

function fetchStory() {
    let storyId = document.getElementById('storybox').value;
    let storyData = null;
    let response = db.ref('/stories/' + '-' + storyId).once('value').then((snapshot) => {
        storyData = snapshot.val();
        storyParameters = storyData.parameters;
        storyPoints = storyData.points;
        storyHatId = storyData.hatId;
        console.log(storyHatId);

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

        window.storyParameters = storyParameters;

        drawPoints(storyPoints, storyParameters);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var images = [
    "https://upload.wikimedia.org/wikipedia/commons/5/54/Red_Fedora.svg", 
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Tux_Paint_blue_fedora.svg",
    "http://images.clipartpanda.com/fedora-clipart-fedora_yellow.svg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Fedora_hat.svg"
];
  
async function drawPoints(points, parameters) {
    let playbackCanvas = document.getElementById('overlay-playback');
    let playbackCanvas2d = playbackCanvas.getContext("2d");
    playbackCanvas2d.fillStyle = "#FF0000";

    const tracker = PlaybackTracker(points, parameters);
    tracker.start(22);
    initDrawGuest(playbackCanvas, tracker);
}

function distance(p1, p2) {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}
