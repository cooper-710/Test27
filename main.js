import { initScene } from './scene.js';
import { setupUI } from './ui.js';
import { loadAndAnimatePitch } from './animation.js';

let sceneObjects;

async function main() {
  sceneObjects = initScene();
  setupUI(sceneObjects, loadAndAnimatePitch);
  renderLoop();
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  if (sceneObjects.controls) sceneObjects.controls.update();
  sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
}

main();