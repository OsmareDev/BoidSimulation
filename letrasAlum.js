var font;
var puntos;
var frase;

function draw_points()
{
  for (i=0; i<puntos.length;i++){
    var p = puntos[i];
    stroke(0,255,0);
    strokeWeight(4);
    point(p.x, p.y);
  }
}

function preload() {
  font = loadFont("LetterGothicStd.otf");
}

