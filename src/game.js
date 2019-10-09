import RigidSurface from "./objects/RigidSurface.js";
import InputHandler from "./inputHandler.js";
import Player from "./objects/Player.js";

export default class Game {
    constructor(WORLD_CONSTRAINTS){
        this.gameWidth = WORLD_CONSTRAINTS.DIM.WIDTH;
        this.gameHeight = WORLD_CONSTRAINTS.DIM.HEIGHT;

        this.surface_settings = {
            color: WORLD_CONSTRAINTS.SURFACE_SETTINGS.COLOR,
            height: WORLD_CONSTRAINTS.SURFACE_SETTINGS.HEIGHT
        };

        this.default_styles = {
            fillStyle: WORLD_CONSTRAINTS.DEFAULT_STYLES.FILL_STYLE
        };
    }

    start(){
        this.surface = new RigidSurface(this);
        this.player = new Player(this);

        this.gameObjects = [
            this.surface, 
            this.player
        ];

        new InputHandler(this.player);
    }

    update (deltaTime){
        this.gameObjects.forEach(object => object.update(deltaTime));
    }

    draw(fps, ctx){
        ctx.fillStyle= this.default_styles.fillStyle;
        if(isNaN(fps) == false) ctx.fillText("FPS: " + Math.ceil(fps), 5, 15);
    
        this.gameObjects.forEach(object => object.draw(ctx));
    }
}