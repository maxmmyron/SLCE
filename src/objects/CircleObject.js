import Controller from "../handlers/Controller.js";

export default class circleObject extends Controller{
    constructor(game, radius, color, posX, posY) {

        super(game);

        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.radius = radius;

        this.style = {
            color: color
        };

        this.constraints = {
            maxSpeed: 5,
            friction: 0.5  
        };

        this.x = posX;
        this.y = posY;
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    update(delta){
        if(!delta) return;
        
        if(this.keyBuffer[87] == false && this.keyBuffer[83] == false) this.vel.y = this.vel.y * 0.8;
        if(this.keyBuffer[65] == false && this.keyBuffer[68] == false) this.vel.x = this.vel.x * 0.8;

        this.checkMove(this.keyBuffer);
        //this.checkWallHit();
       
        this.x += this.vel.x;
        this.y += this.vel.y;

    }
} 