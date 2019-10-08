export default class InputHandler {
    constructor(player){

        document.body.addEventListener("keydown", function (e) {
            player.keyBuffer[e.keyCode] = true;
        });

        document.body.addEventListener("keyup", function (e) {
            player.keyBuffer[e.keyCode] = false;
        });
    }
}