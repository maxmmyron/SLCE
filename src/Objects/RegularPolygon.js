import UOM from "./UOM.js";
import Vector from "../Math/Vector.js";

/**
 * creates an n-sided, regular polygon
 */
export default class RegularPolygon extends UOM{
    constructor(game, pos, vel, radius, sideNum, color = "#000000", b = false){
        super(game, pos, vel, color);

        this.r = radius;
        this.s = sideNum;

        this.b = b;

        this.a = Math.PI*3/2;
        this.points = [];
        this.sides = []; // [[{x,y},{x,y}], ...]
        this.max = new Vector();
        this.min = new Vector(Infinity, Infinity);
        
        this.fill = color;
    }

    update(CONSTRAINTS, gameObjects, delta){
        if(!delta) return;
        
        this.vel.x *= 0.7;
        this.vel.y *= 0.7;

        //integrate mass into velocities, inertia

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.vel.y += this.game.environment.physics.acceleration.y;

        this.checkMove(this.keyBuffer);
    }

    draw(ctx){
        //console.log('drawing');
        this.sides = [];
        this.points = [];

        ctx.beginPath();
        for(var i = 0; i <= this.s; i++) {
            var px = this.pos.x + this.r*Math.cos(this.a), py = this.pos.y + this.r*Math.sin(this.a);
            //console.log(px,py);
            if(i == 0) {
                ctx.moveTo(px,py);
            }
            else {
                ctx.lineTo(px,py);
                this.sides.push([{x: this.points[i-1].x, y: this.points[i-1].y},{x: px, y: py}]);
            }
            if(px > this.max.x) {this.max.x = px;}
            if(py > this.max.y) {this.max.y = py;}
            if(px < this.min.x) {this.min.x = px;}
            if(py < this.min.y) {this.min.y = py;}
            this.points.push({x: px, y:py});
            this.a += Math.PI*2/this.s;
        }
        this.points.pop();
        ctx.strokeStyle = this.fill;
        ctx.lineWidth = 5;
        ctx.stroke();
    }
    
    //return {p:points, s:sides,max,min};
  }