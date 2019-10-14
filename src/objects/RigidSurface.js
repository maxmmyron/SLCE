export default class rigidSurface {
    constructor(game) {
        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.style = {
            color: game.surface_settings.color
        };

        this.pos = {
            x: 0,
            y: this.gameHeight - game.surface_settings.height
        };
    }

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.gameWidth, this.gameHeight);
    }

    update(delta){
        if(!delta) return;
        
    }
} 