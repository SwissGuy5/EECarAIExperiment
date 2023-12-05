function distance(Ax, Ay, Bx, By) {
    return Math.hypot(Bx - Ax, By - Ay);
}

/**
 * Returns a random number between 0 and specified number
 * @param {number} num Included
 * @returns {number} Num between 0 (included) and specified number (included)
 */
function randInt(num) {
    return Math.floor(Math.random() * (num + 1));
}

function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
}

function saveNetwork(layers) {
    localStorage.setItem('network', JSON.stringify(layers));
}

function loadNetwork() {
    return JSON.parse(localStorage.getItem('network'));
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function normalise(val, min, max) {
    return (val - min) / (max - min);
}