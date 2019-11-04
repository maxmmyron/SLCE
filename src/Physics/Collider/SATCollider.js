import Temps from "../../util/Temps.js";

export default class SATCollider{
    constructor(){
        this.temps = new Temps();
    }

    pointInCircle(p, c){
        var differenceV = this.temps.T_VECTORS.pop().copy().sub(c.pos);
        var radiusSq = c.radius ** 2;
        var distanceSq = differenceV.len2();

        this.temps.T_VECTORS.push(differenceV);

        return distanceSq <= radiusSq;
    }

    pointInPolygon(p, poly){
        this.temps.TEST_POINT.pos.copy(p);
        this.temps.T_RESPONSE.clear();

        var result = this.testPolygonPolygon(this.temps.TEST_POINT, poly, this.temps.T_RESPONSE);
        if(result) result = this.temps.T_RESPONSE.aInB;

        return result;
    }

    testCircleCircle(a, b, response){
        var differenceV = this.temps.T_VECTORS.pop().copy(b.pos).sub(a.pos);
        var totalRadius = a.radius + b.radius;
        var totalRadiusSq = totalRadius * totalRadius;
        var distanceSq = differenceV.len2();

        if(distanceSq > totalRadiusSq){
            this.temps.T_VECTORS.push(differenceV);
            return false;
        }

        if(response){
            var dist = Math.sqrt(distanceSq);
            response.a = a;
            response.b = b;
            response.overlap = totalRadius - dist;
            response.overlapN.copy(differenceV.normalize());
            response.overlapV.copy(differenceV).scale(response.overlap);
            response.aInB = a.radius <= b.radius && dist <= b.radius - a.radius;
            response.bInA = b.radius <= a.radius && dist <= a.radius - b.radius;
        }

        this.temps.T_VECTORS.push(differenceV);
        return true;
    }

    testPolygonCircle(polygon, circle, response){
        var circlePos = this.temps.T_VECTORS.pop().copy(circle.pos).sub(polygon.pos);
        var radius = circle.radius;
        var radius2 = radius * radius;
        var points = polygon.calcPoints;
        var len = points.length;
        var edge = this.temps.T_VECTORS.pop();
        var point = this.temps.T_VECTORS.pop();

        for (var i = 0; i < len; i++) {
            var next = i === len - 1 ? 0 : i + 1;
            var prev = i === 0 ? len - 1 : i - 1;
            var overlap = 0;
            var overlapN = null;

            edge.copy(polygon.edges[i]);

            point.copy(circlePos).sub(points[i]);

            if (response && point.len2() > radius2) {
                response.aInB = false;
            }

            var region = voronoiRegion(edge, point);
            if (region === LEFT_VORONOI_REGION) {
                edge.copy(polygon.edges[prev]);

                var point2 = this.temps.T_VECTORS.pop().copy(circlePos).sub(points[prev]);
                region = voronoiRegion(edge, point2);
                if (region === RIGHT_VORONOI_REGION) {
                    var dist = point.len();
                    if (dist > radius) {
                        this.temps.T_VECTORS.push(circlePos);
                        this.temps.T_VECTORS.push(edge);
                        this.temps.T_VECTORS.push(point);
                        this.temps.T_VECTORS.push(point2);
                        return false;
                    } else if (response) {
                        response.bInA = false;
                        overlapN = point.normalize();
                        overlap = radius - dist;
                    }
                }
                this.temps.T_VECTORS.push(point2);
            } else if (region === RIGHT_VORONOI_REGION) {
                edge.copy(polygon.edges[next]);
                
                        point.copy(circlePos).sub(points[next]);
                        region = voronoiRegion(edge, point);
                        if (region === LEFT_VORONOI_REGION) {
                
                          var dist = point.len();
                          if (dist > radius) {
                
                            this.temps.T_VECTORS.push(circlePos);
                            this.temps.T_VECTORS.push(edge);
                            this.temps.T_VECTORS.push(point);
                            return false;
                          } else if (response) {
                
                            response.bInA = false;
                            overlapN = point.normalize();
                            overlap = radius - dist;
                          }
                        }
            } else {
                var normal = edge.perp().normalize();
                
                var dist = point.dot(normal);
                var distAbs = Math.abs(dist);
        
                if (dist > 0 && distAbs > radius) {
        
                    this.temps.T_VECTORS.push(circlePos);
                    this.temps.T_VECTORS.push(normal);
                    this.temps.T_VECTORS.push(point);
                    return false;
                } else if (response) {
        
                    overlapN = normal;
                    overlap = radius - dist;
        
                    if (dist >= 0 || overlap < 2 * radius) {
                    response.bInA = false;
                    }
                }
            }
            if (overlapN && response && Math.abs(overlap) < Math.abs(response.overlap)) {
                response.overlap = overlap;
                response.overlapN.copy(overlapN);
            }
        }
        if (response) {
            response.a = polygon;
            response.b = circle;
            response.overlapV.copy(response.overlapN).scale(response.overlap);
          }
          this.temps.T_VECTORS.push(circlePos);
          this.temps.T_VECTORS.push(edge);
          this.temps.T_VECTORS.push(point);
          return true;
    }

    testCirclePolygon(circle, polygon, response){
        var result = testPolygonCircle(polygon, circle, response);
        if (result && response) {
            var a = response.a;
            var aInB = response.aInB;
            response.overlapN.reverse();
            response.overlapV.reverse();
            response.a = response.b;
            response.b = a;
            response.aInB = response.bInA;
            response.bInA = aInB;
        }
        return result;
    }

    testPolygonPolygon(a, b, response){
        var aPoints = a.calcPoints;
        var aLength = aPoints.length;
        var bPoints = b.calcPoints;
        var bLength = bPoints.length;

        for(var i = 0; i<aLength; i++){
            if (isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, a.normals[i], response)) {
                return false;
            }
        }

        for(i = 0; i<bLength; i++){
            if (isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, b.normals[i], response)) {
                return false;
            }
        }

        if (response) {
            response.a = a;
            response.b = b;
            response.overlapV.copy(response.overlapN).scale(response.overlap);
          }
          return true;

    }
}