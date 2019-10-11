import RigidSurface from "./objects/RigidSurface.js";
import RigidObject from "./objects/RigidObject.js";
import InputHandler from "./inputHandler.js";
import Player from "./objects/Player.js";
import objectCollision from "./physics/objectCollision.js";

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
        this.rigidObject = new RigidObject(this);

        this.gameObjects = [
            this.surface, 
            this.player,
            this.rigidObject
        ];

        new InputHandler(this.player);
        this.objectCollider = new objectCollision(this.player, this.rigidObject);
    }

    update (deltaTime){
        this.gameObjects.forEach(object => object.update(deltaTime));
        this.objectCollider.checkCollision();
    }

    draw(fps, ctx){
        ctx.fillStyle= this.default_styles.fillStyle;
        if(isNaN(fps) == false) ctx.fillText("FPS: " + Math.ceil(fps), 5, 15);
    
        this.gameObjects.forEach(object => object.draw(ctx));
    }
}