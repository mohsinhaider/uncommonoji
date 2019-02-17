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

        drawPoints(storyPoints);
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
  
async function drawPoints(points) {
    let fedoraUrl = null;
    if (storyHatId > 0) {
        fedoraUrl = images[storyHatId - 1];
    }

    let playbackCanvas = document.getElementById('overlay-playback');
    let playbackCanvas2d = playbackCanvas.getContext("2d");
    playbackCanvas2d.fillStyle = "#FF0000";

    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          playbackCanvas2d.fillRect(points[i][j][0], points[i][j][1], 4, 4);
        }

        if (fedoraUrl) {
            var img = new Image();  
            img.onload = function() {
                var wid =  distance(points[i][0], points[i][14]);
                playbackCanvas2d.drawImage(img, points[i][0][0] + (points[i][14][0] - points[i][0][0]) / 2 - 1.2 * wid / 2, points[i][16][1] - 1.1 *  wid, 1.5 * wid, 1.5 * wid);
            }
            img.src = fedoraUrl;
        }

        await sleep(22);
        playbackCanvas2d.clearRect(0, 0, 400, 300);
    }
}

function distance(p1, p2) {
    return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
}
