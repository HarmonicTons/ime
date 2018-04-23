const Game = require('./Game.js');
const debug = require('./debug.js');
const PubSub = require('pubsub-js');

class App {
    constructor() {
        let canvas = document.getElementById("viewCanvas");
        this.game = new Game(this, canvas);

        this.colorPicker();
    }

    colorPicker() {
        let name = 'colorPicker';
        let colorPicker = document.getElementById("colorPicker");
        let h = colorPicker.querySelector("#hue");
        let s = colorPicker.querySelector("#saturation");
        let l = colorPicker.querySelector("#light");

        let ht = colorPicker.querySelector("#hue_text");
        let st = colorPicker.querySelector("#saturation_text");
        let lt = colorPicker.querySelector("#light_text");

        function onchangeRange() {
            let color = {
                h: parseInt(h.value),
                s: parseInt(s.value),
                l: parseInt(l.value)
            }

            ht.value = color.h;
            st.value = color.s;
            lt.value = color.l;

            colorPicker.style.backgroundColor = `hsl(${color.h},${color.s}%,${color.l}%)`;
            PubSub.publish(name + '-onchange', color);
        }

        h.onchange = onchangeRange;
        s.onchange = onchangeRange;
        l.onchange = onchangeRange;
        h.onmousemove = onchangeRange;
        s.onmousemove = onchangeRange;
        l.onmousemove = onchangeRange;

        function onChangeText() {
            let color = {
                h: parseInt(ht.value),
                s: parseInt(st.value),
                l: parseInt(lt.value)
            }

            h.value = color.h;
            s.value = color.s;
            l.value = color.l;

            colorPicker.style.backgroundColor = `hsl(${color.h},${color.s}%,${color.l}%)`;
            PubSub.publish(name + '-onchange', color);
        }

        ht.onkeypress = onChangeText;
        st.onkeypress = onChangeText;
        lt.onkeypress = onChangeText;
        ht.onchange = onChangeText;
        st.onchange = onChangeText;
        lt.onchange = onChangeText;
    }
}


module.exports = App;