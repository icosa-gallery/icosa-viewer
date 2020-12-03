import * as THREE from 'three';
import CameraControls from 'camera-controls';

import '../css/style.scss';

function main() {
    const frame = document.getElementById('icosa');

    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.id = 'c';
    frame.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({canvas : canvas});
    renderer.setPixelRatio(window.devicePixelRatio);

    CameraControls.install({THREE: THREE});

    const clock = new THREE.Clock();

    const fov = 75;
    const aspect = 2;  
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(10, 10, 10);

    const cameraControls = new CameraControls(camera, canvas);
    cameraControls.dampingFactor = 0.1;
    cameraControls.polarRotateSpeed = cameraControls.azimuthRotateSpeed = 0.5;
    cameraControls.setTarget(0, 0, 0);
    cameraControls.dollyTo(3, true);

    camera.updateProjectionMatrix();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFE5B4);

    const box = new THREE.BoxGeometry();
    const boxmesh = new THREE.Mesh(box);
    scene.add(boxmesh);

    function render() {

        var updated = false;

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        updated = updated || cameraControls.update(delta);

        const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
        if (needResize) {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            updated = true;
        }

        requestAnimationFrame(render);
        
        if(updated) {
            renderer.render(scene, camera);
        }
    }

    requestAnimationFrame(render);
}

function docReady(fn: Listener) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded" as "readystatechange", fn);
    }
}

docReady(function () {
    main();
});