import Vector from "../../Math/Vector.js";

export default class Response{
    constructor(){
        this.a = null;
        this.b = null;
        this.overlapN = new Vector();
        this.overlapV = new Vector();

        this.clear();
    }

    clear(){
        this.aInB = true;
        this.bInA = true;
        this.overlap = Number.MAX_VALUE;
        return this;
    }
}