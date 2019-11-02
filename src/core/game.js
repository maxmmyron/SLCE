import RigidSurface from "../Objects/RigidSurface.js";
import InputHandler from "../Handlers/InputHandler.js";
import CircleObject from "../Objects/Circle.js";
import Shape from "../Objects/ConvexShape.js";
import RigidShape from "../Objects/RigidShape.js";
import nBody from "../Physics/nBody.js";
import Color from "../Math/Color.js";
import MouseHandler from "../Handlers/MouseHandler.js";

/**
 * the main game source code. Mainly houses implementation of the world variables set in main.js, creates the game objects, and houses the default draw() and update() functions.
 */

export default class Game {

    constructor(canvasDOM){

        this.canvasDOM = canvasDOM;
        this.ctx = canvasDOM.getContext('2d');

        this.environment = {
            width: Math.ceil(getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2)),
            height: Math.ceil(getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2)),
            physics: {
                acceleration: {
                    x: 0,
                    y: 0
                },
                air_density: 2.5, //measured in kg/m^3
                wind: {
                    x: 0,
                    y: 0
                },
                water_density: 0.997
            },
            surfaces: {
                color: "#121425",
                height: 50
            },
            defaults: {
                fill_color: "#000000"
            },
            time_factor: 1
        };

        this.gameWidth = this.environment.width;
        this.gameHeight = this.environment.height;

        this.mouseHandle = new MouseHandler();

        this.lastTime = 0;
    }

    //start() helps to populate the world environment by creating objects.
    start(){
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
        for(var i = 0; i < 100; i++){
            let rad = Math.floor(Math.random() * 20) + 10;
            this.gameObjects[i + pL] = new CircleObject(
                this, //canvas context 
                rad, //radius
                new Color().getRandomColor(), //color
                Math.random() * this.gameWidth, //starting x pos
                Math.random() * this.gameHeight, //starting y pos
                Math.floor(Math.random() * 10) + rad * 2, //density
                Math.floor(Math.random() * 20) - 10, //starting x vel
                Math.floor(Math.random() * 20) - 10 //starting y vel
            ); 
        }

        this.nBodySimulator = new nBody(1, 0.001, 100, this.gameObjects);



        let canvasDOM = this.canvasDOM;
        let dpi = window.devicePixelRatio;

        //obligatory DPI fix. prevents crummy, faded, or ugly rendering.
        function fix_dpi() {
            var style_width = getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2); //get width attribute
            var style_height = getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2); //get height attribute
    
            var w = style_width * dpi; //scale width by DPI
            var h = style_height * dpi; //scale height by DPI
    
            canvasDOM.setAttribute('width', w); //set canvas width to scaled width
            canvasDOM.setAttribute('height', h); //set canvas height to scaled height
        }
    
        fix_dpi();
    }

    update (deltaTime){
        this.gameObjects.forEach(object => object.update(this.WORLD_CONSTRAINTS, this.gameObjects, deltaTime));

        this.nBodySimulator.updatePositionVectors();
        this.nBodySimulator.updateVelocityVectors();
        this.nBodySimulator.updateAccelerationVectors();
    }

    //the draw loop. Again, actal object drawing is done by each object to keep the game file clean. However, this method does directly draw the FPS.
    draw(fps){
        
        this.gameObjects.forEach(object => object.draw(this.ctx));
        
        this.ctx.fillStyle = this.environment.defaults.fill_color; //set ctx fillstyle to the fillstyle assigned in the env. variables
        if(isNaN(fps) == false) this.ctx.fillText("FPS: " + Math.ceil(fps), 5, 15); //display the fps. this should be last so the FPS are always drawn on top of all objects.
    }

    //the gameloop! ensures smooth running draws and updates objects on the canvas. this should probably be moved one day into it's own, seperate class (or into game.js)
    
}