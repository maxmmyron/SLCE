export default class InputHandler {
    constructor(player){
        document.addEventListener("keydown", event => {
            switch(event.keyCode){
                case 87: //W
                    player.moveUp();
                    break;

                case 83: //S
                    player.moveDown();
                    break;
                
                case 65: //A
                    player.moveLeft();
                    break;

                case 68: //D
                    player.moveRight();
                    break;
            }
        });

        document.addEventListener("keyup", event => {
            switch(event.keyCode){
                case 87: //W
                    player.moveWStop();
                    break;

                case 83: //S
                    player.moveSStop();
                    break;

                case 65: //A
                    player.moveAStop();
                    break;

                case 68: //D
                    player.moveDStop();
                    break;
            }
        });
    }
}