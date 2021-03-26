import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';
import getCrucibleDataForAccount from "./crucibleData/getCrucibleDataForAccount";
import PRNG from "./js/PRNG"; 
import { circles } from "./js/circles";


let composer, camera, scene, renderer, controls, clock; 
let angle = 0; 
let speed = 0.003; 
let range = 100; 

let crucibleData, prng, balance;
let mainHues, hueBase, hueJitter, saturation, lightness, color; 

const bloomParams = {
    exposure: 0.6,
    bloomStrength: 1.2,
    bloomThreshold: 0,
    bloomRadius: 1
};

//document.querySelector("button").addEventListener("click", getOwnerAddress);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let account = urlParams.get("ownerAddress"); 
console.log(queryString, account);
if (account != null) { 
    getCrucibleData(account); 
}

// Get crucible data from ethereum
async function getCrucibleData (account) {
    try { 
        crucibleData =  await getCrucibleDataForAccount(account);
        console.log(crucibleData[0]);
        generateCrucible(crucibleData[0]); 
        document.querySelector("p").textContent = "Crucible data found!";
    }
    catch(err) {
        console.log(err);
        document.querySelector("p").textContent = "Not able to get Crucible data";
    }
}

// Getting owner from form 
function getOwnerAddress() {
    account = document.querySelector("input").value;
    console.log("Owner address", account);
    getCrucibleData(account); 
}

// Generate variables based on data
function generateCrucible(crucibleData) 
{
    balance = logBaseN(2, ((crucibleData.lockedBalance.div(1e9).toNumber()) / 1e9) + 1);
    const numColors = 3 * Math.floor(balance);
    prng = new PRNG(crucibleData.id);
    
    mainHues = [];

	let hueCount = 3 + prng.randomInt('colors', numColors);
	while (hueCount) {
		hueCount--;
		mainHues.push(160 + prng.randomInt('colors', 120));
	}

    // Change CSS background color 
    document.body.style.background = "radial-gradient(circle, " + generateHSLColor() + ", " + "hsl(266, 49%, 19%)" + ")"; 

    init();
}



function init() 
{ 
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild( renderer.domElement );
    
    scene = new THREE.Scene();
    
    // CAMERA
    camera = new THREE.PerspectiveCamera(
        100,                                   // Field of view
        window.innerWidth/window.innerHeight, // Aspect ratio
        0.05,                                  // Near clipping pane
        4000                                  // Far clipping pane
    );
    camera.position.set(20,600,-400);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // INTERACTIVE CONTROLS 
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 500;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;

    // LIGHTS
    const light = new THREE.AmbientLight( 0x32254C, 2 ); 
    scene.add( light );

    const targetObj = new THREE.Object3D();
    targetObj.position.set(0,0,0);
    scene.add(targetObj);

    const spotLightTop = new THREE.SpotLight( 0x4ECECE, 0.5);
    spotLightTop.position.set( 0, 1000, 0 );
    spotLightTop.target = targetObj;
    // scene.add( spotLightTop );

    const spotlightBot = new THREE.SpotLight( 0xB078FF, 0.3);
    spotlightBot.position.set( 0, -1000, 0 );
    spotlightBot.target = targetObj;
    // scene.add( spotlightBot );

    // RENDER 
    const renderScene = new RenderPass( scene, camera );
    const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloomPass.threshold = bloomParams.bloomThreshold;
    bloomPass.strength = bloomParams.bloomStrength;
    bloomPass.radius = bloomParams.bloomRadius;

    composer = new EffectComposer( renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );

    // DRAW ALCHEMY CIRCLES
    const numCircles = 5 + Math.floor(balance) > 10 ? 10 : 5 + Math.floor(balance);
    console.log("Balance math floor", Math.floor(balance));
    console.log("Balance", balance);
    console.log("Number of circles total", numCircles);
    for (let i = 0; i < numCircles; i++) {

        // randomize if they get in the scene or not 
        let addedCircleToScene = false;
        while (!addedCircleToScene) {
            const circlePrng = prng.randomInt('circles', numCircles);
            console.log("prng", circlePrng, "i", i);

            let circleIndex = circlePrng;
            console.log("circle index:", circleIndex);
            console.log(circles[circleIndex].addedToScene);

            if (!circles[circleIndex].addedToScene) {
                
                circles[circleIndex].addedToScene = true; 

                circles[circleIndex].yOffset = (50 * i) + prng.randomInt('offset', 50);
                circles[circleIndex].rotationSpeed = 0.001 + prng.randomInt('offset',4) * 0.001;
                circles[circleIndex].movementSpeed = 0.1 + prng.randomInt('offset',5) * 0.2;

                extrudedGroupFromSVG(circles[circleIndex].path, circles[circleIndex].meshGroup, circles[circleIndex].yOffset, generateThreeColor());
                circles[circleIndex].meshGroup.rotation.z = prng.randomInt('rotation',10) * 0.001;
                scene.add(circles[circleIndex].meshGroup);

                console.log("Circles", circleIndex, "Added to scene");
                addedCircleToScene = true; 

            }
        }
    }

    // WINDOW EVENT
    window.addEventListener("resize", onWindowResize);

    // ANIMATE
    animate(); 
}


