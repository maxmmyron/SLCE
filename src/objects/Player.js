export default class Player {
    constructor(game) {
  
        this.game = game;

        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;

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

        this.interacted = {
            w: false,
            s: false,
            a: false,
            d: false
        };
    }

    moveUp(){
        this.interacted.w = true;
        this.velocity.y = -this.constraints.maxSpeed;
    }

    moveDown(){
        this.interacted.s = true;
        this.velocity.y = this.constraints.maxSpeed;
    }

    moveLeft(){
        this.interacted.a = true;
        this.velocity.x = -this.constraints.maxSpeed;
    }

    moveRight(){
        this.interacted.d = true;
        this.velocity.x = this.constraints.maxSpeed;
    }

    moveWStop(){this.interacted.w = false;}
    moveSStop(){this.interacted.s = false;}
    moveAStop(){this.interacted.a = false;}
    moveDStop(){this.interacted.d = false;}

    draw(ctx) {
        ctx.fillStyle = this.style.color;
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update(delta){
        if(!delta) return;

        if(this.interacted.w == false && this.interacted.s == false) this.velocity.y = this.velocity.y * 0.8;
        //if(this.interacted.s == false) this.velocity.y = this.velocity.y * 0.8;
        if(this.interacted.a == false && this.interacted.d == false) this.velocity.x = this.velocity.x * 0.8;
        //if(this.interacted.d == false) this.velocity.x = this.velocity.x * 0.8;
        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}  