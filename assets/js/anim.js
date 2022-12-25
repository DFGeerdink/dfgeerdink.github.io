function glow(){
  // Play final glowing animation
  svg_path.style.animation = `anim-glow 3s ease-in-out infinite`;
}

function anim_glow(){
  // Play final fill animation
  for(let i = 0; i<paths.length; i++) {
    var path = paths[i]
    path.style.animation = `anim-glow 3s ease-in-out infinite ${totaldelay + 2.0}s`;
  }
}

// Scale to window size and center
const svg_path = document.querySelectorAll('#H2states')[0];

// var bBox = svg_path.getBBox();
// var scale = 0.90*Math.min(document.documentElement.clientWidth / bBox.width, document.documentElement.clientHeight / bBox.height);
// svg_path.style.transform =  `translate(-50%, -50%) scale(${scale})`;

// Animate paths with delay
const paths = document.querySelectorAll('#H2states path');
var duration = 0.5;
var delay = 0.1;
var totaldelay = 0;

// Loop over paths and set animation
for(let i = 0; i<paths.length; i++){
  var path = paths[i], length = path.getTotalLength();
  console.log(`Path ${i} is ${length} px`);
  console.log()
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  path.style.fill = "transparent";
  path.style.stroke = "white";

  // var animlength = 2*(length/10)
  var animlength = duration

  totaldelay = totaldelay + animlength - delay;

  console.log(`line-anim ${animlength}s ease forwards ${totaldelay}s`);
  path.style.animation = `line-anim ${animlength}s ease forwards ${totaldelay}s`;

  if (path.className.baseVal === "svg-anim-fill"){
    path.style.animation = `fill 0.5s ease forwards ${totaldelay+duration}s`;
  }
}

// Set timer for glowing of SVG
//window.setTimeout(glow, (totaldelay+duration)*1000);
window.setTimeout(glow, 1);

// Typewriter
var app = document.getElementById('H2states-explainer');

var typewriter = new Typewriter(app, {
  loop: false,
  delay: 0.2,
  cursor: '.'

});

typewriter.typeString('This diagram illustrates the two lowest energetic states of the ')
    .typeString('<strong>hydrogen atom</strong>')
    .typeString('.\n')
    .pauseFor(2500)
    .typeString('The vertical lines with the dots indicate the spin moments of the proton and electron.\n')
    .pauseFor(2500)
    .typeString('The transition time from one state to the other provides the fundamental clock reference used in all the Voyagers\' cover diagrams and decoded pictures.');

// Set timer for typewriter
window.setTimeout(typewriter.start, (totaldelay+duration)*1000);

