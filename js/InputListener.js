const debug = require('./debug.js');
const PubSub = require('pubsub-js');

class InputListener {
    /**
     * Listen the input on a DOM element
     * @param {Object} game 
     * @param {Object} elem DOM element
     * @param {string} key key for the events name
     */
    constructor(game, elem, key) {
        this.game = game;
        this.elem = elem;

        window.onkeydown = e => {
            //console.log(e.key)
            if (e.key === 'm') {
                this.game.toggleMonitoring();
            }
            if (e.key === 'r') {
                this.game.toggleTowersRangeDisplay();
            }

            PubSub.publish('onkeydown-' + e.key, e.key);
        }


        window.onkeyup = e => {
            PubSub.publish('onkeyup-' + e.key, e.key);
        }

        elem.onclick = (e) => {
            PubSub.publish(key + '-onclick', {x: e.layerX, y: e.layerY});
        }

        elem.onmousemove = (e) => {
            PubSub.publish(key + '-onmousemove', {x: e.layerX, y: e.layerY});
        }

        elem.onmousedown = (e) => {
            if (e.button === 0 ) {
                PubSub.publish(key + '-onmouseleftdown', {x: e.layerX, y: e.layerY});
            }
            if (e.button === 1 ) {
                PubSub.publish(key + '-onmousemiddledown', {x: e.layerX, y: e.layerY});
            }
            if (e.button === 2 ) {
                PubSub.publish(key + '-onmouserightdown', {x: e.layerX, y: e.layerY});
            }
        }

        elem.onmouseup = (e) => {
            if (e.button === 0 ) {
                PubSub.publish(key + '-onmouseleftup', {x: e.layerX, y: e.layerY});
            }
            if (e.button === 1 ) {
                PubSub.publish(key + '-onmousemiddleup', {x: e.layerX, y: e.layerY});
            }
            if (e.button === 2 ) {
                PubSub.publish(key + '-onmouserightup', {x: e.layerX, y: e.layerY});
            }
        }

        elem.onwheel = (e) => {
            PubSub.publish(key + '-onwheel', e.deltaY);
        }

    }
}

module.exports = InputListener;
