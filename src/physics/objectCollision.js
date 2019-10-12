export default class objectCollision{
    constructor(){}

    checkBoxCollision(box1, box2){
        if( box1.position.x < box2.position.x + box2.size.width &&
            box1.position.x + box1.size.width > box2.position.x &&
            box1.position.y < box2.position.y + box2.size.height &&
            box1.position.y + box1.size.height > box2.position.y ) box1.style.color = "#00FF00"; 
        else box1.style.color = "#FF00FF";
    }

    checkCircleCollision(circle1, circle2){
        let dx = circle1.position.x - circle2.position.x;
        let dy = circle1.position.y - circle2.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < circle1.size.radius + circle2.size.radius) circle1.style.color = "#FF0F0F";
        else circle1.style.color = "#00FFAC";
    }
}