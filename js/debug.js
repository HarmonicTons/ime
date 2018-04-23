module.exports = {
    get time() {
        let currentDate = new Date();
        let yea = currentDate.getFullYear();
        let mon = currentDate.getMonth();
        let day = currentDate.getDay();
        let hou = currentDate.getHours();
        let min = currentDate.getMinutes();
        let sec = currentDate.getSeconds();
        let mil = currentDate.getMilliseconds();

        return `${yea}/${mon}/${day} ${hou}:${min}:${sec}:${mil}`;
    },

    log: function(...msgs) {
        console.log(`%c[${this.time}] %c${msgs}`, "color: #AAA", "color: #111");
    },

    warn: function(...msgs) {
        console.warn(`[${this.time}] ${msgs}`);
    },

    error: function(...msgs) {
        console.error(`[${this.time}] ${msgs}`);
    }
}
