// === Constants === //
const NUM_OF_OBSTACLE_CARS = 0;
const SCALE_FACTOR = 1;
const CAR_WIDTH = 70 * SCALE_FACTOR;
const CAR_HEIGHT = 150 * SCALE_FACTOR;
const LANE_WIDTH = 100 * SCALE_FACTOR;
const ROAD_LENGTH = 100000;
const MAX_FORWARD_SPEED = 15;
const MAX_BACKWARD_SPEED = -5;
const MAX_ITERATIONS = 500;

// === Declaring Variables === //
let obstacleCars = [];
let agent;
let carAsset = new Image();
carAsset.src = './assets/car2-S.png';
let timeStamp = performance.now();
let dt = timeStamp;
let iterations = 0;

// Car Human Inputs
let forwardKeyPressed = false;
let backwardKeyPressed = false;
let leftKeyPressed = false;
let rightKeyPressed = false;

// === Display Settings === //
let canvas = document.getElementById('canvas');
// canvas.width  = window.innerWidth / 1.5;
// canvas.height = window.innerHeight / 1.5;
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');

// === Initialise Parameters === //
function init() {
    agent = new Car(0);
    for (let i = 1; i <= NUM_OF_OBSTACLE_CARS; i++) {
        obstacleCars.push(new Car(i));
    }

    main();
}

// === Main Action Loop === //
function main() {
    let timeNow = performance.now();
    dt = (timeNow - timeStamp) / 30;
    timeStamp = timeNow;
    iterations++;
    clearCanvas();

    // Handle Movement //
    let translation = [canvas.width / 2, canvas.height / 2];
    translation = agent.p; // For FocusedRender Only
    agent.useValueNetwork(dt);
    // agent.takeNextAction(dt, forwardKeyPressed - backwardKeyPressed, rightKeyPressed - leftKeyPressed);
    obstacleCars.forEach(car => {
        // car.takeNextAction(dt, true, false, true, false);
    })

    // Handle Rendering //
    renderRoad(translation);
    agent.focusedRender();
    obstacleCars.forEach(car => {
        car.fixedRender(translation);
    });


    // Handle Collisions //
    // let rects = [ agent.createRect() ];
    // obstacleCars.forEach(car => {
    //     rects.push(car.createRect());
    // })
    // if (!isRectCollide(rects[0], { x: canvas.width / 2, y: 0, w: LANE_WIDTH - CAR_WIDTH / 2, h: ROAD_LENGTH, angle: 0, colour: 'grey' })) { console.log("Out of Bounds"); }
    // if (isRectCollide(rects[0], rects[1])) { console.log("Collision Detected"); }
    // if (agent.p[0] + CAR_WIDTH / 2 > canvas.width / 2 + LANE_WIDTH || agent.p[0] - CAR_WIDTH / 2 < canvas.width / 2 - LANE_WIDTH) { console.log('Out Of Bounds'); }

    if (iterations >= MAX_ITERATIONS) {
        console.log('Training Data')
        agent.trainNetwork();
        agent.reset();
        iterations = 0;
    }

    // Request Next Frame //
    window.requestAnimationFrame(main);
}

// === Display Functions === //
function clearCanvas() {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(235, 235, 235)';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.closePath();
}
function renderRoad(translation = [canvas.width / 2, 0]) {
    ctx.beginPath();
    ctx.save();
    ctx.translate(canvas.width - translation[0], canvas.height - translation[1]);
    ctx.fillStyle = 'grey';
    ctx.fillRect(-LANE_WIDTH, -ROAD_LENGTH / 2, LANE_WIDTH * 2, ROAD_LENGTH);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = LANE_WIDTH / 10;
    ctx.setLineDash([40, 20]);
    ctx.moveTo(0, -ROAD_LENGTH / 2);
    ctx.lineTo(0, ROAD_LENGTH / 2);
    ctx.stroke();
    ctx.restore();
}
function renderObject(translation, x, y, w, h, angle, colour) {
    ctx.beginPath();
    ctx.save();
    ctx.translate(x - translation[0] + canvas.width / 2, y - translation[1] + canvas.height / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.fillStyle = colour;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
}

// === Keyboard Inputs === //
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "w":
        case "W":
            forwardKeyPressed = true;
            break;
        case "s":
        case "S":
            backwardKeyPressed = true;
            break;
        case "a":
        case "A":
            leftKeyPressed = true;
            break;
        case "d":
        case "D":
            rightKeyPressed = true;
            break;
    }
});
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case "w":
        case "W":
            forwardKeyPressed = false;
            break;
        case "s":
        case "S":
            backwardKeyPressed = false;
            break;
        case "a":
        case "A":
            leftKeyPressed = false;
            break;
        case "d":
        case "D":
            rightKeyPressed = false;
            break;
    }
});

// === Start Simulation === //
init();