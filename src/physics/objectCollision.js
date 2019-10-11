export default class objectCollision{
    constructor(object1, object2){
        this.object1 = object1;
        this.object2 = object2;
    }

    checkCollision(){
        let object1BoundingBox = this.getCornersOfObject(this.object1);
        let object2BoundingBox = this.getCornersOfObject(this.object2);
    }

    getCornersOfObject(object){
        let topLeft = {
            x: object.position.x, 
            y: object.position.y
        };
        let topRight = {
            x: object.position.x + object.size.width, 
            y: object.position.y
        };
        let bottomLeft = {
            x: object.position.x, 
            y: object.position.y + object.size.height
        };
        let bottomRight = {
            x: object.position.x + object.size.width, 
            y: object.position.y + object.size.height
        };
        return {
            topLeft: topLeft,
            topRight: topRight,
            bottomLeft: bottomLeft,
            bottomRight: bottomRight
        };
    }
}