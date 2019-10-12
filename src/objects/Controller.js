export default class Controller {
    constructor(game){
        this.game = game;

        this.keyBuffer = [];

        //default values for W,S,A,D
        this.keyBuffer[87] = false;
        this.keyBuffer[83] = false;
        this.keyBuffer[65] = false;
        this.keyBuffer[68] = false;

        this.velocity = {
            x: 0,
            y: 0
        };
    }

    checkMove(buffer){
        if(buffer[87] && this.velocity.y >= -this.constraints.maxSpeed) this.velocity.y--;
        if(buffer[83] && this.velocity.y < this.constraints.maxSpeed) this.velocity.y++;
        if(buffer[65] && this.velocity.x >= -this.constraints.maxSpeed) this.velocity.x--;
        if(buffer[68] && this.velocity.x <= this.constraints.maxSpeed) this.velocity.x++;
    }

    checkWallHit(){
        if(this.position.y < 0){
            this.velocity.y = 0;
            this.position.y = 0;
        }

        if(this.position.y > this.gameHeight - this.size.height - this.game.surface_settings.height){
            this.velocity.y = 0;
            this.position.y = this.gameHeight - this.size.height - this.game.surface_settings.height;
        }

        if(this.position.x < 0){
            this.velocity.x = 0;
            this.position.x = 0;
        }

        if(this.position.x > this.gameWidth - this.size.width){
            this.velocity.x = 0;
            this.position.x = this.gameWidth - this.size.width;
        }
    }
}