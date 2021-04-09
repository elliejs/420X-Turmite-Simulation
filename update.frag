precision mediump float;
uniform sampler2D buffer;
uniform vec2 res;

uniform bool rules[12];
uniform vec2 colors[13];

#define UP vec2( 0., 1.)
#define DN vec2( 0.,-1.)
#define LT vec2(-1., 0.)
#define RT vec2( 1., 0.)


bool isAntLeft(vec4 loc)  { return loc.x >= .500 && loc.x < .625; }
bool isAntUp(vec4 loc)    { return loc.x >= .625 && loc.x < .750; }
bool isAntRight(vec4 loc) { return loc.x >= .750 && loc.x < .875; }
bool isAntDown(vec4 loc)  { return loc.x >= .875 && loc.x < 1.00; }

bool isAnt(vec4 loc)      { return loc.x >= 0.5;  }
bool square_rotates_right(vec4 loc)  {
  for(int i = 0; i < 12; i++) {
    if(loc.yz == colors[i]) {
      return rules[i];
    }
  }
  return false;
}

vec2 uvadj2uvN(vec2 loc, vec2 adj) {
  return mod((loc + adj), res) / res;
}

float rotLeft(vec4 loc) {
  float newX = loc.x - .125;
  return newX < .5 ? .9 : newX;
}

float rotRight(vec4 loc) {
  float newX = loc.x + .125;
  return newX > 1. ? .6 : newX;
}

vec2 advanceColor(vec4 rgba) {
  for(int i = 0; i < 12; i++) {
    if(rgba.yz == colors[i]) {
      return colors[i + 1];
    }
  }
  return vec2(.1, .1);
}

vec4 unAnt(vec4 ant) { return vec4(0. , ant.yzw); }

void main() {
  vec2 uv = gl_FragCoord.xy;
  vec2 uvN = uv / res;
  vec4 RGBAuvN = texture2D(buffer, uvN);

  vec4 ant;
  if(
    isAntLeft (ant = texture2D(buffer, uvadj2uvN(uv,RT))) ||
    isAntUp   (ant = texture2D(buffer, uvadj2uvN(uv,DN))) ||
    isAntRight(ant = texture2D(buffer, uvadj2uvN(uv,LT))) ||
    isAntDown (ant = texture2D(buffer, uvadj2uvN(uv,UP)))
    )
  {
    gl_FragColor = vec4(square_rotates_right(RGBAuvN) ?
                          rotRight(ant) :
                          rotLeft(ant),
                        advanceColor(RGBAuvN),
                        1.);
  } else if (isAnt(RGBAuvN)) {
    gl_FragColor = unAnt(RGBAuvN);
  } else {
    gl_FragColor = RGBAuvN;
  }
}
