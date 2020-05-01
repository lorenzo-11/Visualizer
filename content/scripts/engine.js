var gl, iid = -1, v, ccc = [-1.91, 1.09];
const mat4 = glMatrix.mat4, vec3 = glMatrix.vec3, vec2 = glMatrix.vec2;
function init() {
  // . . .
  main();
}

function main() {
  const cnv = document.getElementById('id');
  // cnv.addEventListener('dblclick', () => { if (document.fullscreen) { document.exitFullscreen(); } else { cnv.requestFullscreen(); } });
  window.addEventListener('resize', () => {
    cnv.width = Math.floor(window.innerWidth * window.devicePixelRatio);
    cnv.height = Math.floor(window.innerHeight * window.devicePixelRatio);
    clearTimeout(iid);
    iid = setTimeout(() => {
      //p.resize();
    }, 200);
  });
  window.addEventListener('wheel', (e) => {
    zm = Math.max(Math.min(zoom + ((e.deltaY < 0) - (e.deltaY > 0)), -2), -15);
  });

  gl = document.getElementById('id').getContext('webgl', { antialias: true, stencil: true });
  window.dispatchEvent(new Event('resize'));

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  //gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var bool = false, x = 0, y = 0, ax = 0, ay = 0, cccc = [0, 0];
  window.addEventListener('mousedown', (e) => {
    bool = true;
    x = e.clientX; y = e.clientY;
  });
  window.addEventListener('mouseup', (e) => {
    bool = false;
    let t = Math.PI / 180 / 5;
    ax -= (e.clientX - x) * t;
    ay += (e.clientY - y) * t;
    cccc = [ax, ay];
  });
  window.addEventListener('mousemove', (e) => {
    if (bool) {
      let t = Math.PI / 180 / 5;
      cccc = [ax - (e.clientX - x) * t, ay + (e.clientY - y) * t];
    }
  });
  const iiid = setInterval(() => {
    ccc = [(cccc[0] - ccc[0]) / 20 + ccc[0], (cccc[1] - ccc[1]) / 20 + ccc[1]];
    zoom += (zm - zoom) / 20;
  }, 10);

  v = new Vector({ pos: [0, 0, 0, 0, 0, 1, 0, 1, 1] })

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  let cc = 0;
  const fps = document.getElementById('fps');
  const render = () => {
    draw();
    requestAnimationFrame(render);
    cc += 1;
  };
  let id = setInterval(() => {
    fps.innerText = cc * 4;
    cc = 0;
  }, 250);
  requestAnimationFrame(render);
}

var camera, cc = [2.5, 0, 5], zoom = -10, zm = -15;
const target = [0, 0, 0], up = [0, 1, 0];
function draw() {
  const projectionMatrix = mat4.create(), cameraMatrix = mat4.create(), viewMatrix = mat4.create();
  const vec = {
    modelViewMatrix: mat4.create(),
    world: mat4.create(),
    normal: mat4.create()
  };
  mat4.perspective(projectionMatrix, 0.5, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000.0);

  mat4.rotate(cameraMatrix, cameraMatrix, ccc[0], [0, 1, 0]);
  mat4.rotate(cameraMatrix, cameraMatrix, ccc[1], [1, 0, 0]);
  mat4.translate(cameraMatrix, cameraMatrix, [0, 0, zoom]);

  camera = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
  m4.lookAt(camera, target, up, cameraMatrix);
  mat4.invert(cameraMatrix, cameraMatrix);
  mat4.copy(viewMatrix, cameraMatrix);

  viewMatrix[12] = 0;
  viewMatrix[13] = 0;
  viewMatrix[14] = 0;

  mat4.multiply(vec.modelViewMatrix, projectionMatrix, cameraMatrix);

  mat4.multiply(viewMatrix, projectionMatrix, viewMatrix);
  mat4.invert(viewMatrix, viewMatrix);

  mat4.rotate(vec.world, vec.world, Math.PI, [1, 0, 0]);
  mat4.rotate(vec.world, vec.world, -Math.PI / 2, [0, 1, 0]);

  mat4.multiply(vec.modelViewMatrix, vec.modelViewMatrix, vec.world);
  mat4.invert(vec.normal, vec.world);
  mat4.transpose(vec.normal, vec.normal);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  v.draw(vec);
}

class Vector {
  constructor(data) {
    this.vert = data.pos;

    this.program = gl.createProgram();
    gl.attachShader(this.program, loadShader(gl, gl.VERTEX_SHADER, `
attribute vec4 pos;
uniform mat4 model;

void main() {
  gl_Position = model * pos;
}
`));
    gl.attachShader(this.program, loadShader(gl, gl.FRAGMENT_SHADER, `
precision mediump float;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`));

    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
      return null;
    }

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vert), gl.STATIC_DRAW);

    this.model = gl.getUniformLocation(this.program, 'model');
    this.pos = gl.getAttribLocation(this.program, 'pos');
  }

  draw(data) {
    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.model, false, data.modelViewMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.pos);
    gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.order);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

function loadShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}