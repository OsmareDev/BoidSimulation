
var flock;

function setup() {
    var miCanvas = createCanvas(1503,300);
    miCanvas.parent("lienzo");
    
    background(52);
    textFont(font); 
    textSize(164);
    fill(255);
    noStroke();
    
    frase = 'agua';
    //text(frase, 100, 200);
    
    puntos = font.textToPoints(frase, 100, 200);
    
    draw_points();
    flock = new Flock;

    /* generar tantos boids como puntos */
    
    for (i=0; i<puntos.length;i++){
        boid = new Boid(Math.random() * 1503, Math.random() * 300,puntos[i], Math.random()*5);
        //boid = new Boid(750, 150,puntos[i], Math.random()*5);
        flock.addBoid(boid);
    }


}

function draw() {
    background(0);
    //draw_points();
    
    flock.run();
}

function mousePressed() {

    if (keyCode === 69)
        flock.electrocuteBoid(createVector(mouseX, mouseY));
}

function mouseDragged() {
    if (keyCode === 70)
        flock.mousefear(createVector(mouseX, mouseY));
}

function keyPressed() {
    if (keyCode === 67)
        flock.changeBoids();

    if (keyCode === 83)
        flock.stopCharge();

    if (keyCode === 78)
        flock.newBoid();
}