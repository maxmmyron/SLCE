import Vector from "../Math/Vector.js";
import Box from "./Box.js";
import UOM from "./UOM.js";

/**
 * Creates an n-sided Polygon
 */
 export default class Polygon extends UOM{
     constructor(game, pos, vel, points, color = "#000000", b = false){
        super(game, pos, vel, color);

        this.p = points || [];
        this.points = [];
        this.b = b;

        this.a = Math.PI*3/2;

        this.sides = []; // [[{x,y},{x,y}], ...]
        this.max = {x:0,y:0};
        this.min = {x:Infinity,y:Infinity};
        
        this.fill = color;
    }

    update(CONSTRAINTS, gameObjects, delta){
        if(!delta) return;

        //console.log('got');
        this.vel.x *= 0.7;
        this.vel.y *= 0.7;

        //integrate mass into velocities, inertia

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        this.vel.y += this.game.environment.physics.acceleration.y;

        this.checkMove(this.keyBuffer);
        this.points = [];
        this.p.forEach(p =>{
            this.points.push({x: p.x + this.pos.x, y:p.y + this.pos.y});
        });
        //console.log(this.points);
    }

    draw(ctx){
        var p = this.points;
        ctx.strokeStyle = this.fill;
        ctx.lineWidth = 5;
        var sides = [];
        p.forEach(function (point, i) {
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            } else if (i === (p.length - 1)) {
                ctx.lineTo(point.x, point.y);
                ctx.lineTo(p[0].x, p[0].y);
                ctx.stroke();
                sides.push([{x: p[i-1].x, y: p[i-1].y},{x: point.x, y: point.y}]);
            } else {
                ctx.lineTo(point.x, point.y);
                sides.push([{x: p[i-1].x, y: p[i-1].y},{x: point.x, y: point.y}]);
            }
        });
        this.sides = sides;
    }

    getType(){
      return "polygon";
    }
}