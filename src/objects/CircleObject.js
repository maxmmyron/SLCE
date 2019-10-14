import Controller from "../handlers/Controller.js";

export default class circleObject extends Controller{
    constructor(game, radius, color, posX, posY) {

        super(game);

        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.size = {
            radius: radius
        };

        this.style = {
            color: color
        };

        this.constraints = {
            maxSpeed: 5,
            friction: 0.5  
        };

        this.pos = {
            x: posX,
            y: posY
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    update(delta){
        if(!delta) return;
        
        if(this.keyBuffer[87] == false && this.keyBuffer[83] == false) this.velocity.y = this.velocity.y * 0.8;
        if(this.keyBuffer[65] == false && this.keyBuffer[68] == false) this.velocity.x = this.velocity.x * 0.8;

        this.checkMove(this.keyBuffer);
        this.checkWallHit();
       
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

    }
} 