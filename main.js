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
    const far = 300;
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
	const planeSize = 1000;

	const loader = new THREE.TextureLoader();
	const texture = loader.load("assets/floor/grass.jpg");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.SRGBColorSpace;
	const repeats = planeSize /  100;
	texture.repeat.set( repeats, repeats );

	const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
	const planeMat = new THREE.MeshStandardMaterial( {
	    map: texture,
	    side: THREE.DoubleSide,
	} );
	const mesh = new THREE.Mesh( planeGeo, planeMat );
	mesh.rotation.x = TAU/4;
	scene.add( mesh );
    }

    {
	const cubeSize = 4;
	const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
	const cubeMat = new THREE.MeshStandardMaterial( { color: '#8AC' } );
	const mesh = new THREE.Mesh( cubeGeo, cubeMat );
	mesh.position.set( 15, cubeSize/2, 15 );
	scene.add( mesh );
    }

    {
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load('assets/trees/Tree.mtl', (mtl) => {
	    objLoader.setMaterials(mtl);
	    for(let i = 0; i < 10; i++){
		let x = (Math.random() * 100) - 50;
		let z = (Math.random() * 100) - 50;
		let scale = (Math.random() * 4) + 0.5;

		objLoader.load('assets/trees/Tree.obj', (root) => {
		    root.scale.multiplyScalar(scale);
		    root.position.set(x, 0, z);
		    scene.add(root);
		});
	    }
	});
    }

    {
	for(let i = 0; i < 10; i++){
	    let x = (Math.random() * 100) - 50;
	    let z = (Math.random() * 100) - 50;
	    let scale = (Math.random() * 2) + 0.2;

	    const wood_tex = new THREE.TextureLoader().load( "wood.jpg" );
	    const cylinderGeo = new THREE.CylinderGeometry(1, 1.5, 3, 10, 10);
	
	    const trunk = new THREE.Mesh( cylinderGeo, new THREE.MeshStandardMaterial({
		map: wood_tex,
	    }));
	    trunk.position.set(x, scale, z);
	    trunk.scale.multiplyScalar(scale);

	    scene.add( trunk );

	    const leaves_tex = new THREE.TextureLoader().load( "leaves.webp" );
	    const coneGeo = new THREE.ConeGeometry( 2, 6, 32 );
	    let thing = new THREE.MeshStandardMaterial( { map: leaves_tex } );
	    const leaves = new THREE.Mesh( coneGeo, thing);
	    leaves.position.set(x, (5*scale), z);
	    leaves.scale.multiplyScalar(scale);

	    scene.add( leaves );
	    
	}
	
    }
    
    let eyeball1;
    let eyeball2;
    {
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load('assets/eyeball/eyeball.mtl', (mtl) => {
	    //mtl.preload();
	    objLoader.setMaterials(mtl);
	    objLoader.load('assets/eyeball/eyeball.obj', (root) => {
		eyeball1 = root;
		root.position.set(5, 31, -23);
		root.scale.multiplyScalar(1.2);
		scene.add(root);
	    });
	    objLoader.load('assets/eyeball/eyeball.obj', (root) => {
		eyeball2 = root;
		root.position.set(-5, 31, -23);
		root.scale.multiplyScalar(1.2);
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

    let mainframe;
    {
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load('assets/mainframe/ServerV2+console.mtl', (mtl) => {
	    //mtl.preload();
	    objLoader.setMaterials(mtl);
	    objLoader.load('assets/mainframe/ServerV2+console.obj', (root) => {
		mainframe= root;
		root.position.set(-15, 0, 15);
		root.scale.multiplyScalar(2);
		scene.add(root);
	    });
	});
    };

    let chair;
    {
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load('assets/chair/10239_Office_Chair_v1_L3.mtl', (mtl) => {
	    //mtl.preload();
	    objLoader.setMaterials(mtl);
	    objLoader.load('assets/chair/10239_Office_Chair_v1_L3.obj', (root) => {
		chair = root;
		chair.rotateX(3*TAU/4);
		root.position.set(-15, 0, -15);
		root.scale.multiplyScalar(0.05);
		scene.add(root);
	    });
	});
    };

    
    let skull;
    {
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load('assets/skull/skull.mtl', (mtl) => {
	    mtl.preload();
	    objLoader.setMaterials(mtl);
	    objLoader.load('assets/skull/skull.obj', (root) => {
		skull = root;
		root.position.set(0, 12, -25);
		root.scale.multiplyScalar(5);
		root.lookAt(-9, 12, 4);
		scene.add(root);
	    });
	});
    };
    
    let ambient_light = (() => {
	const color = 0xFFFFFF;
	const intensity = 2;
	const light = new THREE.AmbientLight(color, intensity);
	scene.add(light);
	return light;
    })();

    
    {
	const color = 0xFFFFFF;
	const intensity = 3;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(20, 10, -20);
	light.target.position.set(-5, 0, 0);
	scene.add(light);
	scene.add(light.target);
    }


    let sun_light;
    {
	const color = 0xFFFFFF;
	const intensity = 400;
	sun_light = new THREE.PointLight(color, intensity);
	sun_light.position.set(3, 20, 0);
	scene.add( sun_light );
    };

    let sun;
    {
	const sphereRadius = 3;
	const sphereWidthDivisions = 32;
	const sphereHeightDivisions = 16;
	const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
	const sphereMat = new THREE.MeshBasicMaterial( { color: '#FFFFAA' } );
	sun = new THREE.Mesh( sphereGeo, sphereMat );
	sun.position.set(3, 20, 0 );
	scene.add( sun );
    }



    while((eyeball1 == undefined) || (eyeball2 == undefined) || (skull == undefined)){
	await new Promise(r => setTimeout(r, 100));
    }

    skull.attach(eyeball1);
    skull.attach(eyeball2);


    function render(time) {
	let seconds = time/1000;

	let man_position;
	let step = (time / 10) % 1000;
	let percent = step / 1000;
	if(step > 750){
	    let t = ((step - 750) % 250) / 250;
	    man_position = [-12 + (24 * t), 0, 12];
	}else if (step > 500){
	    let t = ((step - 500) % 250) / 250;
	    man_position = [-12, 0, -12 + (24 * t)];
	}else if (step > 250){
	    let t = ((step - 250) % 250) / 250;
	    man_position = [12 - (24 * t), 0, -12];
	}else{
	    let t = (step % 250) / 250;
	    man_position = [12, 0, 12 - (24 * t)];
	}
	if(man){
	    man.position.set(man_position[0], man_position[1], man_position[2]);
	    man.rotation.y = percent * TAU;
	}
	if(eyeball1){
	    eyeball1.lookAt(man_position[0], man_position[1], man_position[2]);
	}
	if(eyeball2){
	    eyeball2.lookAt(man_position[0], man_position[1], man_position[2]);
	}
	if(skull){
	    skull.lookAt(man_position[0], man_position[1], man_position[2]);
	}
	if(chair){
	    chair.rotation.z = 3*seconds;
	}
	sun_light.position.set(5*Math.sin(seconds), 20*Math.cos(seconds), 0);
	sun.position.set(5*Math.sin(seconds), 20*Math.cos(seconds), 0);
	
	
	renderer.render( scene, camera );

	requestAnimationFrame( render );

    }

    requestAnimationFrame( render );

}

main();
