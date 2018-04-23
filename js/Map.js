const helpers = require('./helpers.js');
const Voxel = require('./Voxel.js');

class Map {
    constructor(game) {
        this.game = game;
    }

    get center() {
        return {
            x: this.size.x / 2,
            y: this.size.y / 2,
            z: 0
        }
    }

    load(file) {
        return helpers.loadJSON(file)
            .then(map => {
                this.name = map.name;
                this.size = map.size;
                this.data = map.data.map((voxelData, index) => {
                    if (!voxelData) return;
                    let p = this.getPosition(index);
                    return new Voxel(this, p.x, p.y, p.z, ...voxelData);
                });
            });
    }

    getIndex(...args) {
        let x, y, z;
        if (args.length === 1) {
            x = args[0].x; y = args[0].y; z = args[0].z;
        } else {
            x = args[0]; y = args[1]; z = args[2];
        }
        x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
        return x + this.size.x * (y + this.size.y * z);
    }

    getPosition(i) {
        let z = Math.floor(i / (this.size.y * this.size.x));
        i -= z * this.size.y * this.size.x;
        let y = Math.floor(i / (this.size.x));
        i -= y * this.size.x;

        return { x: i, y: y, z: z }
    }

    getVoxel(x, y, z) {
        return this.data[this.getIndex(x, y, z)];
    }

    addVoxel(voxel) {
        this.data[this.getIndex(voxel.position)] = voxel;
    }

    removeVoxel(x, y, z) {
        this.data[this.getIndex(x, y, z)] = null;
    }

    isInside(x, y, z) {
        return x >= 0 && x < this.size.x
            && y >= 0 && y < this.size.y
            && z >= 0 && z < this.size.z;
    }

}

module.exports = Map;