precision mediump float;
uniform sampler2D buffer;
uniform vec2 res;
void main() {
  gl_FragColor = texture2D(buffer, gl_FragCoord.xy / res);
}
