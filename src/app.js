import * as THREE from 'three';
import imagesLoaded from 'imagesloaded';
import FontFaceObserver from 'fontfaceobserver';
import './styles/style.css';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Scroll from './js/scroll';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import texture1 from './images/texture1.jpg';

export default class World {
    constructor(options) {
        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.clock = new THREE.Clock();
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 100, 2000);
        this.camera.position.z = 600;

        this.camera.fov = 2 * Math.atan((this.height / 2) / this.camera.position.z) * (180 / Math.PI);

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.container.appendChild(this.renderer.domElement);
        this.renderer.setSize(this.width, this.height);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.images = [...document.querySelectorAll('img')];

        const fontLibre = new Promise(resolve => {
            new FontFaceObserver("Viaoda Libre").load().then(() => {
                resolve();
            });
        });

        const preLoadImages = new Promise((resolve, reject) => {
            imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
        });

        let allDone = [fontLibre, preLoadImages]

        Promise.all(allDone).then(() => {
            this.scroll = new Scroll();
            this.addImages();
            this.setPositions();
            this.setEvents();
            this.resize();
            this.addObjects();
            this.render();
        })
    }
    addImages() {
        this.imageStore = this.images.map((img) => {
            let bounds = img.getBoundingClientRect();
            let texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            let geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 1, 1);
            let material = new THREE.MeshBasicMaterial({ 
                // color: 0xff0000,
                map:texture
             });
            let mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh)
            return {
                img: img,
                mesh: mesh,
                top: bounds.top,
                left: bounds.left,
                height: bounds.height,
                width: bounds.width,
            }
        })
    }
    setPositions() {
        this.imageStore.forEach(o => {
            o.mesh.position.y = -o.top + this.height / 2 - o.height / 2 + this.scroll.scrollToRender;
            o.mesh.position.x = o.left - this.width / 2 + o.width / 2 ;
        })
    }
    addObjects() {
        console.log('Hi');
    }
    render() {
        this.time = this.clock.getElapsedTime();
        this.scroll.render();
        this.setPositions();

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
    setEvents() {
        window.addEventListener('resize', this.resize.bind(this));
    }
    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
}

let world = new World({
    dom: document.getElementById('container')
});