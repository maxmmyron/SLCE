export default class InputHandler {
    constructor(player){
        var keyBuffer = [];

        document.body.addEventListener("keydown", function (e) {
            keyBuffer[e.keyCode] = true;
            player.move(keyBuffer);
        });

        document.body.addEventListener("keyup", function (e) {
            keyBuffer[e.keyCode] = false;
            player.stop(keyBuffer);
        });

        /*document.addEventListener("keydown", event => {
            this.keyBuffer[event.keyCode] = true;
            player.move(this.keyBuffer);
        });

        document.addEventListener("keyup", event => {
            
        });*/
    }
}