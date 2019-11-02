/**
 * A Vector. Creates and handles math with vectors.
 */
export default class Vector{
    /**
     * A new vector
     * @typedef {Object} Vector
     * @param {number} x - the x component of the vector 
     * @param {number} y - the y component of the vector
     */
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;

        /* diagram of the vector lol
                ^
                │\
                │ \
              y │  \ 
                │  θ\
                └────>
                   x
        */
    }


    /**
     * Returns the current x and y components as array.
     */
    get(){
        return [this.x, this.y];
    }

    /**
     * Sets the x and y components of a vector to the specified component values.
     * @param {number} x - the x component
     * @param {number} y - the y component
     */
    set(x, y){
        this.x = x;
        this.y = y;
    }

    /**
     * adds a given vector onto the parent vector
     * @param {Vector} vector - a given vector
     */
    addVector(vector){
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    /**
     * subtracts a given vector onto the parent vector
     * @param {Vector} vector - a given vector
     */
    subtractVector(vector){
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    /**
     * returns the dot product of a given vector and the parent vector
     * @param {Vector} vector - a given vector
     */
    dotProductOfVector(vector){
        return (this.x * vector.x + this.y, vector.y);
    }

    /**
     * Returns the given vector's angle in terms of radians or degrees
     * @param {Vector} vec - a given vector
     * @param {boolean} inDeg - Boolean value, if true, then angle will be returned in degrees. If false, then angle will be returned in radians.
     */
    getVecAngleFromXY(vector, inDeg){
        return (inDeg ? Math.atan(vector.x / vector.y) * (180 * Math.PI) : Math.atan(vector.x / vector.y));
    }

    /**
     * returns the magnitude of the parent vector
     */
    getVectorMagnitude(){
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    /** draws a new vector on a canvas
     * @param {Context} ctx - a given canvas
     * @param {number} x - x pos to start at
     * @param {number} y - y pos to start at
     */
    draw(ctx, x, y){
        ctx.moveTo(x, y);
        ctx.lineTo(this.x, this.y);
    }
}