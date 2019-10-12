import RigidSurface from "./objects/RigidSurface.js";
import RigidObject from "./objects/RigidObject.js";
import InputHandler from "./inputHandler.js";
import Player from "./objects/Player.js";
import ObjectCollision from "./physics/objectCollision.js";
import CircleObject from "./objects/CircleObject.js";

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
        this.rigidObject = new RigidObject(this);
        this.player = new Player(this);

        this.circle1 = new CircleObject(this, 15, "#00FFAC", 700, 400);
        this.circle2 = new CircleObject(this, 25, "#A0C34F", 500, 600);

        this.gameObjects = [ //renders in order from [0] => [gameObjects.length]. Place always on top objects at end of array.
            this.rigidObject,
            this.circle1,
            this.circle2,
            this.player,
            this.surface
        ];

        //creates a new input handler hooked to the object set in the arguments
        new InputHandler(this.player);

        //creates a new collision system.
        this.rigidCollider = new ObjectCollision();
    }

    update (deltaTime){
        this.gameObjects.forEach(object => object.update(deltaTime));
        this.rigidCollider.checkBoxCollision(this.player, this.rigidObject);
        this.rigidCollider.checkCircleCollision(this.circle1, this.circle2);
    }

    draw(fps, ctx){
        ctx.fillStyle= this.default_styles.fillStyle;
        if(isNaN(fps) == false) ctx.fillText("FPS: " + Math.ceil(fps), 5, 15);
    
        this.gameObjects.forEach(object => object.draw(ctx));
    }
}