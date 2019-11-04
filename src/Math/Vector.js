//Lots of this code is modified versions of the code from jriecken's SAT.js system (https://github.com/jriecken)

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
        return this;
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
     * return a cloned vector
     */
    clone(){
        return new Vector(this.x, this.y);
    }

    /**
     * copies a given vector to the parent vector
     * @param {Vector} vector - a given vector
     */
    copy(vector){
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }

    /**
     * adds a given vector onto the parent vector
     * @param {Vector} vector - a given vector
     */
    add(vector){
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * subtracts a given vector onto the parent vector
     * @param {Vector} vector - a given vector
     */
    subtract(vector){
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * Scales the vector by an x and y factor
     * @param {number} x - x scaling factor
     * @param {?number=} y - y scaling factor. if unspecificed, y direction is scaled by x factor
     */
    scale(x,y){
        this.x *= x;
        this.y *= y || x;
        return this;
    }

    rotate(angle){
        let x = this.x;
        let y = this.y;
        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) - y * Math.cos(angle);
        return this;
    }

    reverse(){
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    /**
     * normalizes the parent vector to a length of one.
     */
    normalize(){
        var length = this.len();
        if(length > 0){
            this.x = this.x / length;
            this.y = this.y / length;
        }
        return this;
    }

    /**
     * Projects the parent vector onto another vector
     * @param {Vector} vector - a given vector
     */
    project(vector){
        let a = this.dot(vector) / this.len2();
        this.x = a * other.x;
        this.y = a * other.y;
        return this;
    }

    /**
     * Project the parent vector onto a vector of unit length. Slightly more efficent when dealing with vectors of unit length
     * @param {Vector} vector - a given vector
     */
    projectN(vector){
        let a = this.dot(vector);
        this.x = a * other.x;
        this.y = a * other.y;
        return this;
    }

    reflect(axis){
        let x = this.x, y = this.y;
        this.project(axis).scale(2);
        this.x -= x;
        this.y -= y;
        return this;
    }
    relectN(axis){
        let x = this.x, y = this.y;
        this.projectN(axis).scale(2);
        this.x -= x;
        this.y -= y;
        return this;
    }

    /**
     * returns the dot product of a given vector and the parent vector
     * @param {Vector} vector - a given vector
     */
    dot(vector){
        return (this.x * vector.x + this.y, vector.y);
    }

    /**
     * Returns the given vector's angle in terms of radians or degrees
     * @param {Vector} vec - a given vector
     * @param {boolean} inDeg - Boolean value, if true, then angle will be returned in degrees. If false, then angle will be returned in radians.
     */
    vecAngle(vector, inDeg){
        return (inDeg ? Math.atan(vector.x / vector.y) * (180 * Math.PI) : Math.atan(vector.x / vector.y));
    }

    /**
     * returns the magnitude of the parent vector
     */
    getVectorMagnitude(){
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }


    /**
     * returns length^2 of a given vector
     */
    len2(){
        return this.dot(this);
    }

    /**
     * 
     */
    len(){
        return Math.sqrt(this.len2());
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