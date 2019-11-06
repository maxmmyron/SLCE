import Temps from "./Temps.js";

export default class Helper{
    constructor(){
        this.temps = new Temps();
    }

    /**
     * 
     * @param {Array.<Vector>} points - Array of points.
     * @param {Vector} normal - The unit vector axis.
     * @param {Array.<number>} result - An array. result[0] is minimum value, result[1] is maximum value
     */
    flattenPointsOn(points, normal, result){
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        var length = points.length;

        for(var i = 0; i < length; i++){
            var dot = points[i].dot(normal);
            if(dot < min) min = dot;
            if(dot > max) max = dot;
        }
        result[0] = min; 
        result[1] = max;
    }

    isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
        var rangeA = this.temps.T_ARRAYS.pop();
        var rangeB = this.temps.T_ARRAYS.pop();
    
        var offsetV = this.temps.T_VECTORS.pop().copy(bPos).sub(aPos);
        var projectedOffset = offsetV.dot(axis);
    
        flattenPointsOn(aPoints, axis, rangeA);
        flattenPointsOn(bPoints, axis, rangeB);
    
        rangeB[0] += projectedOffset;
        rangeB[1] += projectedOffset;
    
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
            this.temps.T_VECTORS.push(offsetV);
            this.temps.T_ARRAYS.push(rangeA);
            this.temps.T_ARRAYS.push(rangeB);
            return true;
        }
    
        if (response) {
          var overlap = 0;
    
          if (rangeA[0] < rangeB[0]) {
            response.aInB = false;
    
            if (rangeA[1] < rangeB[1]) {
              overlap = rangeA[1] - rangeB[0];
              response.bInA = false;
    
            } else {
              var option1 = rangeA[1] - rangeB[0];
              var option2 = rangeB[1] - rangeA[0];
              overlap = option1 < option2 ? option1 : -option2;
            }
    
          } else {
            response.bInA = false;
    
            if (rangeA[1] > rangeB[1]) {
              overlap = rangeA[0] - rangeB[1];
              response.aInB = false;
    
            } else {
              var option1 = rangeA[1] - rangeB[0];
              var option2 = rangeB[1] - rangeA[0];
              overlap = option1 < option2 ? option1 : -option2;
            }
          }
    
          var absOverlap = Math.abs(overlap);
          if (absOverlap < response.overlap) {
            response.overlap = absOverlap;
            response.overlapN.copy(axis);
            if (overlap < 0) {
              response.overlapN.reverse();
            }
          }
        }
        this.temps.T_VECTORS.push(offsetV);
        this.temps.T_ARRAYS.push(rangeA);
        this.temps.T_ARRAYS.push(rangeB);
        return false;
    }


    /**
     * @param {Vector} line The line segment.
     * @param {Vector} point The point.
     * @return  {number} LEFT_VORONOI_REGION (-1) if it is the left region,
     *          MIDDLE_VORONOI_REGION (0) if it is the middle region,
     *          RIGHT_VORONOI_REGION (1) if it is the right region.
    */
    voronoiRegion(line, point){
        var len2 = line.len2();
        var dp = point.dot(line);

        /**
         * @const
         */
        var LEFT_VORONOI_REGION = -1;
        /**
         * @const
         */
        var MIDDLE_VORONOI_REGION = 0;
        /**
         * @const
         */
        var RIGHT_VORONOI_REGION = 1;

        if (dp < 0) { return LEFT_VORONOI_REGION; }
        else if (dp > len2) { return RIGHT_VORONOI_REGION; }
        else { return MIDDLE_VORONOI_REGION; }
    }
}