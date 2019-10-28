/**
 * This is currently unused. Eventually, it will house the code for object collision, and possible object collision response. I still need a good SAT-based object collision response. :/
 * 
 */
export default class objectCollision{
    constructor(){
        this.ctx = document.getElementById('gameCanvas').getContext('2d');
    }

    circleCollision(b1, b2){
        let dx = b2.x - b1.x;
        let dy = b2.y - b1.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(b1.radius + b2.radius >= dist){
                //normalize vectors between two circles
                const nx = dx / dist;
                const ny = dy / dist;

                //move each circle away from one another
                const touchDistFromB1 = (dist * (b1.radius / (b1.radius + b2.radius)));       
                const contactX = b1.x + nx * touchDistFromB1;
                const contactY = b1.y + ny * touchDistFromB1;

                // now move each ball so that they just touch
                // move b1 back
                b1.x = contactX - nx * b1.radius;
                b1.y = contactY - ny * b1.radius;

                // and b2 in the other direction
                b2.x = contactX + nx * b2.radius;
                b2.y = contactY + ny * b2.radius;

            /*
                COLLISION RESPONSE
            */

             // get the direction and velocity of each ball
            const v1 = Math.sqrt(b1.vel.x * b1.vel.x + b1.vel.y * b1.vel.y);
            const v2 = Math.sqrt(b2.vel.x * b2.vel.x + b2.vel.y * b2.vel.y);

            // get the direction of travel of each ball
            const dir1 = Math.atan2(b1.vel.y, b1.vel.x);
            const dir2 = Math.atan2(b2.vel.y, b2.vel.x);

            // get the direction from ball1 center to ball2 cenet
            const directOfContact = Math.atan2(ny, nx);

            this.elastic2DCollision(b1, b2, v1, v2, dir1, dir2, directOfContact, b1.mass, b2.mass);


        }
    }

    elastic2DCollision(obj1, obj2, v1, v2, d1, d2, cDir, m1, m2) {
        const massDiff = m1 - m2;
        const massSum = m1 + m2;
        const v1s = v1 * Math.sin(d1 - cDir);

        const cp = Math.cos(cDir);
        const sp = Math.sin(cDir);
        var cdp1 = v1 * Math.cos(d1 - cDir);
        var cdp2 = v2 * Math.cos(d2 - cDir);
        const cpp = Math.cos(cDir + Math.PI / 2)
        const spp = Math.sin(cDir + Math.PI / 2)

        var t = (cdp1 * massDiff + 2 * m2 * cdp2) / massSum;
        obj1.vel.x = t * cp + v1s * cpp;
        obj1.vel.y = t * sp + v1s * spp;
        cDir += Math.PI;
        const v2s = v2 * Math.sin(d2 - cDir);    
        cdp1 = v1 * Math.cos(d1 - cDir);
        cdp2 = v2 * Math.cos(d2 - cDir);    
        t = (cdp2 * -massDiff + 2 * m1 * cdp1) / massSum;
        obj2.vel.x = t * -cp + v2s * -cpp;
        obj2.vel.y = t * -sp + v2s * -spp;

        if(isNaN(obj1.vel.x) || isNaN(obj1.vel.y) || isNaN(obj2.vel.x) || isNaN(obj2.vel.y)){
            console.log({
                t,
                cdp1,
                massDiff,
                m2,
                cdp2, 
                massSum
            });
            
            console.log({
                massDiff,
                massSum,
                v1s,
                cp, sp, cdp1, cdp2, cpp, spp,
                t,
                "obj1x vel": obj1.vel.x,
                "obj1y vel": obj1.vel.y,
                cDir,
                v2s,
                "obj2x vel": obj2.vel.x,
                "obj2y vel": obj2.vel.y
            });
            throw "NaNError";
        }
        
    }
}