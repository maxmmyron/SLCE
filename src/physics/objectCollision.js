/**
 * This is currently unused. Eventually, it will house the code for object collision, and possible object collision response. I still need a good SAT-based object collision response. :/
 * 
 */

export default class objectCollision{
    constructor(ctx){
        this.ctx = ctx;
    }

    circleCollision(circle1, circle2){
        let dx = circle1.x - circle2.x;
        let dy = circle1.y - circle2.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < circle1.radius + circle2.radius) circle1.style.color = "#FF0F0F";
        else circle1.style.color = "#00FFAC";
    }
}