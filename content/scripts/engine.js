var gl, iid = -1;
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
    zm = Math.max(Math.min(zoom + ((e.deltaY < 0) - (e.deltaY > 0)), -0), -15);
  });
  
  gl = document.getElementById('id').getContext('webgl', { antialias: true, stencil: true });
  window.dispatchEvent(new Event('resize'));

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.enable(gl.CULL_FACE);
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

var camera; ccc = [-1.91, 1.09]; cc = [2.5, 0, 5], zoom = -10, zm = -15;
function draw() {

}