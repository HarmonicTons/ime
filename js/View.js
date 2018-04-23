const rotate = require('./helpers.js').rotate;

class View {
    constructor(renderer, canvas, x = 0, y = 0, z = 0, w = Math.PI / 4, scale = 1) {
        this.renderer = renderer;
        this.canvas = canvas;
        this.camera = {
            x: x,
            y: y,
            z: z,
            w: w
        };
        this.scale = scale;

        this._baseVoxelSize = 32;
    }

    get width() {
        return this.canvas.width;
    }
    set width(w) {
        this.canvas.width = w;
    }

    get height() {
        return this.canvas.height;
    }
    set height(h) {
        this.canvas.height = h;
    }

    get voxelSize() {
        return this._baseVoxelSize * this.scale;
    }

    get visibleSides() {
        let w = this.camera.w
        return {
            x: w >= 0 && w < Math.PI,
            y: w < Math.PI / 2 || w >= 3 * Math.PI / 2
        }
    }

    /**
     * Rotate around a point
     * @param {number} w angle
     * @param {object=} c center
     */
    rotate(w, c = this.camera) {

        let sc = this.screenCoordinates(c.x, c.y, c.z);

        this.camera.w += w;

        if (this.camera.w < 0) this.camera.w += (2 * Math.PI);
        this.camera.w = this.camera.w % (2 * Math.PI);

        let gc = this.gridCoordinatesZ(sc.x, sc.y, 0);

        this.move({
            x: c.x - gc.x,
            y: c.y - gc.y
        })
    }

    /**
     * Get the screen coordinates from the grid coordinates
     * @param {number} x horizontal grid coordinate
     * @param {number} y vertical grid coordinate
     * @param {number} z height grid coordinate
     * @return {object}  screen coordinates
     */
    screenCoordinates(x, y, z) {

        // place in orthogonal base 
        let p1 = {
            x: (x - this.camera.x) * this.voxelSize,
            y: (y - this.camera.y) * this.voxelSize,
        }

        let p2 = rotate(p1, this.camera.w)

        // to iso 
        let p3 = {
            x: p2.x + this.width / 2,
            y: p2.y / 2 - (z - this.camera.z) * this.voxelSize + this.height / 2
        }

        return p3;
    }

    /**
     * Get the position on a plane
     * @param {number} x screen coordinate
     * @param {number} y screen coordinate
     */
    gridCoordinatesZ(x, y, plane = 0) {
        let p0 = {
            x: x - this.width / 2,
            y: 2 * (y + (plane - this.camera.z) * this.voxelSize - this.height / 2)
        }

        let p1 = rotate(p0, -this.camera.w);

        let p2 = {
            x: p1.x / this.voxelSize + this.camera.x,
            y: p1.y / this.voxelSize + this.camera.y,
            z: plane
        }

        return p2;
    }

    gridCoordinatesX(x, y, plane = 0) {
        let c = this.camera;
        let vs = this.voxelSize
        let a = this.width / (2 * vs) + c.y * Math.sin(c.w) - c.x * Math.cos(c.w) - x / vs;
        let b = this.height / vs - c.x * Math.sin(c.w) - c.y * Math.cos(c.w) + 2 * c.z - 2 * y / vs;

        let gy = (a + plane * Math.cos(c.w)) / Math.sin(c.w);
        let gz = (b + plane * Math.sin(c.w) + gy * Math.cos(c.w)) / 2;

        return {
            x: plane,
            y: gy,
            z: gz
        }
    }

    gridCoordinatesY(x, y, plane = 0) {
        let c = this.camera;
        let vs = this.voxelSize
        let a = this.width / (2 * vs) + c.y * Math.sin(c.w) - c.x * Math.cos(c.w) - x / vs;
        let b = this.height / vs - c.x * Math.sin(c.w) - c.y * Math.cos(c.w) + 2 * c.z - 2 * y / vs;

        let gx = (plane * Math.sin(c.w) - a) / Math.cos(c.w);
        let gz = (b + gx * Math.sin(c.w) + plane * Math.cos(c.w)) / 2;

        return {
            x: gx,
            y: plane,
            z: gz
        }
    }

    zoom(delta) {
        this.scale *= 2 ** delta;
    }

    move(delta) {
        this.camera.x += delta.x;
        this.camera.y += delta.y;
    }
}

module.exports = View;
