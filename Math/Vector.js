/**
 * A Vector. Creates and handles math with vectors.
 */
export default class Vector{
    /**
     * A new vector
     * @typedef {Object} Vector
     * @param {number} x - the x component of the vector 
     * @param {*} y - the y component of the vector
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
                └──── >
                   x
        */
    }

    /**
     * Returns the given vector's angle in terms of radians or degrees
     * @param {Vector} vec - a {@link Vector}
     * @param {boolean} inDeg - Boolean value, if true, then angle will be returned in degrees. If false, then angle will be returned in radians.
     */
    getVecAngleFromXY(vector, inDeg){
        return (inDeg ? Math.atan(vector.x / vector.y) * (180 * Math.PI) : Math.atan(vector.x / vector.y));
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
     * 
     * @param {Vector} vector - a given vector
     */
    addVector(vector){
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtractVector(vector){
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    dotVector(vector){
        return (this.x * vector.x + this.y, vector.y);
    }
}