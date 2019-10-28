import RigidSurface from "./objects/RigidSurface.js";
import InputHandler from "./handlers/inputHandler.js";
import CircleObject from "./objects/CircleObject.js";
import Shape from "./objects/Shape.js";
import RigidShape from "./objects/RigidShape.js";
import nBody from "./physics/nBody.js";
//^^required imports

/**
 * the main game source code. Mainly houses implementation of the world variables set in main.js, creates the game objects, and houses the default draw() and update() functions.
 * 
 */
export default class Game {
    //creates a new constructor with obligatory env. variables.
    constructor(WORLD_CONSTRAINTS, world_variables, ctx){
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

        this.time_factor = WORLD_CONSTRAINTS.TIME_FACTOR;

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

    //start() helps to populate the world environment by creating objects.
    start(ctx){
        this.surface = new RigidSurface(this);

        this.circle1 = new CircleObject(this, 15, "#00FFAC", 700, 400, 3);
        this.circle2 = new CircleObject(this, 25, "#A0C34F", 500, 600, 3);

        this.rigidObject = new RigidShape([[0,0], [0,55], [505,55], [505,0]], 300, 100, "#A0C3F0");
        this.player = new Shape(this, [[0,0],[0,50],[25,50],[25,0]], 500, 600, "#FF00FF");

        this.triangle1 = new Shape(this, [[30, 0], [60, 60], [0, 60]], 50, 50, "#F5A88C");
        this.pentagon1 = new Shape(this, [[25,0], [0,25], [10,50], [40,50], [50,25]], 700, 700, "#71A84F");

        this.gameObjects = [ //renders in order from [0] => [gameObjects.length]. Place always on top objects at end of array.
            /*this.rigidObject,
            this.circle1,
            this.circle2,
            this.triangle1,
            this.pentagon1,
            this.player
            
            this.surface*/
        ];

        var pL = this.gameObjects.length;
        for(var i = 0; i<= 50; i++){
            this.gameObjects[i + pL] = new CircleObject(
                this, //canvas context 
                Math.floor(Math.random() * 5) + 20, //radius
                this.getRandomColor(), //color
                Math.random() * this.gameWidth, //starting x pos
                Math.random() * this.gameHeight, //starting y pos
                Math.floor(Math.random() * 10), //density
                Math.floor(Math.random() * 20) - 10, //starting x vel
                Math.floor(Math.random() * 20) - 10 //starting y vel
            ); 
        }

        console.log(this.gameObjects);
        
        /*it would be nice to be able to have dual inputhandlers. 
        maybe pass an array with all objects to be assigned input 
        handlers, then give each one a seperate set of movement bindings?*/
        //new InputHandler(this.pentagon1); //creates a new input handler hooked to the object set in the arguments. This input handler is able to be controlled by the player.
    }

    //the update loop. Actual object updating is done by each object to keep the game file clean.
    update (deltaTime){
        this.gameObjects.forEach(object => object.update(this.WORLD_CONSTRAINTS, this.gameObjects, deltaTime));
    }

    //the draw loop. Again, actal object drawing is done by each object to keep the game file clean. However, this method does directly draw the FPS.
    draw(fps, ctx){
        
        this.gameObjects.forEach(object => object.draw(ctx));
        
        ctx.fillStyle = this.default_styles.fillStyle; //set cts fillstyle to the fillstyle assigned in the env. variables
        if(isNaN(fps) == false) ctx.fillText("FPS: " + Math.ceil(fps), 5, 15); //display the fps. this should be last so the FPS are always drawn on top of all objects.
    }

    //mainly debug code, just used in tandem with the for loop above for creating a bunch of random spheres.
    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}