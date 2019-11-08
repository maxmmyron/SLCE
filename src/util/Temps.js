import Vector from "../Math/Vector.js";
import Response from "../physics/Collider/Response.js";
import Box from "../Objects/Box.js";

export default class Temps{
    constructor(){
        this.T_VECTORS = [];
        for (var i = 0; i < 10; i++) { this.T_VECTORS.push(new Vector()); }

        this.T_ARRAYS = [];
        for(i = 0; i < 5; i ++) {this.T_ARRAYS.push([]);}

        this.T_RESPONSE = new Response();

        this.TEST_POINT = new Box(new Vector(), 0.000001, 0.000001).toPolygon();
    }
    
}