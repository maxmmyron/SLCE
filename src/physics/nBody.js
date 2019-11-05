export default class nBody {
    constructor(g, dt, softeningConstant, masses) {
        this.g = g;
        this.dt = dt;
        this.softeningConstant = softeningConstant;
    
        this.masses = masses || [];
    }

    runUpdates(){
        this.masses.forEach(mass => {
            if(mass.radius){
                this.updatePositionVectors();
                this.updateVelocityVectors();
                this.updateAccelerationVectors();
            }         
        });
    }

    updatePositionVectors() {
        const massesLen = this.masses.length;
  
      for (let i = 0; i < massesLen; i++) {
        const massI = this.masses[i];
        massI.pos.x += massI.vel.x * this.dt;
        massI.pos.y += massI.vel.y * this.dt;
      }

      return this;
    }
    updateVelocityVectors() {
        const massesLen = this.masses.length;
  
      for (let i = 0; i < massesLen; i++) {
        const massI = this.masses[i];
  
        massI.vel.x += massI.ax * this.dt;
        massI.vel.y += massI.ay * this.dt;
      }
    }
    updateAccelerationVectors() {
        const massesLen = this.masses.length;
    
        for (let i = 0; i < massesLen; i++) {
          let ax = 0;
          let ay = 0;
    
          const massI = this.masses[i];
    
          for (let j = 0; j < massesLen; j++) {
            if (i !== j) {
              const massJ = this.masses[j];
    
              const dx = massJ.pos.x - massI.pos.x;
              const dy = massJ.pos.y - massI.pos.y;
    
              const distSq = dx * dx + dy * dy;
    
              const f = (this.g * (massJ.mass / 100)) / (distSq * Math.sqrt(distSq + this.softeningConstant));
    
              ax += dx * f;
              ay += dy * f;
            }
          }
    
          massI.ax = ax;
          massI.ay = ay;
        }
    
        return this;
      }
  }