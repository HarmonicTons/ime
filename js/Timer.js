const debug = require('./debug.js');

class Timer {
    constructor() {
        this._startAt = Date.now();
        this._pauses = [];
    }


    /**
     * get now - current time in ms
     *
     * @return {number}  time in ms
     */
    get now() {
        let current = Date.now();
        let pausesDuration = this._pauses.reduce((d,p) => d + (p.endAt || Date.now()) - p.startAt, 0);
        return current - this._startAt - pausesDuration;
    }


    /**
     * get isPaused - Indicate if the timer is currently paused
     *
     * @return {boolean}  true if the timer is paused
     */
    get isPaused() {
        return this._pauses.length > 0 && typeof this._pauses.slice(-1)[0].endAt === 'undefined';
    }

    /**
     * pause - Pause the timer until .continue() is used
     *
     * @return {number}  time in ms before pause start
     */
    pause() {
        if (this.isPaused) {
            debug.warn('The current timer is already paused.');
            return this.now;
        }
        this._pauses.push({
            startAt: Date.now()
        });
        return this.now;
    }


    /**
     * continue - Continue the timer that was paused with .pause()
     *
     * @return {number}  time after the continue
     */
    continue() {
        if (!this.isPaused) {
            debug.warn('The current timer is not paused.');
            return this.now;
        }
        this._pauses.slice(-1)[0].endAt = Date.now();
        return this.now;
    }

    /**
     * Return the timer value in a string "00:00'000"
     * @return {string} timer string
     */
    get timeString() {
        let time = this.now;
        let timeMin = ('00' + Math.floor(time / 1000 / 60)).slice(-2);
        let timeSec = ('00' + Math.floor((time - timeMin) / 1000)).slice(-2);
        let timeMs = ('000' + (time - timeMin - timeSec)).slice(-3);
        return `${timeMin}:${timeSec}'${timeMs}`;
    }

    /**
     * Reset the timer
     * @return {number} lifetime of the the timer before the reset
     */
    reset() {
        let lastStart = this._startAt;
        this._startAt = Date.now();
        this._pauses = [];
        return this._startAt - lastStart;
    }
}

module.exports = Timer;
