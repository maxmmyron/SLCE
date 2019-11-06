
export {start};

let game, ctx, simulatorUpdates;
function start(gameContext, canvasContext, simulatorUpdateArray){
    game = gameContext;
    ctx = canvasContext;
    simulatorUpdates = simulatorUpdateArray || [];
    game.fix_dpi();
    requestAnimationFrame(gameLoop);
}

var lastTime = 0;
function gameLoop(timestamp){
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    let fps = 1000/deltaTime;

    window.addEventListener("resize", event => {
        game.fix_dpi();
    });

    game.draw(fps);
    game.update(deltaTime, simulatorUpdates);

    requestAnimationFrame(gameLoop);
}