const debug = require('./debug.js');
const Timer = require('./Timer.js');
const View = require('./View.js');
const sinusoid = require('./helpers.js').sinusoid;

class Renderer {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        // disallow image smoothing
        this.context.imageSmoothingEnabled = false;

        this.view = new View(this, canvas);

        this.displayMonitoring = true;

        this.timer = new Timer();
        this.frames = 0;
        this.fps = 0;

        this.lastFramesDuration = [];
        this.stoped = false;

        this.fixedLight = true;
    }


    /**
     * stop - Stop the renderer
     *
     */
    stop() {
        debug.log("Stoping render.");
        this.stoped = true;
    }

    /**
     * Render the current frame
     */
    render() {
        if (this.stoped) return;
        this.frames++;
        let dt = this.timer.reset();
        if (this.frames % 100 === 0) {
            let avg_dt = this.lastFramesDuration.reduce((s, dt) => s + dt, 0) / this.lastFramesDuration.length;
            this.fps = 1000 / avg_dt;
            this.lastFramesDuration = [];
        } else {
            this.lastFramesDuration.push(dt);
        }

        // clear canvas
        this.context.clearRect(0, 0, this.view.width, this.view.height);

        this.drawBackground();

        this.drawMapBorder();

        this.drawMap();

        // draw monitoring
        if (this.displayMonitoring) {
            this.drawMonitoring();
        }

        // draw next frame
        requestAnimationFrame(() => {
            this.render();
        });
    }

    /**
     * Draw background
     */
    drawBackground() {
        let scene = this.game.scene;

        let t = scene.timer.now % scene.period;
        let blue = Math.floor(255 * Math.exp(- t / scene.period * 100));

        this.context.fillStyle = `rgb(${255 - blue},${255 - blue},${blue})`;

        this.context.fillStyle = `rgb(240,240,255)`;
        this.context.fillRect(0, 0, this.view.width, this.view.height);
    }


    /**
     * Draw monitoring data
     */
    drawMonitoring() {
        let gc;
        this.context.font = "10px Arial";
        this.context.fillStyle = "black";
        this.context.fillText("Time : " + this.game.globalTimer.timeString, this.view.width - 100, 20, 100);
        this.context.fillText("FPS : " + this.fps.toFixed(1), this.view.width - 100, 30, 100);
        this.context.fillText("UPS : " + this.game.updater.ups.toFixed(1), this.view.width - 100, 40, 100);
        let c = this.game.cursor;
        this.context.fillText("C : " + c.x.toFixed(1) + ", " + c.y.toFixed(1) + ", " + c.z.toFixed(1) + ", " + c.f, this.view.width - 100, 80, 100);
        let a = Math.floor(16 * this.view.camera.w / Math.PI);
        this.context.fillText("Angle : " + a + " PI / 16", this.view.width - 100, 90, 100);
        this.context.fillText("Camera : " + Math.floor(this.view.camera.x) + " " + Math.floor(this.view.camera.y) + " " + Math.floor(this.view.camera.z), this.view.width - 100, 100, 100);
        this.context.fillText("State : " + this.game.scene.state, this.view.width - 100, 110, 100);

        //this.context.fillRect(this.view.width / 2, this.view.height / 2, 2, 2);
    }

    drawMapBorder() {
        let map = this.game.map;

        let visibleSides = this.view.visibleSides;

        let light = sinusoid(0.6, 1, 2, Math.PI / 4);
        let angle = this.view.camera.w;

        let p0, p1, p2, p3;

        p0 = this.view.screenCoordinates(visibleSides.x ? 0 : map.size.x, 0, 0);
        p1 = this.view.screenCoordinates(visibleSides.x ? 0 : map.size.x, map.size.y, 0);
        p2 = this.view.screenCoordinates(visibleSides.x ? 0 : map.size.x, map.size.y, map.size.z);
        p3 = this.view.screenCoordinates(visibleSides.x ? 0 : map.size.x, 0, map.size.z);

        this.drawShape([p0, p1, p2, p3], `hsla(200, 80%, ${50 * light(angle + Math.PI / 2)}%, .1)`);

        p0 = this.view.screenCoordinates(0, visibleSides.y ? 0 : map.size.y, 0);
        p1 = this.view.screenCoordinates(map.size.x, visibleSides.y ? 0 : map.size.y, 0);
        p2 = this.view.screenCoordinates(map.size.x, visibleSides.y ? 0 : map.size.y, map.size.z);
        p3 = this.view.screenCoordinates(0, visibleSides.y ? 0 : map.size.y, map.size.z);

        this.drawShape([p0, p1, p2, p3], `hsla(200, 80%, ${50 * light(angle)}%, .1)`);

        p0 = this.view.screenCoordinates(0, 0, 0);
        p1 = this.view.screenCoordinates(map.size.x, 0, 0);
        p2 = this.view.screenCoordinates(map.size.x, map.size.y, 0);
        p3 = this.view.screenCoordinates(0, map.size.y, 0);

        this.drawShape([p0, p1, p2, p3], `hsla(200, 80%, 20%, .1)`);
    }

    drawGrid(h = 0) {
        let map = this.game.map;

        for (let x = 0; x <= map.size.x; x++) {
            let from = this.view.screenCoordinates(x, 0, h);
            let to = this.view.screenCoordinates(x, map.size.y, h);
            this.drawLine(from, to, `hsla(0, 80%, 50%, .6)`);
        }

        for (let y = 0; y <= map.size.y; y++) {
            let from = this.view.screenCoordinates(0, y, h);
            let to = this.view.screenCoordinates(map.size.x, y, h);
            this.drawLine(from, to, `hsla(0, 80%, 50%, .6)`);
        }
    }

    drawLine(from, to, color = "black") {
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo(from.x, from.y);
        this.context.lineTo(to.x, to.y);
        this.context.stroke();
    }

    drawMap() {
        let cursor = this.game.cursor;
        let map = this.game.map;
        let visibleSides = this.view.visibleSides;

        let scene = this.game.scene;
        let placeable = scene._placeableVoxel;

        let drawVoxel = (x, y, z) => {
            let voxel = map.getVoxel(x, y, z);
            if (voxel) {
                if (cursor.x === x && cursor.y === y && cursor.z === z) {
                    this.drawVoxel(x, y, z, voxel.color.h, voxel.color.s, voxel.color.l * 3/4 + 25);
                } else {
                    this.drawVoxel(x, y, z, voxel.color.h, voxel.color.s, voxel.color.l);
                }
            } else {
                // draw placeable voxel
                if (placeable && placeable.x === x && placeable.y === y && placeable.z === z) {
                    this.drawVoxel(x, y, z, scene.color.h, scene.color.s, scene.color.l, 0.5);
                }
            }
        }

        for (let z = 0; z < map.size.z; z++) {
            if (z === this.game.scene.gridLevel) {
                this.drawGrid(z);
            }
            if (visibleSides.x && visibleSides.y) {
                for (let x = 0; x < map.size.x; x++) {
                    for (let y = 0; y < map.size.y; y++) {
                        drawVoxel(x, y, z);
                    }
                }
            }

            if (!visibleSides.x && visibleSides.y) {
                for (let x = map.size.x - 1; x >= 0; x--) {
                    for (let y = 0; y < map.size.y; y++) {
                        drawVoxel(x, y, z);
                    }
                }
            }

            if (!visibleSides.x && !visibleSides.y) {
                for (let x = map.size.x - 1; x >= 0; x--) {
                    for (let y = map.size.y - 1; y >= 0; y--) {
                        drawVoxel(x, y, z);
                    }
                }
            }

            if (visibleSides.x && !visibleSides.y) {
                for (let x = 0; x < map.size.x; x++) {
                    for (let y = map.size.y - 1; y >= 0; y--) {
                        drawVoxel(x, y, z);
                    }
                }
            }
        }
    }

    /**
     * Draw a Voxel cube
     * @param {number} x
     * @param {number} y 
     * @param {number} z 
     * @param {number} h hue
     * @param {number} s saturation
     * @param {number} l light
     * @param {number=} r reflectivity
     */
    drawVoxel(x, y, z, h, s, l, a = 1, r = 1.5 * (1 - l / 100)) {
        let visibleSides = this.view.visibleSides;

        let light = sinusoid(r, 1, 2, Math.PI / 4);
        let angle = this.view.camera.w;

        let p0, p1, p2, p3, l1;

        p0 = this.view.screenCoordinates(x + visibleSides.x, y, z + 1);
        p1 = this.view.screenCoordinates(x + visibleSides.x, y, z);
        p2 = this.view.screenCoordinates(x + visibleSides.x, y + 1, z);
        p3 = this.view.screenCoordinates(x + visibleSides.x, y + 1, z + 1);
        if (this.fixedLight) {
            l1 = l * (visibleSides.x ? 0.6 : 1.4);
        } else {
            l1 = l * light(angle + Math.PI / 2)
        }
        this.drawShape([p0, p1, p2, p3], `hsla(${h},${s}%,${l1}%, ${a})`);

        p0 = this.view.screenCoordinates(x, y + visibleSides.y, z + 1);
        p1 = this.view.screenCoordinates(x + 1, y + visibleSides.y, z + 1);
        p2 = this.view.screenCoordinates(x + 1, y + visibleSides.y, z);
        p3 = this.view.screenCoordinates(x, y + visibleSides.y, z);
        if (this.fixedLight) {
            l1 = l * (!visibleSides.y ? 0.8 : 1.2);
        } else {
            l1 = l * light(angle)
        }
        this.drawShape([p0, p1, p2, p3], `hsla(${h},${s}%,${l1}%, ${a})`);

        p0 = this.view.screenCoordinates(x, y, z + 1);
        p1 = this.view.screenCoordinates(x + 1, y, z + 1);
        p2 = this.view.screenCoordinates(x + 1, y + 1, z + 1);
        p3 = this.view.screenCoordinates(x, y + 1, z + 1);
        if (this.fixedLight) {
            l1 = l * 0.9;
        } else {
            l1 = l * 0.9
        }
        this.drawShape([p0, p1, p2, p3], `hsla(${h},${s}%,${l1}%, ${a})`);
    }

    drawShape(corners, color = "black") {
        this.context.beginPath();
        this.context.fillStyle = color;
        this.context.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            this.context.lineTo(corners[i].x, corners[i].y);
        }
        this.context.closePath();
        this.context.fill();
    }


    /**
     * Set a new view
     * @param {number} width
     * @param {number} height
     */
    setView(width, height) {
        this.view.width = width;
        this.view.height = height;
    }


    /**
     * Load several images
     *
     * @param {string[]} imagesPaths files paths
     * @return {Promise} promise of the images
     */
    loadImages(imagesPaths) {
        return Promise.all(imagesPaths.map(this.loadImage));
    }

    /**
     * Load an image from its file path
     *
     * @param {string} imagePath file path
     * @return {Promise} promise of the image
     */
    loadImage(imagePath) {
        debug.log(`Loading ${imagePath}...`);
        let img = new Image();
        img.src = imagePath;

        return new Promise(function (resolve, reject) {
            img.onload = function () {
                debug.log(`${imagePath} loaded.`);
                resolve(img);
            };
            img.onerror = function () {
                debug.warn(`${imagePath} not found.`);
                resolve();
            }
        });
    }

    screenCoordinates(x, y) {
        return this.view.screenCoordinates(x, y);
    }
}

module.exports = Renderer;
