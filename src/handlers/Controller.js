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

        this.touching = false;
    }

    checkMove(buffer){
        if(buffer[87] && this.vel.y >= -this.constraints.maxSpeed && this.touching == true) {
            this.vel.y = -30;
            this.touching = false;
        }
        if(buffer[83] && this.vel.y < this.constraints.maxSpeed) this.vel.y++;
        if(buffer[65] && this.vel.x >= -this.constraints.maxSpeed) this.vel.x =- 10;
        if(buffer[68] && this.vel.x <= this.constraints.maxSpeed) this.vel.x =+ 10;
    }

    checkWallHit(obj){
        let xPoints = [], yPoints = [];
        for(var i = 0; i < obj.points.length; i++){
            xPoints.push(obj.points[i].x);
            yPoints.push(obj.points[i].y);
        }

        xPoints.sort(); 
        let sX = xPoints[0], mX = xPoints[xPoints.length - 1];
        yPoints.sort();
        let sY = yPoints[0], mY = yPoints[yPoints.length - 1];
        

        if(obj.x < 0){
            obj.vel.x = 0;
            obj.x = 0;
        }
        if(obj.y < 0){
            obj.vel.y = 0;
            obj.y = 0;
        }
        if(obj.x + mX > this.game.gameWidth){
            obj.vel.x = 0;
            obj.x = this.game.gameWidth - mX;
        }
        if(obj.y + mY > this.game.gameHeight){
            obj.vel.y = 0;
            obj.y = this.game.gameHeight - mY;
            this.touching = true;
        }
    }
}