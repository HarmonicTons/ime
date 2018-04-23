const debug = require('./debug.js');
const PubSub = require('pubsub-js');
const Mouse = require('./Mouse.js');
const Renderer = require('./Renderer.js');
const Updater = require('./Updater.js');
const Scene = require('./Scene.js');
const InputListener = require('./InputListener.js');
const Timer = require('./Timer.js');
const Map = require('./Map.js');
const Voxel = require('./Voxel.js');

class Game {
    constructor(app, canvas) {
        this.app = app;
        this.canvas = canvas;
        this.mouse = new Mouse(this);
        this.renderer = new Renderer(this, canvas);
        this.updater = new Updater(this);
        this.scene = new Scene(this);
        this.inputListener = new InputListener(this, canvas, "map");
        this.renderer.setView(1200, 800);
        this.map = new Map(this);

        this.cursor = {
            x: 0,
            y: 0,
            z: -1,
            f: 0
        }

        this.globalTimer = new Timer();

        this.load().then(() => {
            this.start();
        })
    }

    load() {
        debug.log(`Loading...`);
        let mapFile = '../maps/map02.json';

        return Promise.all([
            this.map.load(mapFile),
        ]).then(() => {
            debug.log("Game loaded.");
        }).catch(error => {
            debug.error(error);
        })
    }

    start() {
        debug.log(`Starting Game.`)

        // start the motor
        this.renderer.render();
        this.updater.update();

        // start the scene
        this.scene.start();
    }


    /**
     * setMouseCoordinates - Set mouse position
     *
     * @param  {number} x
     * @param  {number} y
     */
    setMouseCoordinates(x, y) {
        this.mouse.screenCoordinates.x = x;
        this.mouse.screenCoordinates.y = y;

        this.resetCursorPosition();
    }

    resetCursorPosition() {
        let sx = this.mouse.screenCoordinates.x;
        let sy = this.mouse.screenCoordinates.y;
        let map = this.map;
        let vs = this.renderer.view.visibleSides;
        let p;
        let cursors = [];

        for (let z = map.size.z; z >= 0; z--) {
            p = this.gridCoordinates(sx, sy, z, "z");

            if (p.z === this.scene.gridLevel || map.getVoxel(p.x, p.y, p.z - 1)) {
                cursors.push({
                    x: p.x,
                    y: p.y,
                    z: p.z - 1,
                    f: 0
                })
                break;
            }
        }

        for (let y = map.size.y - 1; y >= 0; y--) {
            p = this.gridCoordinates(sx, sy, y, "y");
            if (map.getVoxel(p.x, p.y - vs.y, p.z)) {
                cursors.push({
                    x: p.x,
                    y: p.y - vs.y,
                    z: p.z,
                    f: vs.y ? 1 : 3
                });
            }
        }

        for (let x = map.size.x - 1; x >= 0; x--) {
            p = this.gridCoordinates(sx, sy, x, "x");
            if (map.getVoxel(p.x - vs.x, p.y, p.z)) {
                cursors.push({
                    x: p.x - vs.x,
                    y: p.y,
                    z: p.z,
                    f: vs.x ? 2 : 4
                });
            }
        }

        cursors.forEach(c => {
            c.x = Math.floor(c.x);
            c.y = Math.floor(c.y);
            c.z = Math.floor(c.z);
        })

        function sort(arr, p, s) {
            arr.sort((a, b) => {
                if (a[p] < b[p]) return -s;
                if (a[p] > b[p]) return s;
                return 0;
            });
        }

        sort(cursors, 'x', vs.x ? -1 : 1);
        sort(cursors, 'y', vs.y ? -1 : 1);
        sort(cursors, 'z', -1);

        this.cursor = cursors[0] || {
            x: 0,
            y: 0,
            z: -1,
            f: 0
        }
    }

    /**
     * Toggle the monitoring display
     */
    toggleMonitoring() {
        this.renderer.displayMonitoring = !this.renderer.displayMonitoring;
    }

    rotate(w) {
        let center = this.map.center;
        this.renderer.view.rotate(w, center);
    }

    zoom(delta) {
        this.renderer.view.zoom(delta);
    }

    move(delta) {
        this.renderer.view.move(delta);
    }

    gridCoordinates(x, y, p, f) {
        if (f === "z") {
            return this.renderer.view.gridCoordinatesZ(x, y, p);
        }
        if (f === "y") {
            return this.renderer.view.gridCoordinatesY(x, y, p);
        }
        if (f === "x") {
            return this.renderer.view.gridCoordinatesX(x, y, p);
        }
    }

    addVoxel(x, y, z, h, s, l) {
        let voxel = new Voxel(this.map, x, y, z, h, s, l);
        this.map.addVoxel(voxel);

        this.resetCursorPosition();
    }

    removeVoxel(x, y, z) {
        this.map.removeVoxel(x, y, z);
    }
}

module.exports = Game;