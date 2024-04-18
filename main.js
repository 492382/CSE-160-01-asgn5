import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const TAU = Math.PI * 2;

async function main() {
    const canvas = document.getElementById("paint_canvas");
    const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set( 0, 10, 20 );

    function updateCamera() {
	camera.updateProjectionMatrix();
    }

    const gui = new GUI();
    gui.add( camera, 'fov', 1, 180 ).onChange( updateCamera );
    
    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 0, 5, 0 );
    controls.update();


    
    const scene = new THREE.Scene();

    {
	const loader = new THREE.TextureLoader();
	const texture = loader.load(
	    'test.jpg', 
	    () => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.colorSpace = THREE.SRGBColorSpace;
		scene.background = texture;
	    });
    }
    {
	const planeSize = 60;

	const loader = new THREE.TextureLoader();
	const texture = loader.load("assets/floor/checker.png");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	//texture.colorSpace = THREE.SRGBColorSpace;
	const repeats = planeSize / 2;
	texture.repeat.set( repeats, repeats );

	const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
	const planeMat = new THREE.MeshPhongMaterial( {
	    map: texture,
	    side: THREE.DoubleSide,
	} );
	const mesh = new THREE.Mesh( planeGeo, planeMat );
	mesh.rotation.x = Math.PI * - .5;
	scene.add( mesh );
    }

    {
	const cubeSize = 4;
	const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
	const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
	const mesh = new THREE.Mesh( cubeGeo, cubeMat );
	mesh.position.set( cubeSize + 1, cubeSize / 2, 0 );
	scene.add( mesh );
    }
    
    let eyeball;
    {
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load('assets/eyeball/eyeball.mtl', (mtl) => {
	    //mtl.preload();
	    objLoader.setMaterials(mtl);
	    objLoader.load('assets/eyeball/eyeball.obj', (root) => {
		eyeball = root;
		root.position.set(0, 9, 0);
		root.lookAt(-5, 0, 0);
		scene.add(root);
	    });
	});
    }
    
    let man;
    {
	const objLoader = new OBJLoader();
	objLoader.load('assets/man/man.obj', (root) => {
	    man = root;
	    root.position.set(0, 0, 0);
	    root.scale.multiplyScalar(0.2);
            scene.add(root);
	});
    };

    let ambient_light = (() => {
	const color = 0xFFFFFF;
	const intensity = 0.9;
	const light = new THREE.AmbientLight(color, intensity);
	scene.add(light);
	return light;
    })();

    
    let light = (() => {
	const color = 0xFFFFFF;
	const intensity = 3;
	const light = new THREE.DirectionalLight( color, intensity );
	light.position.set(3, 20, 0 );
	light.target.position.set(-8, 0, 0 );
	scene.add( light );
	scene.add( light.target );

    })();

    let sun = (() => {
	const sphereRadius = 3;
	const sphereWidthDivisions = 32;
	const sphereHeightDivisions = 16;
	const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
	const sphereMat = new THREE.MeshBasicMaterial( { color: '#FFFFAA' } );
	const mesh = new THREE.Mesh( sphereGeo, sphereMat );
	mesh.position.set(3, 20, 0 );
	scene.add( mesh );
    })();

    
    function resizeRendererToDisplaySize( renderer ) {

	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if ( needResize ) {

	    renderer.setSize( width, height, false );

	}

	return needResize;

    }

    function render(time) {
	let seconds = time/1000;

	let percent = (time % 5000)/5000;

	let man_position = [5 * Math.cos(percent * TAU), 0, 5 *Math.sin(percent * TAU)];
	if(man){
	    man.position.set(man_position[0], man_position[1], man_position[2]);
	}
	if(eyeball){
	    eyeball.lookAt(man_position[0], man_position[1], man_position[2]);
	}

	
	
	if ( resizeRendererToDisplaySize( renderer ) ) {

	    const canvas = renderer.domElement;
	    camera.aspect = canvas.clientWidth / canvas.clientHeight;
	    camera.updateProjectionMatrix();

	}

	renderer.render( scene, camera );

	requestAnimationFrame( render );

    }

    requestAnimationFrame( render );

}

main();
