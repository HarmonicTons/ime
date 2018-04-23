const debug = require('./debug.js');
const Timer = require('./Timer.js');

class Updater {
    constructor(game) {
        this.game = game;

        this.upsTimer = new Timer();
        this.ups = 0;
        this.updates = 0;
        this.lastUpdateDuration = [];
        this.stoped = false;
    }


    /**
     * stop - Stop the updater
     *
     */
    stop() {
        debug.log("Stoping update.");
        this.stoped = true;
    }


    /**
     * update - Update the game
     *
     */
    update() {
        if (this.stoped) return;
        this.updates++;
        let dt = this.upsTimer.reset();
        if (this.updates % 100 === 0) {
            let avg_dt = this.lastUpdateDuration.reduce((s, dt) => s + dt, 0) / this.lastUpdateDuration.length;
            this.ups = 1000 / avg_dt;
            this.lastUpdateDuration = [];
        } else {
            this.lastUpdateDuration.push(dt);
        }

        let scene = this.game.scene;

        // update all the things
        let timestamp = this.game.globalTimer.now;



        scene.update(dt);

        // draw next frame
        requestAnimationFrame(() => {
            this.update();
        });
    }
}

module.exports = Updater;
