import Temps from "../../util/Temps.js";
import Helper from "../../util/Helper.js";

/**
 * @deprecated
 */

export default class SATCollider{
    constructor(temps){
        this.temps = temps;
        this.helper = new Helper(temps);
    }

    runUpdates(args){
        let a = args[0];
        let b = args[1];
        
        console.log(a.calcPoints, b.calcPoints);
        console.log(this.polyPoly(a.calcPoints, b.calcPoints));
        /*let response = args[2] || null;
        if(a.getType() == "point"){
            if(b.getType() == "circle") console.log(this.pointInCircle(a, b));
            if(b.getType() == "polygon") console.log(this.pointInPolygon(a, b));
        }
        if(a.getType() == "circle"){
            if(b.getType() == "circle") console.log(this.testCircleCircle(a, b, response));
            if(b.getType() == "polygon") console.log(this.testCirclePolygon(a, b, response));
        }
        if(a.getType() == "polygon"){
            if(b.getType() == "circle") console.log(this.testPolygonCircle(a, b, response));
            if(b.getType() == "polygon") console.log(this.testPolygonPolygon(a, b, response));
        }*/
    }

    /**
     * 
     * @param {Array} p1 - array of vertexes
     * @param {Array} p2 - array of vertexes
     */
    polyPoly(p1, p2) {

        // go through each of the vertices, plus the next
        // vertex in the list
        var next = 0;
        for (var current=0; current<p1.length; current++) {
      
          // get next vertex in list
          // if we've hit the end, wrap around to 0
          next = current+1;
          if (next == p1.length) next = 0;
      
          // get the PVectors at our current position
          // this makes our if statement a little cleaner
          var vc = p1[current];    // c for "current"
          var vn = p1[next];       // n for "next"
      
          // now we can use these two points (a line) to compare
          // to the other polygon's vertices using polyLine()
          let collision = this.polyLine(p2, vc.x,vc.y,vn.x,vn.y);
          if (collision) return true;
      
          // optional: check if the 2nd polygon is INSIDE the first
          collision = this.polyPoint(p1, p2[0].x, p2[0].y);
          if (collision) return true;
        }
      
        return false;
      }

      polyLine(vertices, x1, y1, x2, y2) {

        // go through each of the vertices, plus the next
        // vertex in the list
        var next = 0;
        for (var current=0; current<vertices.length; current++) {
      
          // get next vertex in list
          // if we've hit the end, wrap around to 0
          next = current+1;
          if (next == vertices.length) next = 0;
      
          // get the PVectors at our current position
          // extract X/Y coordinates from each
          var x3 = vertices[current].x;
          var y3 = vertices[current].y;
          var x4 = vertices[next].x;
          var y4 = vertices[next].y;
      
          // do a Line/Line comparison
          // if true, return 'true' immediately and
          // stop testing (faster)
          let hit = this.lineLine(x1, y1, x2, y2, x3, y3, x4, y4);
          if (hit) {
            return true;
          }
        }
      
        // never got a hit
        return false;
      }


      // LINE/LINE
    lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

    // calculate the direction of the lines
    var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  
    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      return true;
    }
    return false;
  }
  
  
  // POLYGON/POINT
  // used only to check if the second polygon is
  // INSIDE the first
  polyPoint(vertices, px, py) {
    var collision = false;
  
    // go through each of the vertices, plus the next
    // vertex in the list
    var next = 0;
    for (var current=0; current<vertices.length; current++) {
  
      // get next vertex in list
      // if we've hit the end, wrap around to 0
      next = current+1;
      if (next == vertices.length) next = 0;
  
      // get the PVectors at our current position
      // this makes our if statement a little cleaner
      var vc = vertices[current];    // c for "current"
      var vn = vertices[next];       // n for "next"
  
      // compare position, flip 'collision' variable
      // back and forth
      if (((vc.y > py && vn.y < py) || (vc.y < py && vn.y > py)) &&
           (px < (vn.x-vc.x)*(py-vc.y) / (vn.y-vc.y)+vc.x)) {
              collision = !collision;
      }
    }
    return collision;
  }

    collide(p1,p2){
        for(var i in p1.points) {
            for(var j in p2.points) {
              var t = this.intersect(p1.s[i],p2.s[j]);
              if(t === 'collinear') {continue;}
              if(t[0] <= 1 && t[0] >= 0 && t[1] <= 1 && t[1] >= 0) {
                return true;
              }
            }
          }
          return false;
    }

    intersect(s1,s2) {
        if(((s2[1].x - s2[0].x)*(s1[0].y - s1[1].y) - (s1[0].x - s1[1].x)*(s2[1].y - s2[0].y)) === 0) {
          return 'collinear';
        }
        var tA =  ((s2[0].y - s2[1].y)*(s1[0].x - s2[0].x) + (s2[1].x - s2[0].x)*(s1[0].y - s2[0].y))/
                  ((s2[1].x - s2[0].x)*(s1[0].y - s1[1].y) - (s1[0].x - s1[1].x)*(s2[1].y - s2[0].y)),
            tB =  ((s1[0].y - s1[1].y)*(s1[0].x - s2[0].x) + (s1[1].x - s1[0].x)*(s1[0].y - s2[0].y))/
                  ((s2[1].x - s2[0].x)*(s1[0].y - s1[1].y) - (s1[0].x - s1[1].x)*(s2[1].y - s2[0].y));
        return [tA, tB];
      }

    /*pointInCircle(p, c){
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

        for(var i = 0; i < aLength; i++){
            if (this.helper.isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, a.normals[i], response)) {
                return false;
            }
        }

        resp = [];
        for(i = 0; i < bLength; i++){
            if (this.helper.isSeparatingAxis(a.pos, b.pos, aPoints, bPoints, b.normals[i], response)) {
                return false;
            }
        }

        if (response) {
            response.a = a;
            response.b = b;
            response.overlapV.copy(response.overlapN).scale(response.overlap);
        }
        return true;
    }*/
}