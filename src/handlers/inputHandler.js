/**
 * the InputHandler only assigns a respective pressed keycode a 
 * boolean value. This really could be implemented into Controller, 
 * but for some odd reason I haven't done it yet...
 */
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