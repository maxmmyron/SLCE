import Vector from "../Math/Vector.js";
import Polygon from "./Polygon.js";

export default class Box{
    constructor(pos, w, h){
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
}