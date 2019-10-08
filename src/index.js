import Game from "./game.js";

let canvas = document.getElementById('gameCanvas');
let body = document.querySelector('body');

let ctx = canvas.getContext('2d');

let dpi = window.devicePixelRatio;

function fix_dpi() {
    
    var style_width = getComputedStyle(canvas).getPropertyValue("width").slice(0, -2); //get width attribute
    var style_height = getComputedStyle(canvas).getPropertyValue("height").slice(0, -2); //get height attribute

    var w = style_width * dpi; //scale width by DPI
    var h = style_height * dpi; //scale height by DPI

    canvas.setAttribute('width', w); //set canvas width to scaled width
    canvas.setAttribute('height', h); //set canvas height to scaled height

	var rect = canvas.getBoundingClientRect();
}

fix_dpi();

let WORLD_CONSTRAINTS = {
    DIM: {
        WIDTH: Math.ceil(getComputedStyle(canvas).getPropertyValue("width").slice(0, -2)),
        HEIGHT: Math.ceil(getComputedStyle(canvas).getPropertyValue("height").slice(0, -2))
    }
};

let game = new Game(WORLD_CONSTRAINTS);
game.start();

let lastTime = 0;

function gameLoop(timestamp){
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    let fps = 1000/deltaTime;

    ctx.clearRect(0, 0, WORLD_CONSTRAINTS.DIM.WIDTH, WORLD_CONSTRAINTS.DIM.HEIGHT);

    game.update(deltaTime);
    game.draw(fps, ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);