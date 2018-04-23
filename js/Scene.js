const debug = require('./debug.js');
const Action = require('./Action.js');
const InputListener = require('./InputListener.js');
const distance = require('./helpers.js').distance;
const Timer = require('./Timer.js');

const STATES = {
    idle: "IDLE",
    canRemove: "CAN_REMOVE",
    canDrag: "CAN_DRAG",
    dragging: "DRAGGING",
    rotating: "ROTATING",
    canRotate: "CAN_ROTATE",
    adding: "ADDING",
    removing: "REMOVING"
}

class Scene {
    constructor(game) {
        this.game = game;
        this._statusNames = [];
        this.statusIndex = 0;
        this.actions = [];

        this.timer = new Timer();

        this.setActions();

        this.gridLevel = 0;
        this.color = {
            h: 0,
            s: 100,
            l: 50
        }

        this._states = [STATES.idle];

        this._placeableVoxel;
    }

    get state() {
        return this._states[this._states.length - 1];
    }

    set state(state) {
        this._states.push(state);
        return state;
    }

    previousState(n = 1) {
        return this._states[this._states.length - 1 - n];
    }

    get status() {
        return this._statusNames[this.statusIndex];
    }


    /**
     * start - Start the scene with it's scenaro
     *
     */
    start() {

    }


    /**
     * update - Update the scene
     *
     */
    update(dt) {

    }


    /**
     * resetActions - Turn off the current set of available actions
     *
     */
    resetActions() {
        this.actions.forEach(action => {
            action.deactivate();
        })
    }

    startDragging(position) {
        this._lastDragPosition = position;
    }

    drag(position) {
        let gc1 = this.game.gridCoordinates(this._lastDragPosition.x, this._lastDragPosition.y, 0, "z");
        let gc2 = this.game.gridCoordinates(position.x, position.y, 0, "z");
        let delta = {
            x: gc1.x - gc2.x,
            y: gc1.y - gc2.y
        }
        this.game.move(delta);

        this._lastDragPosition = position;
    }

    startRotating(position) {
        this._lastRotatePosition = position;
    }

    rotate(position) {
        let angle = - (position.x - this._lastRotatePosition.x) / 200;
        this.game.rotate(angle);

        this._lastRotatePosition = position;
    }

    moveGrid(z) {
        this.gridLevel += z;
        if (this.gridLevel < 0) this.gridLevel = 0;
        if (this.gridLevel >= this.game.map.size.z) this.gridLevel = this.game.map.size.z - 1;
    }

    addVoxel() {
        let placeable = this._placeableVoxel;

        if (!placeable) return;

        this.game.addVoxel(placeable.x, placeable.y, placeable.z, this.color.h, this.color.s, this.color.l);

        this.movePlaceable();
    }

    removeVoxel() {
        let map = this.game.map;
        let cursor = this.game.cursor;

        this.game.removeVoxel(cursor.x, cursor.y, cursor.z);
    }

    selectColor(color) {
        this.color = color;
    }

    movePlaceable() {
        this._placeableVoxel;

        let cursor = this.game.cursor;
        let map = this.game.map;

        let placeable = {
            x: Math.floor(cursor.x),
            y: Math.floor(cursor.y),
            z: Math.floor(cursor.z)
        }

        if (cursor.f === 0) placeable.z++;
        if (cursor.f === 1) placeable.y++;
        if (cursor.f === 2) placeable.x++;
        if (cursor.f === 3) placeable.y--;
        if (cursor.f === 4) placeable.x--;

        if (map.isInside(placeable.x, placeable.y, placeable.z) && !map.getVoxel(placeable.x, placeable.y, placeable.z)) {
            this._placeableVoxel = placeable;
        } else {
            this._placeableVoxel = null;
        }
    }

    removePlaceable() {
        this._placeableVoxel = null;
    }


