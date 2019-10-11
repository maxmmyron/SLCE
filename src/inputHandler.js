export default class InputHandler {
    constructor(object){

        document.body.addEventListener("keydown", function (e) {
            object.keyBuffer[e.keyCode] = true;
        });

        document.body.addEventListener("keyup", function (e) {
            object.keyBuffer[e.keyCode] = false;
        });
    }
}