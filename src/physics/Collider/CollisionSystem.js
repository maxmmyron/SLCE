export default class Collider{
    constructor(){

    }

    runUpdates(args){
        let p1 = args[0], p2 = args[1];
        this.collide(p1,p2);
    }

    collide(p1,p2) {
      for(var i in p1.sides) {
        for(var j in p2.sides) {
          var t = this.intersect(p1.sides[i], p2.sides[j]);
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
}