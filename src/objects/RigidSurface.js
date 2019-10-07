export default class rigidSurface {
    constructor(game, bottomOffset, color) {
  
        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.style = {
            color: color
        };

        this.position = {
            x: 0,
            y: this.gameHeight - bottomOffset
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.position.x, this.position.y, this.gameWidth, this.gameHeight);
    }

    update(delta){
        if(!delta) return;
        
    }
}  