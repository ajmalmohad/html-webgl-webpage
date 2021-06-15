import * as THREE from 'three';
import imagesLoaded from 'imagesloaded';
import FontFaceObserver from 'fontfaceobserver';
import './styles/style.css';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Scroll from './js/scroll';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import gsap from 'gsap';

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


        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

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
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0},
                uImage: {value:0},
                uHover: {value: new THREE.Vector2(0.5,0.5)},
                uHoverState: {value: 0},
            },
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide,
            // wireframe:true
        });

        this.allMaterials = [];

        this.imageStore = this.images.map((img) => {
            let bounds = img.getBoundingClientRect();
            let texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            let geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 10, 10);
            let material = this.material.clone();
            material.uniforms.uImage.value = texture;

            img.addEventListener('mouseenter',()=>{
                gsap.to(material.uniforms.uHoverState,{
                    duration:1,
                    value:1
                })
            })
            img.addEventListener('mouseout',()=>{
                gsap.to(material.uniforms.uHoverState,{
                    duration:1,
                    value:0
                })
            })

            this.allMaterials.push(material);

            let mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);
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
            o.mesh.position.x = o.left - this.width / 2 + o.width / 2;
        })
    }
    addObjects() {
        console.log('Hi');
    }
    render() {
        this.time = this.clock.getElapsedTime();
        this.scroll.render();
        this.setPositions();
        this.allMaterials.forEach((material)=>{
            material.uniforms.uTime.value = this.time;
        })

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
    setEvents() {
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / this.width) * 2 - 1;
            this.mouse.y = - (e.clientY / this.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);
            for ( let i = 0; i < intersects.length; i ++ ) {
                let obj = intersects[0].object;
                obj.material.uniforms.uHover.value = intersects[0].uv;
            }
        }, false);
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