import Controller from "./Controller.js";

export default class Player extends Controller{
    constructor(game) {

        super(game);

        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.size = {
            width: 25,
            height: 50
        };

        this.style = {
            color: "#FF00FF"
        };

        this.constraints = {
            maxSpeed: 5,
            friction: 0.5  
        };

        this.position = {
            x: this.gameWidth / 2 - this.size.width / 2,
            y: this.gameHeight / 2 - this.size.height / 2
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update(delta){
        if(!delta) return;

        if(this.keyBuffer[87] == false && this.keyBuffer[83] == false) this.velocity.y = this.velocity.y * 0.8;
        if(this.keyBuffer[65] == false && this.keyBuffer[68] == false) this.velocity.x = this.velocity.x * 0.8;

        this.checkMove(this.keyBuffer);
        this.checkWallHit();
       
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}  