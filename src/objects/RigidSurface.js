/**
 * Rigid Surfaces are rectangular surfaces that denote the playing floor. 
 * They are a rigidly bound object that is denoted by (x,y) and the lower 
 * right corner of the canvas, where y represents some hardcoded value 
 * in the game settings. 
 * 
 * It is planned to allow a bit more freedom, like space away from the walls of the screen, 
 * 
 * @deprecated
 */
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