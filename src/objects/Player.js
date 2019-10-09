export default class Player {
    constructor(game) {

        this.game = game;
        console.log(this.game);

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

        this.keyBuffer = [];

        //default values for W,S,A,D
        this.keyBuffer[87] = false;
        this.keyBuffer[83] = false;
        this.keyBuffer[65] = false;
        this.keyBuffer[68] = false;

        this.size = {
            width: 25,
            height: 50
        };

        this.style = {
            color: "#FF00FF"
        };

        this.constraints = {
            maxSpeed: 5,
            friction: 0.5  
        };
        
        this.velocity = {
            x: 0,
            y: 0
        };

        this.position = {
            x: this.gameWidth / 2 - this.size.width / 2,
            y: this.gameHeight / 2 - this.size.height / 2
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

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update(delta){
        if(!delta) return;

        if(this.keyBuffer[87] == false && this.keyBuffer[83] == false) this.velocity.y = this.velocity.y * 0.8;
        if(this.keyBuffer[65] == false && this.keyBuffer[68] == false) this.velocity.x = this.velocity.x * 0.8;

        this.checkMove(this.keyBuffer);
        this.checkWallHit();
       
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}  