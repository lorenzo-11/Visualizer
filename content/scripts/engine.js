var gl, iid = -1, v, ccc = [-1.91, 1.09];
const mat4 = glMatrix.mat4, vec3 = glMatrix.vec3, vec2 = glMatrix.vec2;
function init() {
  let count = 0;
  for (let i = 0; i < vecData.paths.length; i++) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'content/resources/' + vecData.paths[i]);
    xhr.responseType = "arraybuffer";
    xhr.onload = (r) => {
      if (vecData.vars[i] !== 'posOrder') {
        vecData[vecData.vars[i]] = new Float32Array(r.target.response);
      } else {
        vecData[vecData.vars[i]] = new Uint32Array(r.target.response);
      }
      count++;
      if (count === 3) {
        main();
      }
    };
    xhr.send();
  }
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
    zm = Math.max(Math.min(zoom + ((e.deltaY < 0) - (e.deltaY > 0)) * 3, -2), -15);
  });

  gl = document.getElementById('id').getContext('webgl', { antialias: true });
  if (!gl.getExtension("OES_element_index_uint")) {
    document.write("Unable to initialize vertex order buffer. Workaround not yet implemented. Try a different browser (tested on Chrome)");
  }
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

  v = new Vector(0, 0, 1, [0, 0, 1, 1]);

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

  //mat4.rotate(vec.world, vec.world, Math.PI, [1, 0, 0]);
  //mat4.rotate(vec.world, vec.world, -Math.PI / 2, [0, 1, 0]);

  mat4.multiply(vec.modelViewMatrix, vec.modelViewMatrix, vec.world);
  mat4.invert(vec.normal, vec.world);
  mat4.transpose(vec.normal, vec.normal);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  v.draw(vec);
}

class Vector {
  constructor(x, y, z, rgba=[1, 0.8, 0.8, 1]) {
    this.xyz = [x, y, z];
    this.vert = vecData.pos;
    this.normal = vecData.norm;
    this.posOrder = vecData.posOrder;
    this.rgba = rgba;

    this.program = gl.createProgram();
    gl.attachShader(this.program, loadShader(gl, gl.VERTEX_SHADER, `
attribute vec4 pos;
attribute vec3 nor;
uniform mat4 model, world, normal;

varying vec3 vert;
varying vec3 normalInterp;

void main() {
  gl_Position = model * pos;
  normalInterp = vec3(normal * vec4(nor, 0.0));
  vert = (world * pos).xyz;
  gl_PointSize = 2.0;
}
`));
    gl.attachShader(this.program, loadShader(gl, gl.FRAGMENT_SHADER, `
precision mediump float;
//const vec3 lightPos = vec3(0.0, 0.0, -10.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);
const vec3 specColor = vec3(1.0, 1.0, 1.0);
const float lightPower = 30.0;
const float shininess = 70.0;
const float screenGamma = 2.2;

uniform vec3 cam;

varying vec3 vert;
varying vec3 normalInterp;

void main() {
  vec3 lightPos = normalize(cam) * 5.0;
  vec3 diffuseColor =  vec3(1.0, 0.0, 0.0), ambientColor = diffuseColor / 20.0;
  vec3 normal = normalize(normalInterp);
  vec3 colorGammaCorrected = vec3(0.0);

  vec3 lightDir = lightPos - vert;
  float distance = length(lightDir);
  distance = distance * distance;
  lightDir = normalize(lightDir);

  float lambertian = max(dot(lightDir,normal), 0.0);
  vec3 colorLinear = ambientColor + diffuseColor * lambertian * lightColor * lightPower / distance;
  if(lambertian > 0.0) {
      float specular = 0.0;
      vec3 viewDir = normalize(cam);
      vec3 halfDir = normalize(lightDir + viewDir);
      float specAngle = max(dot(halfDir, normal), 0.0);
      specular = pow(specAngle, shininess);
      colorLinear += specColor * specular * lightColor * lightPower / distance;
  }
  colorGammaCorrected = pow(colorLinear, vec3(1.0/screenGamma));
  gl_FragColor = vec4(colorGammaCorrected, 1.0);
}
`));

    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
      return null;
    }

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vert, gl.STATIC_DRAW);

    this.order = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.order);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.posOrder, gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normal, gl.STATIC_DRAW);

    this.model = gl.getUniformLocation(this.program, 'model');
    this.world = gl.getUniformLocation(this.program, 'world');
    this.normal = gl.getUniformLocation(this.program, 'normal');
    this.cam = gl.getUniformLocation(this.program, 'cam');
    this.pos = gl.getAttribLocation(this.program, 'pos');
    this.nor = gl.getAttribLocation(this.program, 'nor');
  }

  draw(data) {
    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.model, false, data.modelViewMatrix);
    gl.uniformMatrix4fv(this.world, false, data.world);
    gl.uniformMatrix4fv(this.normal, false, data.normal);
    gl.uniform3fv(this.cam, camera);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.pos);
    gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.nor);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(this.nor, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.order);

    gl.drawElements(gl.TRIANGLES, this.posOrder.length, gl.UNSIGNED_INT, 0);
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