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

    //variables de carga electrica
    vecino_cercano = [];
    t_descarga;
    t_next;
    eleccion_vecino;
    n_vecinos;

    cambioTam;
    cambioCol;
    useFlocking;

    //tamaño
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

        // el tiempo de pasar la electricidad lo elige el usuario
        this.t_next = 60 * 0.2;
        // si el siguiente vecino esta cerca o lejos lo elije el usuario
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
      // REDUCE EL TIEMPO DE DESCARGA
      if (this.t_descarga > 0)
        this.t_descarga--;

      // comprueba si ha pasado el suficiente tiempo como para descargar sobre el siguiente
      if (frameCount % this.t_next == 0) { 
        for(i = 0; i < this.vecino_cercano.length; i++){
          console.log(this.vecino_cercano.length);
          if (this.vecino_cercano[i] != null)
          {
              // genera el rayo
              strokeWeight(1);
              stroke(255,255,200);
              line(this.position.x, this.position.y, this.vecino_cercano[i].position.x, this.vecino_cercano[i].position.y);
              
              // electrocuta al vecino
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
        // Refrescar velocidad
        this.velocity.add(this.acceleration);
        // Limitar velocidad
        this.velocity.limit(this.maxspeed);

        this.position.add(this.velocity);
        // Resetear acceleración a 0 en cada ciclo
        this.acceleration.mult(0);
    }

    seek() {
        let desired = p5.Vector.sub(this.target, this.position);  // Un vector apuntando desde la ubicación hacia el objetivo
        // Normalizar deseado y escalar según velocidad máxima
        
        desired.normalize();
        desired.mult(this.maxspeed);

        // Viraje = Deseado - Velocidad
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);  // Limita al máximo de fuerza de viraje
        return steer;
    }

    flee(target) {
        let desired = p5.Vector.sub(this.position, target);  // Un vector apuntando desde la ubicación hacia el objetivo
        // Normalizar deseado y escalar según velocidad máxima
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
       
      
       // tamaño variante
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
        let sep = this.separate(boids);   // Separación
        let ali = this.align(boids);      // Alineamiento
        let coh = this.cohesion(boids);   // Cohesión
        // Dar un peso arbitrario a cada fuerza
        sep.mult(this.separationForce);
        ali.mult(this.alignForce);
        coh.mult(this.cohesionForce);
        // Suma los vectores de fuerza a la aceleración
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    separate(boids) {
        let steer = createVector(0, 0);
        let count = 0;
        // Por cada boid en el sistema, revisa si está muy cerca
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position, boids[i].position);
          // Si la distancia es mayor a 0 y menor que una cantidad arbitraria (0 cuando eres tú mismo)
          if ((d > 0) && (d < this.separation)) {
            // Calcular el vector apuntando a alejarse del vecino
            let diff = p5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d);        // Peso por distancia
            steer.add(diff);
            count++;            // Mantener registro de cantidad
          }
        }
        // Promedio -- divide por la cantidad
        if (count > 0) {
          steer.div(count);
        }
      
        // Mientras el vector sea mayor a 0
        if (steer.mag() > 0) {
          // Implementa Reynolds: Viraje = Deseado - Velocidad
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
        let sum = createVector(0, 0);   // Empieza con un vector vacío para acumular todas las posiciones
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
          let d = p5.Vector.dist(this.position,boids[i].position);
          if ((d > 0) && (d < this.neighbordist)) {
            sum.add(boids[i].position); // Añada posición
            count++;
          }
        }
        if (count > 0) {
          sum.div(count);
          return this.seek(sum);  // Vira hacia la posición
        } else {
          return createVector(0, 0);
        }
    }

    // funcion electrocucion donde desestabiliza a la particula mas cercana no electrocutada
    electrocute(pos, boids){
      // sale disparado en direccion contraria a la particula que le electrocuto
      let desired = p5.Vector.sub(this.position, pos);
      this.applyForce(desired);

      for (var k = 0; k < this.n_vecinos; k++){
        // el siguiente vecino tiene que estar cerca
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
        // el siguiente vecino tiene que estar lejos
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
        // el siguiente vecino tiene que ser aleatorio
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

    // funcion cambiar destino por boid aleatorio
    change(boid) {
        let pos_aux; 
        pos_aux = this.target;

        this.target = boid.target;
        boid.target = pos_aux;
    }

    // funciones de updatear parametros
    newT(t_next){
      this.t_next = 60 * t_next;
    }

    newV(vecino){
      this.eleccion_vecino = vecino;
    }


}