import UUM from "../util/UUM.js";
import Collider from "../physics/Collider/CollisionSystem.js";

/**
 * the main game source code. Mainly houses implementation of the world variables set in main.js, creates the game objects, and houses the default draw() and update() functions.
 */

export default class Game {

    constructor(canvasDOM, fill = "#ffffff"){

        //define the canvasDOM and the canvas context.
        this.canvasDOM = canvasDOM;
        this.ctx = canvasDOM.getContext('2d');

        /**
         * The world environment variables. These contain useful, world-wide variables that all objects should use.
         */
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
                fill_color: fill,
                default_font: "12px Arial"
            },
            time_factor: 1
        };

        /**
         * @deprecated use this.environment.width
         */
        this.gameWidth = this.environment.width;
        /**
         * @deprecated use this.environment.height
         */
        this.gameHeight = this.environment.height;
        
        this.gameObjects = [];

        //create a new Universal Util Manager for easily reusable classes.
        this.UUM = new UUM();
    }

    /**
     * updates all objects, as well as invoking any simulator updates.
     * @param {number} deltaTime - deltaTime from the gameLoop
     * @param {[]} simulatorUpdates - an array of all simulatorUpdates. (This will be condensed in the future to an array contained within the constructor for game.js, so passing this through will be unnecessary.)
     */
    update (deltaTime, simulatorUpdates){
        this.gameObjects.forEach(object => object.update(this.WORLD_CONSTRAINTS, this.gameObjects, deltaTime));
        document.addEventListener("resize", e => {
            this.fix_dpi();
        });

        simulatorUpdates.forEach(func => func.method.runUpdates(func.args));
    }

    //the draw loop. Again, actal object drawing is done by each object to keep the game file clean. However, this method does directly draw the FPS.
    /**
     * draws all objects on screen, as well as any debug information
     * @param {number} fps - passed through from gameLoop for debug purposes.
     */
    draw(fps){
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        if(this.environment.defaults.fill_color != "#ffffff"){
            this.ctx.fillStyle = this.environment.defaults.fill_color;
            this.ctx.fillRect(0,0,this.gameWidth,this.gameHeight);
        }
        this.gameObjects.forEach(object => object.draw(this.ctx));
        
        this.ctx.fillStyle = this.environment.defaults.fill_color; //set ctx fillstyle to the fillstyle assigned in the env. variables
        
        this.ctx.fillStyle = this.UUM.universalColorManager.invertColor(this.environment.defaults.fill_color);
        if(isNaN(fps) == false) this.ctx.fillText("FPS: " + Math.ceil(fps), 5, 15); //display the fps. this should be last so the FPS are always drawn on top of all objects.
    }

    add(object){
        this.gameObjects.push(object);
    }

    remove(id){
        this.gameObjects.splice(id, 1);
    }
    
    fix_dpi() {
        let canvasDOM = this.canvasDOM;
        let dpi = window.devicePixelRatio;
        var style_width = getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2); //get width attribute
        var style_height = getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2); //get height attribute

        var w = style_width * dpi; //scale width by DPI
        var h = style_height * dpi; //scale height by DPI

        canvasDOM.setAttribute('width', w); //set canvas width to scaled width
        canvasDOM.setAttribute('height', h); //set canvas height to scaled height

        this.gameWidth = w;
        this.gameHeight = h;
    }

    debug(){
        console.log('debug');
    }
}