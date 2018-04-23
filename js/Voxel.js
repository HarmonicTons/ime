
class Voxel {
    constructor(map, x, y, z, h, s, l) {
        this.map = map
        this.position = {
            x: x,
            y: y,
            z: z
        }
        this.color = {
            h: h,
            s: s,
            l: l
        }
    }

}

module.exports = Voxel;