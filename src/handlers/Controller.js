export default class Controller {
    constructor(game){
        this.game = game;

        this.keyBuffer = [];

        //default values for W,S,A,D
        this.keyBuffer[87] = false;
        this.keyBuffer[83] = false;
        this.keyBuffer[65] = false;
        this.keyBuffer[68] = false;

        this.vel = {
            x: 0,
            y: 0
        };
    }

    checkMove(buffer){
        if(buffer[87] && this.vel.y >= -this.constraints.maxSpeed) this.vel.y--;
        if(buffer[83] && this.vel.y < this.constraints.maxSpeed) this.vel.y++;
        if(buffer[65] && this.vel.x >= -this.constraints.maxSpeed) this.vel.x--;
        if(buffer[68] && this.vel.x <= this.constraints.maxSpeed) this.vel.x++;
    }

    /*checkWallHit(){
        if(this.y < 0){
            this.vel.y = 0;
            this.y = 0;
        }

        if(this.y > this.gameHeight - this.size.height - this.game.surface_settings.height){
            this.vel.y = 0;
            this.y = this.gameHeight - this.size.height - this.game.surface_settings.height;
        }

        if(this.x < 0){
            this.vel.x = 0;
            this.x = 0;
        }

        if(this.x > this.gameWidth - this.size.width){
            this.vel.x = 0;
            this.x = this.gameWidth - this.size.width;
        }
    }*/
}