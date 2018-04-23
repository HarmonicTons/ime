const App = require('./js/App.js');
const debug = require('./js/debug.js');

document.addEventListener('DOMContentLoaded', main, false);

function main() {
    debug.log("ISO MAP EDITOR");

    let app = new App();
}