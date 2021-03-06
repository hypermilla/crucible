import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';
import Proton from 'three.proton.js';

import getCrucibleDataForAccount from "./crucibleData/getCrucibleDataForAccount";
import getCrucibleData from "./crucibleData/getCrucibleData";
import getAllCrucibleIds from "./crucibleData/getAllCrucibleIds";
import PRNG from "./js/PRNG"; 

import { circles } from "./js/circles";
import { draw3DCircleText } from "./js/textLoader";
import { extrudeGroupFromSVG } from "./js/extrudeGroupFromSVG"
import dot from "./js/dot";



let allCrucibleIds;

let composer, camera, scene, renderer, controls;
let proton, emitter;

let angle = 0; 
let speed = 0.003; 
let range = 100; 

let crucibleData, prng, balance;
let mainHues, hueBase, hueJitter, saturation, lightness, color; 
let ownerAddressMeshGroup = new THREE.Group();
let crucibleIdMeshGroup = new THREE.Group(); 

const bloomParams = {
    exposure: 0.6,
    bloomStrength: 1.2,
    bloomThreshold: 0,
    bloomRadius: 1
};

// Load all Crucible Ids when page loads
loadAllCrucibleIds(); 


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let account = urlParams.get("ownerAddress"); 

console.log("Owner Address", account);

if (account != null) { 
    getCrucibleDataForOwnerAddress(account); 
} else {
    account = "0x8B68A44A09AA6E2cce3f2a896b8a57eE1938D77d";
    getCrucibleDataForOwnerAddress(account);
}

// Get crucible data from ethereum
async function getCrucibleDataForOwnerAddress (account) {
    try { 
        crucibleData =  await getCrucibleDataForAccount(account);
        crucibleData = crucibleData[0];
        generateCrucible(crucibleData); 
        document.querySelector("p").textContent = "Generated Crucible from Owner Address " + account;
    }
    catch(err) {
        console.log(err);
        document.querySelector("p").textContent = "Not able to get Crucible data";
    }
}

// Generate variables based on data
function generateCrucible(crucibleData) 
{
    balance = logBaseN(2, ((crucibleData.lockedBalance.div(1e9).toNumber()) / 1e9) + 1);
    prng = new PRNG(crucibleData.id);
    
    const numColors = 4 * Math.floor(balance);
    lightness = Math.floor(40 + (2 * balance) + Math.min(prng.randomInt('colors', 10), 50));
    mainHues = [];

	let hueCount = 4 + numColors + prng.randomInt('colors', numColors);
	while (hueCount) {
		hueCount--;
        mainHues.push(160 + prng.randomInt('colors', 30));
        if (hueCount > 5) {
            mainHues.push(20 + prng.randomInt('colors', 60));
            mainHues.push(40 + prng.randomInt('colors', 20));
        } else if (hueCount < 3) {
            mainHues.push(270 + prng.randomInt('colors', 20));
        }
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
        75,                                   // Field of view
        window.innerWidth/window.innerHeight, // Aspect ratio
        0.05,                                  // Near clipping pane
        4000                                  // Far clipping pane
    );
    camera.position.set(700,1200,-1400);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // INTERACTIVE CONTROLS 
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = true;

    controls.minDistance = 500;
    controls.maxDistance = 2000;
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

    // DRAW THE CRUCIBLE OBJECTS
    drawAlchemyCircle(); 

    // INIT PARTICLES
    initProton();

    // WINDOW EVENT
    window.addEventListener("resize", onWindowResize);

    // ANIMATE
    animate(); 
}

function drawAlchemyCircle() {

       // DRAW ALCHEMY CIRCLES
       const startingYPosition = 0; 
       const totalCircleCount = 4 + Math.floor(balance) > 9 ? 9 : 4 + Math.floor(balance);

       // DRAW CENTER PIECE, min 1, max 2
       let centerCircleCount = 0;
   
       for (let i = 1; i <= totalCircleCount; i += 6) {
           centerCircleCount++; 
       }
   
       drawAlchemyCircleGroup(centerCircleCount, circles.center, startingYPosition, 1); 
       draw3DCircleText(account, ownerAddressMeshGroup, 360, new THREE.Vector3(0,startingYPosition,0), generateThreeColor()); 
       scene.add(ownerAddressMeshGroup);
   
       // DRAW BOTTOM PIECES, min 1, max 4
       let bottomCircleCount = 0;
   
       for (let i = 1; i < totalCircleCount; i += 3) {
           bottomCircleCount++;
       }
   
       drawAlchemyCircleGroup(bottomCircleCount, circles.bottom, startingYPosition - (50 * centerCircleCount), -1); 

       const crucibleIdRadius = 500 * (1 + (0.4 * (bottomCircleCount - 1))); 
       draw3DCircleText(crucibleData.id, crucibleIdMeshGroup, crucibleIdRadius, new THREE.Vector3(0, startingYPosition - (50 * bottomCircleCount),0), generateThreeColor());
       scene.add(crucibleIdMeshGroup);
   
   
       // DRAW OVERLAY TOP PIECES, min 2, max 4
       let topCircleCount = 0; 
   
       for (let i = 0; i <= totalCircleCount; i += 3) {
           topCircleCount++;
       }
       
       drawAlchemyCircleGroup(topCircleCount, circles.top, startingYPosition + (50 * centerCircleCount), 1); 
}

