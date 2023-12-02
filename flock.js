class Flock {
    boids;
    next_point;
    puntos;
    // variable change of objective for the one next to it
    rotation;
    t_rotation;

    constructor() {
        this.boids = [];
        this.next_point = -1;
        this.rotation = true;
        this.t_rotation = 60 * 0.5;
    }

    run() {
        this.boids.forEach(e => e.run(this.boids));

        if (this.rotation && frameCount % this.t_rotation == 0 && this.boids != null){
            this.rotateBoids();
        }
    }

    addBoid(b) {
        this.boids.push(b);
    }

    mousefear(click) {
        this.boids.forEach(e => e.flee(click));
    }

    changeBoids() {
        //console.log(this.boids[(int)(Math.random()*this.boids.length)]);
        this.boids.forEach(e => e.change(this.boids[(int)(Math.random()*this.boids.length)]));
    }

    electrocuteBoid(click) {
        let boid;

        this.boids.forEach(e => (e.descargado = false));

        let distancia = Infinity;
        for (let i = 0; i < this.boids.length; i++) {
            let d = p5.Vector.dist(click,this.boids[i].position);
            if (d < distancia && this.boids[i].t_descarga <= 0) {
                distancia = d;
                boid = this.boids[i];
            }
        }

        boid.electrocute(click, this.boids);
    }

    changeTNext() {
        t_next = document.getElementById("t_next").value;

        this.boids.forEach(e => e.newT(t_next));
    }

    changeVecino() {
        vecino = document.getElementById("vecino").value;

        this.boids.forEach(e => e.newV(vecino));
    }

    stopCharge() {
        this.boids.forEach(e => e.t_descarga = 2*60);
    }

    newPhrase() {
        var texto = document.getElementById("texto").value;

        this.puntos = font.textToPoints(texto, 100, 200);

        if(this.puntos.length > this.boids.length){
            i = 0;
            for (; i < this.boids.length; i++){
                this.boids[i].target = createVector(this.puntos[i].x, this.puntos[i].y);
                this.boids[i].have_target = true;
                this.boids[i].sep = 1;
            }
            this.next_point = i;
        } else {
            i = 0;
            for (; i < this.puntos.length; i++){
                this.boids[i].target = createVector(this.puntos[i].x, this.puntos[i].y);
                this.boids[i].have_target = true;
                this.boids[i].sep = 1;
            }
            this.next_point = -1;
            for (; i < this.boids.length; i++){
                this.boids[i].target = this.boids[i].position;
                this.boids[i].have_target = false;
                this.boids[i].sep = 1.5;
            }
        }   
    }

    newBoid() { 
        boid;

        if (this.next_point < 0 || this.next_point > this.puntos.length-1){
            boid = new Boid(mouseX,mouseY,createVector(mouseX, mouseY), Math.random()*5);
            boid.have_target = false;
        }
        else{
            boid = new Boid(mouseX,mouseY,this.puntos[this.next_point], Math.random()*5);
            this.next_point++;
        }

        this.addBoid(boid);
    }

    rotateBoids() {
        var target1 = this.boids[0].target;
        for (i = 0; i < this.boids.length-1; i++) {
            this.boids[i].target = this.boids[i+1].target;
        }
        this.boids[this.boids.length-1].target = target1;
    }

    OnOffTam() {
        var onoff = document.getElementById("cambio_tam").checked;
        this.boids.forEach(e => e.cambioTam = onoff);
    }

    OnOffCol() {
        var onoff = document.getElementById("cambio_color").checked;
        this.boids.forEach(e => e.cambioCol = onoff);
    }

    OnOffRot() {
        this.rotation = document.getElementById("rotate").checked;
    }

    ChangeRotTime() {
        this.t_rotation = 60 * document.getElementById("t_rotation").value;
    }

    OnOffFlocking() {
        var onoff = document.getElementById("flock").checked;
        this.boids.forEach(e => e.useFlocking = onoff);
    }

    ChangeNVec() {
        var cambio = document.getElementById("n_des").value;
        this.boids.forEach(e => e.n_vecinos = cambio);
    }

    ChangeSep() {
        var cambio = document.getElementById("separacion").value;
        this.boids.forEach(e => e.separation = cambio);
    }

    ChangeDist() {
        var cambio = document.getElementById("distVecino").value;
        this.boids.forEach(e => e.neighbordist = cambio);
    }

    ChangeFSep() {
        var cambio = document.getElementById("Fseparacion").value;
        this.boids.forEach(e => e.separationForce = cambio);
    }

    ChangeFAli() {
        var cambio = document.getElementById("Falign").value;
        this.boids.forEach(e => e.alignForce = cambio);
    }

    ChangeFCoh() {
        var cambio = document.getElementById("FCohesion").value;
        this.boids.forEach(e => e.cohesionForce = cambio);
    }
}