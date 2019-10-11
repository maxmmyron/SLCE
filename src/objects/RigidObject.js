export default class RigidObject {
    constructor(game) {
        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.size = {
            width: 325,
            height: 205
        };

        this.style = {
            color: "#FF5516"
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.position = {
            x: 150,
            y: 100
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update(delta){
        if(!delta) return;
        
    }
} 