function drawAlchemyCircleGroup(number, circlesList, startingYPosition, directionY) {

    for (let i=0; i < number; i++) {

        let addedCircleToScene = false;

        while (!addedCircleToScene) {

            const circlePrng = prng.randomInt('circles', circlesList.length - 1);

            if (!circlesList[circlePrng].addedToScene) {

                circlesList[circlePrng].addedToScene = true; 

                circlesList[circlePrng].yOffset = startingYPosition + (i * 60 * directionY) + (prng.randomInt('offset',30) * directionY);
                circlesList[circlePrng].rotationSpeed *= 1 + prng.randomInt('offset',6);
                circlesList[circlePrng].movementSpeed *= 0.1 + prng.randomInt('offset',10);
                
                extrudeGroupFromSVG(
                    circlesList[circlePrng].path, 
                    circlesList[circlePrng].meshGroup, 
                    circlesList[circlePrng].yOffset, 
                    generateThreeColor()
                );
                    
                circlesList[circlePrng].meshGroup.rotation.z *= prng.randomInt('rotation', 10);
                circlesList[circlePrng].meshGroup.scale.x = 1 + (i * 0.4);
                circlesList[circlePrng].meshGroup.scale.y = 1 + (i * 0.4);
                scene.add(circlesList[circlePrng].meshGroup);
                
                addedCircleToScene = true; 
            }
        }

    }
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
    
    animateAlchemyCircleGroup(circles.center);
    animateAlchemyCircleGroup(circles.bottom);
    animateAlchemyCircleGroup(circles.top);

    // Animate Text around circles
    animateTextGroup(ownerAddressMeshGroup, 1);
    animateTextGroup(crucibleIdMeshGroup, -1);

    // Render scene 
    proton.update();
    composer.render();
}



function animateTextGroup (group, direction) {
    group.rotation.y += 0.003; 
}


function animateAlchemyCircleGroup (list) {

    for (let i = 0; i < list.length; i++) {
        if (list[i].addedToScene) {
            list[i].meshGroup.rotation.z += list[i].rotationSpeed;
            list[i].meshGroup.position.setY(
                list[i].yOffset + Math.sin(angle) * range * list[i].movementSpeed); 
        }
    }
}


function logBaseN(base, num) {
	return Math.log(num) / Math.log(base);
}


function generateHSLColor() { 
    const h = Math.floor(160 + prng.randomInt('colors', 160));
    const s = Math.floor(40 + (3 * balance) + Math.min(prng.randomInt('colors', 100), 100));
    const l = Math.floor(2 + (1.5 * balance) + Math.min(prng.randomInt('colors', 10), 30));
    const hslColor = "hsl(" + h + ", " + s + "%, " + l + "%)";

    return hslColor;
}


function generateThreeColor() {
    hueJitter = Math.floor((30 / (1 + balance)) * (0.5 - prng.randomFloat('colors')));
    hueBase = mainHues[prng.randomInt('colors', mainHues.length)];
    saturation = Math.floor(40 + (3 * balance) + Math.min(prng.randomInt('colors', 100), 100));
    // lightness = Math.floor(10 + (6 * balance) + Math.min(prng.randomInt('colors', 10), 50));
    color = `hsl(${hueBase + hueJitter}, ${saturation}%, ${lightness}%)`;

    return new THREE.Color(color);
}


function initProton() {

    proton = new Proton();
    proton.addEmitter(createEmitter(300, 10, 6)); // bg
    proton.addEmitter(createEmitter(40, 3, 5)); // middle
    proton.addRender(new Proton.SpriteRender(scene));

}
  

function createSprite() {

    let map = new THREE.TextureLoader().load(dot);

    let material = new THREE.SpriteMaterial({
        map: map,
        color: generateThreeColor(),
        blending: THREE.AdditiveBlending,
        fog: true
    });

    return new THREE.Sprite(material);
}
  


function createEmitter(boxSize, particleSize, rate) {

    emitter = new Proton.Emitter();

    emitter.rate = new Proton.Rate(
        new Proton.Span(rate * prng.randomInt(('particles'), 5), rate * balance * prng.randomInt(('particles'), 5)),
        new Proton.Span(0.1, 0.25)
    );

    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(particleSize + (balance * prng.randomInt('particles'), 50)));
    emitter.addInitialize(new Proton.Life(2, 4));
    emitter.addInitialize(new Proton.Body(createSprite()));
    emitter.addInitialize(new Proton.Position(
        new Proton.BoxZone(boxSize * ((0.5 + balance) * prng.randomInt(('particles'), 50)))
    ));
    emitter.addInitialize(
        new Proton.Velocity(200, new Proton.Vector3D(0, 1, 1), 180)
    );

    // //emitter.addBehaviour(new Proton.RandomDrift(30, 30, 30, .05));
    emitter.addBehaviour(new Proton.Rotate("random", "random"));
    emitter.addBehaviour(new Proton.Scale(1, 0.5));
    emitter.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));

    emitter.addBehaviour(
        new Proton.Color(generateThreeColor(), "random", Infinity, Proton.easeOutQuart)
    );

    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();
    return emitter;
}


async function generateRandomCrucible() {

    // Crucible data store for random btn 
    const randomIndex = Math.floor(Math.random() * allCrucibleIds.length); 
    const selectedCrucibleId = allCrucibleIds[randomIndex];

    const url = window.location.href.split('?')[0];
    const newCrucibleData = await getCrucibleData(selectedCrucibleId);
    console.log(newCrucibleData.owner);
    window.location.href = url + "?ownerAddress=" + newCrucibleData.owner;
    
}


async function loadAllCrucibleIds() {
    try {
        allCrucibleIds = await getAllCrucibleIds(); 
        document.getElementById("randomize").addEventListener("click", generateRandomCrucible);
    }
    catch (error) {
        console.log(error); 
        document.getElementById("randomize").background = "#333"; 
    }

}