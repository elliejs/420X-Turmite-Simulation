var shell = require("gl-now")()
var createFBO = require("gl-fbo")
var glShader = require('gl-shader')
var glslify = require("glslify")
var ndarray = require("ndarray")
var fill = require("ndarray-fill")
var fillScreen = require("a-big-triangle")

var fbos,
    updateShader,
    drawShader,
    current = 0,
    res,
    gl,
    initial_fbo

var colors = new Array(13),
    rules = new Array(12)

function redub_colors(rules_len) {
  colors[0] = [0.0, 0.0]
  colors[1] = [1.0,0.4]
  colors[2] = [0.2, 1.0]
  colors[3] = [1.0, 0.2]
  colors[4] = [0.4, 1.0]
  colors[5] = [0.2, 0.0]
  colors[6] = [0.2, 0.8]
  colors[7] = [1.0, 0.4]
  colors[8] = [1.0, .6]
  colors[9] = [1.0, 0.8]
  colors[10] = [0.2, 0.2]
  colors[11] = [0.0, 0.6]

  colors[12] = colors[0]
  colors[rules_len] = colors[0]
}
function redub_rules(rules_str) {
  for(var i = 0; i < 12; i++) {
    switch(rules_str.charAt(i)) {
      case "L":
        rules[i] = 0
        break
      case "R":
        rules[i] = 1
        break
      default:
        rules[i] = 0
        break
    }
  }
}

var gui = new function() {
  this.rules = "RRLLLRLLLRRR"
  this.reset = function() {
    fbos[current].color[0].setPixels(initial_fbo)
  }
}
function gui_init() {
  var datgui = new dat.GUI()
  datgui.add(gui, 'rules')
  datgui.add(gui, 'reset')
}

var old_rules_len = gui.rules.length

shell.on("gl-init", function() {
  redub_rules(gui.rules)
  redub_colors(gui.rules.length + 1)
  gl = shell.gl
  res = [gl.drawingBufferWidth, gl.drawingBufferHeight]

  updateShader = glShader(gl,
    glslify('./shader.vert'),
    glslify('./update.frag')
  )
  drawShader = glShader(gl,
    glslify('./shader.vert'),
    glslify('./draw.frag')
  )
  //Turn off depth test
  gl.disable(gl.DEPTH_TEST)

  //Allocate buffers
  fbos = [ createFBO(gl, res), createFBO(gl, res) ]

  //Initialize state buffer
  initial_fbo = ndarray(new Uint8Array(res[0]*res[1]*4), [res[0], res[1], 4])
  fill(initial_fbo, function(x,y,c) {
    if(c === 3) {
      return 255
    } else if (x === res[0] / 2 && y === res[1] / 2 && c === 0) {
        return 250
    }
    return 0
  })
  fbos[0].color[0].setPixels(initial_fbo)

  //Set up vertex pointers
  drawShader.attributes.position.location = updateShader.attributes.position.location = 0
  gui_init()
})


shell.on("tick", function() {
  if(old_rules_len != gui.rules.length) {
    redub_rules(gui.rules)
    redub_colors(gui.rules.length)
    old_rules_len = gui.rules.length
  }
  var prevFBO = fbos[current]
  var currFBO = fbos[current ^= 1]

  //Switch to state fbo
  currFBO.bind()

  //Run update shader
  updateShader.bind()
  updateShader.uniforms.buffer = prevFBO.color[0].bind()
  updateShader.uniforms.res = res
  updateShader.uniforms.rules = rules
  updateShader.uniforms.colors = colors

  fillScreen(gl)
})

shell.on("gl-render", function(ttt) {
  //Render contents of buffer to screen
  drawShader.bind()
  drawShader.uniforms.buffer = fbos[current].color[0].bind()
  drawShader.uniforms.res = res
  fillScreen(gl)
})
