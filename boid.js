class Boid {
    acceleration;
    velocity;
    position;
    target;
    have_target;
    r;
    maxspeed;
    maxforce;
    color;

    //flock variables
    separation;
    neighbordist;

    separationForce;
    alignForce;
    cohesionForce;

    //electric charge variables
    vecino_cercano = [];
    t_descarga;
    t_next;
    eleccion_vecino;
    n_vecinos;

    cambioTam;
    cambioCol;
    useFlocking;

    //size
    t_ini;
    //color
    t_ini2;

    constructor(x, y, target, tam) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1),random(-1, 1));
        this.position = createVector(x,y);
        this.r = tam;
        this.maxspeed = 3;
        this.maxforce = 0.05;
        this.target = createVector(target.x, target.y);
        if (this.target != null)
          this.have_target = true;
        else
          this.have_target = false;

        this.separation = 10;
        this.neighbordist = 50;
        this.separationForce = 1.0;
        this.alignForce = 1.0;
        this.cohesionForce = 1.0;

        this.electrocutable = true;
        this.descargado = false;

        this.t_descarga = 2 * 60;

        // the time of passing electricity is chosen by the user
        this.t_next = 60 * 0.2;
        // Whether the next neighbor is close or far is chosen by the user
        this.eleccion_vecino = 1;

        this.n_vecinos = 1;

        this.cambioTam = true;
        this.cambioCol = true;
        this.color = 200;
        this.useFlocking = true;

        this.t_ini = (int)(Math.random() * 180);
        this.t_ini2 = (int)(Math.random() * 120);
    }

    run(boids) {
        //this.flock(boids);
        if (this.have_target)
          this.applyForce(this.arrive());
        
        this.update();

        this.updateElectric(boids);

        if (this.useFlocking)
          this.flock(boids);

        this.border();
        this.render();
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    updateElectric(boids) {
      // REDUCE DISCHARGE TIME
      if (this.t_descarga > 0)
        this.t_descarga--;

      // checks if enough time has passed to download on the next
      if (frameCount % this.t_next == 0) { 
        for(i = 0; i < this.vecino_cercano.length; i++){
          console.log(this.vecino_cercano.length);
          if (this.vecino_cercano[i] != null)
          {
              // generates lightning
              strokeWeight(1);
              stroke(255,255,200);
              line(this.position.x, this.position.y, this.vecino_cercano[i].position.x, this.vecino_cercano[i].position.y);
              
              // electrocutes the neighbor
              this.vecino_cercano[i].electrocute(this.position, boids);
              this.t_descarga = 60 * 2;
              this.vecino_cercano[i] = null;
          }
        }
        this.vecino_cercano = [];
      }
    }

    // update function
    update() {
        // Refresh speed
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);

        this.position.add(this.velocity);
        // Reset acceleration to 0 in each cycle
        this.acceleration.mult(0);
    }

    seek() {
        let desired = p5.Vector.sub(this.target, this.position);  // A vector pointing from the location towards the target
        // Normalize desired and scale according to maximum speed
        
        desired.normalize();
        desired.mult(this.maxspeed);

        // Steer = Desired - Speed
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);  // Limits maximum steering force
        return steer;
    }

    flee(target) {
        let desired = p5.Vector.sub(this.position, target);  // A vector pointing from the location towards the target
        // Normalize desired and scale according to maximum speed
        if (desired.mag() > 100)
            return;

        desired.normalize();
        desired.mult(this.maxspeed*2);

        
        this.velocity = desired;
    }

    arrive() {
        let desired = p5.Vector.sub(this.target,this.position);

        var d = desired.mag();
        desired.normalize();

        if (d < 100) {
        var m = map(d,0,100,0,this.maxspeed);
        desired.mult(m);
        //[end]
        } else {
        // Otherwise, proceed at maximum speed.
        desired.mult(this.maxspeed);
        }

        // The usual steering = desired - velocity
        let steer = p5.Vector.sub(desired,this.velocity);
        steer.limit(this.maxforce);

        return steer;
    }

    render() {

      stroke(255,255,255);
      //stroke(this.color, this.color, this.color)
      strokeWeight((this.t_descarga/60)*2);

      fill(0,0,this.color);
      circle(this.position.x, this.position.y, this.r);
       
      
       // variant size
      if(this.cambioTam){
        this.r = ((6 * Math.sin(Math.PI * (((this.t_ini++)%180)/180)))+4);
      }

      if(this.cambioCol){
        this.color = ((200 * Math.sin(Math.PI * (((this.t_ini2++)%180)/180)))+55);
      }
    }

    // border
    border(){
        if (this.position.x < -this.r)  this.position.x = width +this.r;
        if (this.position.y < -this.r)  this.position.y = height+this.r;
        if (this.position.x > width + this.r) this.position.x = -this.r;
        if (this.position.y > height+ this.r) this.position.y = -this.r;
    }

    // flock management
    flock(boids) {
        let sep = this.separate(boids);   // Separation
        let ali = this.align(boids);      // Alignment
        let coh = this.cohesion(boids);   // Cohesion
        // Give an arbitrary weight to each force
        sep.mult(this.separationForce);
        ali.mult(this.alignForce);
        coh.mult(this.cohesionForce);
        // Add the force vectors to the acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        // For each boid in the system, check if it is too close
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position, boids[i].position);
          // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
          if ((d > 0) && (d < this.separation)) {
            // Calculate the vector pointing away from the neighbor
            let diff = p5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d);        // Weight per distance
            steer.add(diff);
            count++;            // Maintain quantity record
          }
        }
        // Average -- divide by the amount
        if (count > 0) {
          steer.div(count);
        }
      
        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
          // Implements Reynolds: Steer = Desired - Speed
          steer.normalize();
          steer.mult(this.maxspeed);
          steer.sub(this.velocity);
          steer.limit(this.maxforce);
        }
        return steer;
    }

    align(boids) {
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < this.neighbordist)) {
            sum.add(boids[i].velocity);
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          sum.normalize();
          sum.mult(this.maxspeed);
          let steer = p5.Vector.sub(sum, this.velocity);
          steer.limit(this.maxforce);
          return steer;
        } else {
          return createVector(0, 0);
        }
    }

    cohesion(boids) {
        let sum = createVector(0, 0);   // Start with an empty vector to accumulate all positions
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < this.neighbordist)) {
            sum.add(boids[i].position); // Add position
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          return this.seek(sum);  // Steer to position
        } else {
          return createVector(0, 0);
        }
    }

    // electrocution function where it destabilizes the closest non-electrocuted particle
    electrocute(pos, boids){
      // Gets displaced in the opposite direction to the particle that electrocuted him.
      let desired = p5.Vector.sub(this.position, pos);
      this.applyForce(desired);

      for (var k = 0; k < this.n_vecinos; k++){
        // the next neighbor has to be nearby
        if (this.eleccion_vecino == 1) {
          let distancia_vecino = Infinity;
          for (let i = 0; i < boids.length; i++) {
              let d = p5.Vector.dist(this.position,boids[i].position);
              if (d == 0)
                continue;
              
              var check = true;
              for(var cont = 0; cont < this.vecino_cercano.length; cont++){
                check = (boids[i] == this.vecino_cercano[cont])? false : true;
                if (!check)
                  break;
              }
              
              if (d < distancia_vecino && boids[i].t_descarga <= 0 && check) {
                  distancia_vecino = d;
                  this.vecino_cercano[k] = boids[i];
              }
          }
        }
        // the next neighbor has to be far away
        else if (this.eleccion_vecino == 2) {
          let distancia_vecino = 0;
          for (let i = 0; i < boids.length; i++) {
              let d = p5.Vector.dist(this.position,boids[i].position);

              var check = true;
              for(var cont = 0; cont < this.vecino_cercano.length; cont++){
                check = (boids[i] == this.vecino_cercano[cont])? false : true;
                if (!check)
                  break;
              }

              if (d > distancia_vecino && boids[i].t_descarga <= 0 && check) {
                  distancia_vecino = d;
                  this.vecino_cercano[k] = boids[i];
              }
          }
        }
        // the next neighbor has to be random
        else {
          var check = false, br = 0;
          var boid;
          while(!check){
            boid = boids[(int)(Math.random()*boids.length)];
            check = true;
            for(var cont = 0; cont < this.vecino_cercano.length; cont++){
              check = (boid == this.vecino_cercano[cont])? false : true;
              if (!check)
                  break;
            }
            if (boid.t_descarga > 0){
              check = false;
            }
            br++;

            if (br > 5){
              break;
            }
          }
          if (br > 5)
            break;
          
          this.vecino_cercano[k] = boid;
        }
        
          
      }

    }

    // function change destination by random boid
    change(boid) {
        let pos_aux; 
        pos_aux = this.target;

        this.target = boid.target;
        boid.target = pos_aux;
    }

    // parameter update functions
    newT(t_next){
      this.t_next = 60 * t_next;
    }

    newV(vecino){
      this.eleccion_vecino = vecino;
    }


}