function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    composer.setSize( width, height );
}

function animate() {

    // Update Frame 
    requestAnimationFrame(animate);
    controls.update(); 
    
    // Animate Alchemy Circles
    angle += speed; 
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].addedToScene) {
            circles[i].meshGroup.rotation.z += circles[i].rotationSpeed;
            circles[i].meshGroup.position.setY(
                circles[i].yOffset + Math.sin(angle) * range * circles[i].movementSpeed); 
        }
    }

    // Render scene 
    composer.render();
}


function extrudedGroupFromSVG(resourcePath, group, offsetY, threeColor) 
{
    // instantiate a loader
    const svgLoader = new SVGLoader();

    // load a SVG resource
    svgLoader.load(resourcePath, function ( data ) {
        const paths = data.paths;

        for ( let i = 0; i < paths.length; i ++ ) {
            const path = paths[ i ];

            const material = new THREE.MeshPhongMaterial( {
                color: threeColor,
                emissive: threeColor,
                emissiveIntensity: 1
            } );

            const shapes = path.toShapes( true );

            for ( let j = 0; j < shapes.length; j ++ ) {

                const shape = shapes[ j ];
                const geometry = new THREE.ExtrudeGeometry(shape, {
                    steps: 4,
                    depth: 2,
                    bevelEnabled: true,
                    bevelThickness: 3,
                    bevelSize: 3, 
                    bevelOffset: -2,
                    bevelSegments: 4
                });

                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            }
        }

        group.scale.y *= -1;
        group.position.set(0,offsetY,0);
        group.rotateX(Math.PI / 2);
    });
}

function logBaseN(base, num) {
	return Math.log(num) / Math.log(base);
}

function generateHSLColor() { 
    const h = Math.floor(160 + prng.randomInt('colors', 160));
    const s = Math.floor(40 + (3 * balance) + Math.min(prng.randomInt('colors', 100), 100));
    const l = Math.floor(10 + (5 * balance) + Math.min(prng.randomInt('colors', 10), 50));
    const hslColor = "hsl(" + h + ", " + s + "%, " + l + "%)";

    return hslColor;
}

function generateThreeColor() {
    hueJitter = Math.floor((60 / (1 + balance)) * (0.5 - prng.randomFloat('colors')));
    hueBase = mainHues[prng.randomInt('colors', mainHues.length)];
    saturation = Math.floor(40 + (6 * balance) + Math.min(prng.randomInt('colors', 100), 100));
    lightness = Math.floor(10 + (6 * balance) + Math.min(prng.randomInt('colors', 10), 50));
    color = `hsl(${hueBase + hueJitter}, ${saturation}%, ${lightness}%)`;

    return new THREE.Color(color);
}