    /**
     * setActions - Set the default set of actions
     */
    setActions() {
        this.resetActions();

        // mouse move
        this.addAction('onmousemove', function (eventName, data) {
            this.game.setMouseCoordinates(data.x, data.y);

            if ([STATES.idle, STATES.adding].includes(this.state)) this.movePlaceable();
            if (this.state === STATES.dragging) this.drag(data);
            if (this.state === STATES.rotating) this.rotate(data)
            if (this.state === STATES.adding) this.addVoxel();
            if (this.state === STATES.removing) this.removeVoxel(data);
        }, ['map-onmousemove']);

        // mouse down
        this.addAction('mouse down', function (eventName, data) {
            if (this.state === STATES.idle) {
                this.addVoxel();
                this.state = STATES.adding;
            }
            if (this.state === STATES.canDrag) {
                this.startDragging(data);
                this.state = STATES.dragging;
            }
            if (this.state === STATES.canRotate) {
                this.startRotating(data);
                this.state = STATES.rotating;
            }
            if (this.state === STATES.canRemove) {
                this.removeVoxel(data);
                this.state = STATES.removing;
            }
        }, ['map-onmouseleftdown']);
        // mouse up
        this.addAction('endDragging', function (eventName, data) {
            if (this.state === STATES.adding || this.state === STATES.removing || this.state === STATES.dragging || this.state === STATES.rotating) {
                this.state = this.previousState();
            }
        }, ['map-onmouseleftup']);

        // drag on key press
        this.addAction('startDragging', function (eventName, data) {
            if (this.state === STATES.idle) {
                this.removePlaceable();
                this.state = STATES.canDrag;
            }
        }, ['onkeydown- ']);
        // end drag on key press
        this.addAction('endDragging', function (eventName, data) {
            if (this.state === STATES.canDrag || this.state === STATES.dragging) {
                this.state = STATES.idle;
            }
        }, ['onkeyup- ']);

        // rotate on key press
        this.addAction('startRotating', function (eventName, data) {
            if (this.state === STATES.idle) {
                this.removePlaceable();
                this.state = STATES.canRotate;
            }
        }, ['onkeydown-Shift']);
        // end rotate on key press
        this.addAction('endRotating', function (eventName, data) {
            if (this.state === STATES.canRotate || this.state === STATES.rotating) {
                this.state = STATES.idle;
            }
        }, ['onkeyup-Shift']);

        // remove on key press
        this.addAction('startRemoving', function (eventName, data) {
            if (this.state === STATES.idle) {
                this.removePlaceable();
                this.state = STATES.canRemove;
            }
        }, ['onkeydown-Alt']);
        // end remove on key press
        this.addAction('endRemoving', function (eventName, data) {
            if (this.state === STATES.canRemove || this.state === STATES.removing) {
                this.state = STATES.idle;
            }
        }, ['onkeyup-Alt']);

        // rotate on key press
        this.addAction('rotate+', function (eventName, data) {
            this.game.rotate(Math.PI / 64);
            this.removePlaceable();
        }, ['onkeydown-+']);
        // rotate on key press
        this.addAction('rotate-', function (eventName, data) {
            this.game.rotate(- Math.PI / 64);
            this.removePlaceable();
        }, ['onkeydown--']);
        // start rotating on mouse down
        this.addAction('startRotating', function (eventName, data) {
            if (this.state === STATES.idle || this.state === STATES.canRotate) {
                this.startRotating(data);
                this.state = STATES.rotating;
                this.removePlaceable();
            }
        }, ['map-onmousemiddledown']);
        // end rotating on mouse up
        this.addAction('endRotating', function (eventName, data) {
            if (this.state === STATES.rotating) {
                this.state = this.previousState();
            }
        }, ['map-onmousemiddleup']);

        // zoom on mouse wheel
        this.addAction('zoom', function (eventName, data) {
            this.game.zoom(- data / 300);
            this.removePlaceable();
        }, ['map-onwheel']);

        // change grid level on key press
        this.addAction('gridUp', function (eventName, data) {
            this.moveGrid(1);
            this.removePlaceable();
        }, ['onkeydown-ArrowUp', 'onkeydown-z']);
        // change grid level on key press
        this.addAction('gridDown', function (eventName, data) {
            this.moveGrid(-1);
            this.removePlaceable();
        }, ['onkeydown-ArrowDown', 'onkeydown-s']);

        // select color
        this.addAction('selectColor', function (eventName, data) {
            this.selectColor(data);
        }, ['colorPicker-onchange']);
    }


    /**
     * addAction - Add an action
     *
     * @param  {string} name        Action's name
     * @param  {function} operation Action's operation
     * @param  {string[]} triggers  Action's triggers
     * @return {Action}             Action added
     */
    addAction(name, operation, triggers) {
        let action = new Action(this, name, operation, triggers);
        this.actions.push(action);
        return action;
    }


    /**
     * removeAction - Remove an action if it exists currently
     *
     * @param  {string} name Name of the action to remove       
     */
    removeAction(name) {
        let actionsToRemove = this.actions.filter(a => a.name === name);
        actionsToRemove.forEach(a => {
            a.deactivate();
            this.actions.splice(this.actions.indexOf(a));
        });
    }
}

module.exports = Scene;
