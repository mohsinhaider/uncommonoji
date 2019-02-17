var model = pModel;
var params = {};

var numPatches, patchSize, numParameters, patchType;
var gaussianPD;
var eigenVectors, eigenValues;
var sketchCC, sketchW, sketchH, sketchCanvas;
var weights, model, biases;

var sobelInit = false;
var lbpInit = false;

var meanShape = [];

// load from model
patchType = model.patchModel.patchType;
numPatches = model.patchModel.numPatches;
patchSize = model.patchModel.patchSize[0];
if (patchType == 'MOSSE') {
    searchWindow = patchSize;
} else {
    searchWindow = params.searchWindow;
}
numParameters = model.shapeModel.numEvalues;
modelWidth = model.patchModel.canvasSize[0];
modelHeight = model.patchModel.canvasSize[1];

// load mean shape
for (var i = 0; i < numPatches;i++) {
    meanShape[i] = [model.shapeModel.meanShape[i][0], model.shapeModel.meanShape[i][1]];
}

// draw a parametrized line on a canvas
var drawPath = function(canvasContext, path, dp) {
    canvasContext.beginPath();
    var i, x, y, a, b;
    for (var p = 0;p < path.length;p++) {
        i = path[p]*2;
        x = meanShape[i/2][0];
        y = meanShape[i/2][1];
        for (var j = 0;j < numParameters;j++) {
            x += model.shapeModel.eigenVectors[i][j]*dp[j+4];
            y += model.shapeModel.eigenVectors[i+1][j]*dp[j+4];
        }
        a = dp[0]*x - dp[1]*y + dp[2];
        b = dp[0]*y + dp[1]*x + dp[3];
        x += a;
        y += b;

        if (i == 0) {
            canvasContext.moveTo(x,y);
        } else {
            canvasContext.lineTo(x,y);
        }
    }
    canvasContext.moveTo(0,0);
    canvasContext.closePath();
    canvasContext.stroke();
}

// draw a point on a canvas
function drawPoint(canvasContext, point, dp) {
    var i, x, y, a, b;
    i = point*2;
    x = meanShape[i/2][0];
    y = meanShape[i/2][1];
    for (var j = 0;j < numParameters;j++) {
        x += model.shapeModel.eigenVectors[i][j]*dp[j+4];
        y += model.shapeModel.eigenVectors[i+1][j]*dp[j+4];
    }
    a = dp[0]*x - dp[1]*y + dp[2];
    b = dp[0]*y + dp[1]*x + dp[3];
    x += a;
    y += b;
    canvasContext.beginPath();
    canvasContext.arc(x, y, 1, 0, Math.PI*2, true);
    canvasContext.closePath();
    canvasContext.fill();
}

function drawGuestContours(cc, positions, parameters, pv, path) {
    // if no previous points, just draw in the middle of canvas

    var params;
    if (pv === undefined) {
        params = parameters.slice(0);
    } else {
        params = pv.slice(0);
    }

    // var cc = canvas.getContext('2d');
    // cc.fillStyle = 'rgb(200,200,200)';
    // cc.strokeStyle = 'rgb(130,255,50)';
    // cc.lineWidth = 1;

    var paths;
    if (path === undefined) {
        paths = model.path.normal;
    } else {
        paths = model.path[path];
    }

    for (var i = 0;i < paths.length;i++) {
        if (typeof(paths[i]) == 'number') {
            drawPoint(cc, paths[i], params);
        } else {
            drawPath(cc, paths[i], params);
        }
    }
}

function GuestTracker(ref) {
    let guestData = {
        name: "Guest",
        positions: null,
        parameters: null
    };
    ref.on("value", (snap) => {
        guestData = snap.val();
    });
    const gt = {
        data: guestData,
        getCurrentPosition: () => guestData.positions,
        getCurrentParameters: () => guestData.parameters
    };
    return gt;
}

function PlaybackTracker(all_positions, all_parameters) {
  	let startTime;
  	let spaceTime;
    const pt = {
      	start: (space) => {
						startTime = Date.now();
          	spaceTime = space;
        },
        data: {},
        getCurrentPosition: () => {
          	const diffMs = Date.now() - startTime;
            const t = Math.min(Math.floor(diffMs / spaceTime), all_positions.length);
          	return all_positions[t];
        },
        getCurrentParameters: () => {
          	const diffMs = Date.now() - startTime;
          	const t = Math.min(Math.floor(diffMs / spaceTime), all_parameters.length);
          	return all_parameters[t];
        }
    };
  	return pt;
}

function initDrawGuest(overlayEl, guestTracker) {
    function drawGuestLoop() {
        const overlayCtx = overlayEl.getContext("2d");
        const overWidth = overlayEl.width;
        const overHeight = overlayEl.height;
        requestAnimFrame(drawGuestLoop);
        overlayCtx.clearRect(0, 0, overWidth, overHeight);
        const positions = guestTracker.getCurrentPosition();
        const parameters = guestTracker.getCurrentParameters();
        if (positions && parameters) {
            overlayCtx.strokeStyle = "black";
            drawGuestContours(overlayCtx, positions, parameters);
            const pupilLeft = positions[27];
            const pupilRight = positions[32];
            overlayCtx.fillStyle = "red";
            overlayCtx.beginPath();
            overlayCtx.arc(pupilLeft[0], pupilLeft[1], 4, 0, Math.PI * 2, true);
            overlayCtx.arc(pupilRight[0], pupilRight[1], 4, 0, Math.PI * 2, true);
            overlayCtx.closePath();
            overlayCtx.fill();
        }
    }
    drawGuestLoop();
}
