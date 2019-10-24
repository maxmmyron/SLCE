import RigidSurface from "./objects/RigidSurface.js";
import InputHandler from "./handlers/inputHandler.js";
import CircleObject from "./objects/CircleObject.js";
import Shape from "./objects/Shape.js";
import RigidShape from "./objects/RigidShape.js";

export default class Game {
    constructor(WORLD_CONSTRAINTS, world_variables){
        this.WORLD_CONSTRAINTS = WORLD_CONSTRAINTS;

        this.gameWidth = WORLD_CONSTRAINTS.DIM.WIDTH;
        this.gameHeight = WORLD_CONSTRAINTS.DIM.HEIGHT;

        this.surface_settings = {
            color: WORLD_CONSTRAINTS.SURFACE_SETTINGS.COLOR,
            height: WORLD_CONSTRAINTS.SURFACE_SETTINGS.HEIGHT
        };

        this.default_styles = {
            fillStyle: WORLD_CONSTRAINTS.DEFAULT_STYLES.FILL_STYLE
        };

        this.world_variables = {
            physics_variables: {
                air_density: world_variables.physics_variables.air_density,
                wind: {
                    x: world_variables.physics_variables.wind.x,
                    y: world_variables.physics_variables.wind.x
                },
                water_density: world_variables.physics_variables.water_density
            }
        };

    }

    start(ctx){
        this.surface = new RigidSurface(this);

        this.circle1 = new CircleObject(this, 15, "#00FFAC", 700, 400, 3);
        this.circle2 = new CircleObject(this, 25, "#A0C34F", 500, 600, 3);

        this.rigidObject = new RigidShape([[0,0], [0,55], [505,55], [505,0]], 300, 100, "#A0C3F0");
        this.player = new Shape(this, [[0,0],[0,50],[25,50],[25,0]], 500, 600, "#FF00FF");

        this.triangle1 = new Shape(this, [[30, 0], [60, 60], [0, 60]], 50, 50, "#F5A88C");
        this.pentagon1 = new Shape(this, [[25,0], [0,25], [10,50], [40,50], [50,25]], 700, 700, "#71A84F");

        this.gameObjects = [ //renders in order from [0] => [gameObjects.length]. Place always on top objects at end of array.
            this.rigidObject,
            this.circle1,
            this.circle2,
            this.triangle1,
            this.pentagon1,
            this.player
            
            //this.surface
        ];

        var pL = this.gameObjects.length;

        for(var i = 0; i<= 500; i++){
            this.gameObjects[i + pL] = new CircleObject(this, Math.floor(Math.random() * 25 + 5), this.getRandomColor() , Math.random() * this.gameWidth, Math.random() * this.gameHeight, Math.floor(Math.random() * 50), Math.floor(Math.random() * 100) - 50, Math.floor(Math.random() * 100) - 50);
        }

        //creates a new input handler hooked to the object set in the arguments
        new InputHandler(this.circle1);

        //creates a new collision system.
        //this.rigidCollider = new ObjectCollision(ctx);
    }

    update (deltaTime){
        this.gameObjects.forEach(object => object.update(this.WORLD_CONSTRAINTS, deltaTime));
    }

    draw(fps, ctx){
        ctx.fillStyle= this.default_styles.fillStyle;
        if(isNaN(fps) == false) ctx.fillText("FPS: " + Math.ceil(fps), 5, 15);
    
        this.gameObjects.forEach(object => object.draw(ctx));
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}