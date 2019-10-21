import Game from "./game.js";

let canvas = document.getElementById('gameCanvas');
//let body = document.querySelector('body');

let ctx = canvas.getContext('2d');

let dpi = window.devicePixelRatio;


var WORLD_CONSTRAINTS = {
    DIM: {
        WIDTH: Math.ceil(getComputedStyle(canvas).getPropertyValue("width").slice(0, -2)),
        HEIGHT: Math.ceil(getComputedStyle(canvas).getPropertyValue("height").slice(0, -2))
    },
    PHYSICS_SETTINGS: {
        ACCELERATION: {
            x: 0,
            y: 2
        }
    },
    SURFACE_SETTINGS: {
        COLOR: "#121425",
        HEIGHT: "50"
    },
    DEFAULT_STYLES: {
        FILL_STYLE: "#000000"
    }
};

var world_variables = {
    physics_variables: {
        air_density: 0.001225,
        wind: {
            x: 0,
            y: 0
        },
        water_density: 0.997
    }
};

function fix_dpi() {
    var style_width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2); //get width attribute
    var style_height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2); //get height attribute

    var w = style_width * dpi; //scale width by DPI
    var h = style_height * dpi; //scale height by DPI

    canvas.setAttribute('width', w); //set canvas width to scaled width
    canvas.setAttribute('height', h); //set canvas height to scaled height

    WORLD_CONSTRAINTS.DIM.WIDTH = style_width;
    WORLD_CONSTRAINTS.DIM.HEIGHT = style_height;
}

fix_dpi();

let game = new Game(WORLD_CONSTRAINTS);
game.start(ctx);

let lastTime = 0;

function gameLoop(timestamp){
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    let fps = 1000/deltaTime;

    window.addEventListener("resize", event => {
        fix_dpi();
    });

    ctx.clearRect(0, 0, WORLD_CONSTRAINTS.DIM.WIDTH, WORLD_CONSTRAINTS.DIM.HEIGHT);

    game.draw(fps, ctx);
    game.update(deltaTime);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);