import Vector from "../Math/Vector.js";
import Polygon from "./Polygon.js";
import UOM from "./UOM.js";

/**
 * Creates a four-sided rectangle.
 */
export default class Box extends UOM{

    /**
     * Box constructor
     * @param {*} game - the game the box will reside in
     * @param {Vector} pos - the initial position of the box
     * @param {*} w - width of the box
     * @param {*} h - height of the box
     * @param Vector} vel - the initial velocity of the box
     * @param {*} color 
     */
    constructor(game, pos, w, h, vel, color){
        super(game, pos, vel, color);
        this.pos = pos || new Vector();
        this.w = w || 0;
        this.h = h || 0;
    }

    toPolygon(){
        let pos = this.pos;
        let w = this.w;
        let h = this.h;
        return new Polygon(new Vector(pos.x, pos.y), [
            new Vector(), new Vector(w, 0),
            new Vector(w,h), new Vector(0,h)
        ]);
    }

    getType(){
        return "polygon";
    }
}