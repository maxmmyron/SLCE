export default class nBody {
    constructor(g, dt, softeningConstant, masses) {
      this.g = g;
      this.dt = dt;
      this.softeningConstant = softeningConstant;
  
      this.masses = masses;
    }

    updatePositionVectors() {
        const massesLen = this.masses.length;
  
      for (let i = 0; i < massesLen; i++) {
        const massI = this.masses[i];

        massI.x += massI.vel.x * this.dt;
        massI.y += massI.vel.y * this.dt;
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
    
              const dx = massJ.x - massI.x;
              const dy = massJ.y - massI.y;
    
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