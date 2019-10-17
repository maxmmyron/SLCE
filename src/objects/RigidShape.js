export default class RigidShape{
    constructor(points, x, y, fill, useOutline, outline){

        this.points = points.map(function(el){
            return {x: el[0], y: el[1]};
        });

        this.x = x || 0;
        this.y = y || 0;

        this.constraints = {
            maxSpeed: 5,
            friction: 0.5  
        };

        this.color = fill ||  "rgba(0,0,0,1)";
        this.useOutline = useOutline || true;
        this.outline = outline || "rbga(0,0,0,0)";

        this.getNormals();
        this.getMedians();
    }

    getNormals() {
        var p = this.points,
            n = p.length,
            crt, nxt, l, x1, y1;
    
        this.normals = [];
        for (var i = 0; i < n; i++) {
            crt = p[i];
            nxt = p[i + 1] || p[0];
            x1 = (nxt.y - crt.y);
            y1 = -(nxt.x - crt.x);
            l = Math.sqrt(x1 * x1 + y1 * y1);
            this.normals[i] = {x: x1 / l, y: y1 / l};
            this.normals[n + i] = {x: - x1 / l, y: - y1 / l};
        }
    }

    getMedians() {
        var p = this.points,
            crt, nxt;
    
        this.medians = [];
    
        for (var i = 0; i < p.length; i++) {
            crt = p[i];
            nxt = p[i + 1] || p[0];
            this.medians.push({x: (crt.x + nxt.x) / 2, y: (crt.y + nxt.y) / 2});
        }
    }

    draw(ctx){
        var p = this.points;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgba(0,0,0,0)';

        ctx.translate(this.x, this.y);
        p.forEach(function (point, i) {
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
            } else if (i === (p.length - 1)) {
                ctx.lineTo(point.x, point.y);
                ctx.lineTo(p[0].x, p[0].y);
                ctx.stroke();
                ctx.fill();
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
        ctx.restore();
    }

    update(delta){
        if(!delta) return;
    }

    drawNormals(ctx) {
        var m = this.medians,
            n = this.normals,
            size = 15,
            med;
    
        ctx.save();
    
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#003300";
        ctx.fillStyle = "green";
    
        ctx.translate(this.x, this.y);
    
        m.forEach(function (point) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        });
    
        ctx.fillStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#003300";
    
        n.forEach(function (point, i) {
            ctx.beginPath();
            med = m[i % m.length];
            ctx.moveTo(med.x, med.y);
            ctx.lineTo(med.x + point.x * size, med.y + point.y * size);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        });
    
        ctx.restore();
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }

    checkCollisionm(shape) {
        var me = this,
            p1, p2;
    
        return me.normals.concat(shape.normals).every(function (v) {
            p1 = me.project(v);
            p2 = shape.project(v);
            return (((p1.min <= p2.max) && (p1.max >= p2.min)) ||
            (p2.min >= p1.max) && (p2.max >= p1.min));
        });
    }

    project(vector) {
        var me = this,
            p = this.points,
            min = Infinity, max = -Infinity,
            x, y, proj;
    
        p.forEach(function (p) {
            x = me.x + p.x;
            y = me.y + p.y;
            proj = (x * vector.x + y * vector.y);
            min = proj < min ? proj : min;
            max = proj > max ? proj : max;
        });
    
        return {min: min, max: max};
    }
}