module.exports = {
    rotate: rotate,
    sinusoid: sinusoid1,
    distance: distance,
    average: average,
    sum: sum,
    max: max,
    guid: guid,
    cacheFunction: cacheFunction,
    loadJSON: loadJSON
}

/**
 * Rotate a 2D vector
 * @param {object} p point
 * @param {number} w angle
 * @param {object=} c center
 */
function rotate(p, w, c = { x: 0, y: 0 }) {
    return {
        x: Math.cos(w) * (p.x - c.x) - Math.sin(w) * (p.y - c.y) + c.x,
        y: Math.sin(w) * (p.x - c.x) + Math.cos(w) * (p.y - c.y) + c.y
    }
}

function sinusoid1(amplitude = 1, average = 0, frequency = 2 * Math.PI, phase = 0) {
    return x => amplitude / 2 * Math.cos(frequency * x + phase) + average;
}

function sinusoid2(max, min, frequency = 2 * Math.PI, phase = 0) {
    return sinusoid1(max - min, (max + min) / 2, frequency, phase);
}

/**
 * Mesure the arithmetic distance between two points
 * @param {object} p1 first point
 * @param {object} p2 second point
 * @returns {number} distance
 */
function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function average(arr) {
    if (arr.length === 0) return NaN;
    return sum(arr) / arr.length;
}

function sum(arr) {
    return arr.reduce((sum, current) => sum + current);
}

function max(arr) {
    if (arr.length === 0) return NaN;
    return arr.reduce((max, current) => max < current ? current : max);
}

/**
 * Create a unique ID of n characters
 *
 * @param  {number} n nb of characters
 * @return {string}   guid
 */
function guid(n = 32) {
    return 'x'.repeat(n).replace(/x/g, () => Math.floor(Math.random() * 36).toString(36))
}

/**
 * Cache Functions
 * Only evaluate a function's result if the given inputs haven't been proccessed before
 * @param {function} f function to cache
 * @param {number} cacheSize memory size
 * @return {function} cached function
 */
function cacheFunction(f, cacheSize = 1000) {
    let signatures = [];
    let results = [];
    return function () {
        let signature = JSON.stringify(arguments);
        let signatureIndex = signatures.indexOf(signature);
        if (signatureIndex >= 0) {
            return results[signatureIndex];
        } else {
            let result = f(...arguments);
            signatures.push(signature);
            results.push(result);
            if (signatures.length > cacheSize) {
                signatures.shift();
                results.shift();
            }
            return result;
        }
    }
}

function loadJSON(filePath) {
    return new Promise(function (resolve, reject) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/jsonp");
        xobj.open('GET', filePath, true);
        xobj.onreadystatechange = function () {
            if (xobj.status === 200) {
                if (xobj.readyState === 4) {
                    let data = JSON.parse(xobj.responseText);
                    resolve(data);
                }
            } else {
                reject({
                    'error': xobj.status
                });
            }
        };
        xobj.send(null);
    });
}


