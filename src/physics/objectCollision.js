export default class objectCollision{
    constructor(ctx){
        this.ctx = ctx;
    }

    circleCollision(circle1, circle2){
        let dx = circle1.pos.x - circle2.pos.x;
        let dy = circle1.pos.y - circle2.pos.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < circle1.size.radius + circle2.size.radius) circle1.style.color = "#FF0F0F";
        else circle1.style.color = "#00FFAC";
    }
}