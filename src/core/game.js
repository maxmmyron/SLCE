import RigidSurface from "../objs/RigidSurface.js";
import InputHandler from "../Handlers/InputHandler.js";
import CircleObject from "../Objects/Circle.js";
import ConvexShape from "../objs/ConvexShape.js";
import RigidShape from "../objs/RigidShape.js";
import nBody from "../Physics/nBody.js";
import ColorManager from "../Math/ColorManager.js";
import MouseHandler from "../Handlers/MouseHandler.js";
import UUM from "../util/UUM.js";

/**
 * the main game source code. Mainly houses implementation of the world variables set in main.js, creates the game objects, and houses the default draw() and update() functions.
 */

export default class Game {

    constructor(canvasDOM, fill = "#ffffff"){

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
                fill_color: fill
            },
            time_factor: 1
        };

        this.gameWidth = this.environment.width;
        this.gameHeight = this.environment.height;
        
        this.gameObjects = [];

        this.UUM = new UUM();
    }

    update (deltaTime, simulatorUpdates){
        this.gameObjects.forEach(object => object.update(this.WORLD_CONSTRAINTS, this.gameObjects, deltaTime));
        document.addEventListener("resize", e => {
            this.fix_dpi();
        });
        
        simulatorUpdates.forEach(method => method.runUpdates());
    }

    //the draw loop. Again, actal object drawing is done by each object to keep the game file clean. However, this method does directly draw the FPS.
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
}