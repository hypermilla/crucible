import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './js/UnrealBloomPass.js';
import getCrucibleDataForAccount from "./crucibleData/getCrucibleDataForAccount";
import PRNG from "./js/PRNG"; 


// Get crucible data from ethereum
// Generate variables based on data
// Change CSS background color 
// Draw crucible meshes 
// Animation loop 


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

//circle parts
const outerCircleSVG = 'data/outerCircle.svg';
const innerLinesSVG = 'data/innerLines.svg';
const innerCircleSVG = 'data/innerCircle.svg';
const sideCirclesSVG = 'data/sideCircles.svg';
const triangleCirclesSVG = 'data/triangleCircles.svg';
const smallerOuterCircleSVG = 'data/smallerOuterCircle.svg';

const outerCircle = new THREE.Group();
const innerLines = new THREE.Group();
const innerCircle = new THREE.Group();
const sideCircles = new THREE.Group();
const triangleCircles = new THREE.Group();
const smallerOuterCircle = new THREE.Group();

let glowMaterial = new THREE.SpriteMaterial();

const innerCircleY = 0;
const innerLinesY = -100
const outerCircleY = -50
const sideCirclesY = 50;
const triangleCirclesY = 100; 
const smOuterCircleY = -150;

const outerCircleModifier = 0.2; 
const innerCircleModifier = 0.5;
const innerLinesModifier = 0.2; 
const sideCirclesModifier = 0.3;
const triangleCirclesModifier = 0.4; 
const smOuterCircleModifier = 0.45; 

// Owner address
const account = "0x22FbD6248cB2837900c3fe69f725bc02Dd3A3B33"; 

// Testing Getting Crucible Data 
const getCrucibleData = async () => {
    try { 
        crucibleData =  await getCrucibleDataForAccount(account);
        crucibleData = crucibleData[0];
        console.log(crucibleData);
        generateCrucible(crucibleData); 
    }
    catch(err) {
        console.log("Not able to get Crucible data");
        throw err;
    }
}

getCrucibleData(); 

function generateCrucible(crucibleData) 
{
    balance = logBaseN(2, ((crucibleData.lockedBalance.div(1e9).toNumber()) / 1e9) + 1);
    console.log("Balance scaled:", balance);
    const numColors = 3 * Math.floor(balance);
    console.log("Number of colors", numColors);

    prng = new PRNG(crucibleData.id);
    mainHues = [];
	let hueCount = 3 + prng.randomInt('colors', numColors);
	while (hueCount) {
		hueCount--;
		mainHues.push(160 + prng.randomInt('colors', 120));
	}

    document.body.style.background = "radial-gradient(circle, " + generateHSLColor() + "0%, " + generateHSLColor() + " 100%)"; 

    init();
    animate(); 
}

function generateRGBAColor() {
    const r = prng.randomInt('colors', 255);
    const g = prng.randomInt('colors', 255);
    const b = prng.randomInt('colors', 255);
    const rgbColor = "rgba(" + r + "," + g + "," + b + ", 1)";
    console.log("gradient color", rgbColor);
    return rgbColor;
}

function generateHSLColor() { 
    const h = Math.floor((60 / (1 + balance)) * (0.5 - prng.randomFloat('colors')));
    const s = Math.floor(60 + (5 * balance) + Math.min(prng.randomInt('colors', 100), 100));
    const l = Math.floor(30 + (5 * balance) + Math.min(prng.randomInt('colors', 10), 50));
    const hslColor = "hsl(" + h + "%, " + s + "&, " + l + "%)";
    console.log("gradient color", hslColor);
}

function generateColor() {
    hueJitter = Math.floor((60 / (1 + balance)) * (0.5 - prng.randomFloat('colors')));
    hueBase = mainHues[prng.randomInt('colors', mainHues.length)];
    saturation = Math.floor(60 + (5 * balance) + Math.min(prng.randomInt('colors', 100), 100));
    lightness = Math.floor(30 + (5 * balance) + Math.min(prng.randomInt('colors', 10), 50));
    color = `hsl(${hueBase + hueJitter}, ${saturation}%, ${lightness}%)`;
    console.log("three color", color);
    return new THREE.Color(color);
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

    // Ambient Light
    const light = new THREE.AmbientLight( 0x32254C, 2 ); 
    scene.add( light );

    const targetObj = new THREE.Object3D();
    targetObj.position.set(0,0,0);
    scene.add(targetObj);

    // spotlight from the top 
    const spotLightTop = new THREE.SpotLight( 0x4ECECE, 0.5);
    spotLightTop.position.set( 0, 1000, 0 );
    spotLightTop.target = targetObj;
   // scene.add( spotLightTop );

    // spotlight bot 
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

    // bloomPass.clear = false; 
    // bloomPass.renderToScreen = false; 
    // bloomPass.oldClearAlpha = 0;
    // renderScene.clearColor = new THREE.Color(0,0,0);
    // renderScene.clearAlpha = 0;
    // renderScene.renderToScreen = false;
    // renderScene.clear = false; 

    var width = window.innerWidth || 1;
    var height = window.innerHeight || 1;
    var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
    var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

    composer = new EffectComposer( renderer, renderTarget );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );

    drawAlchemyCircles(); 
    window.addEventListener("resize", onWindowResize);
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
    requestAnimationFrame(animate);
    controls.update(); 
    render(); 
}

function render() {
    
    innerLines.rotation.z -= 0.003;
    triangleCircles.rotation.z += 0.004;
    outerCircle.rotation.z += 0.004;
    sideCircles.rotation.z += 0.002;
    smallerOuterCircle.rotation.z += 0.003;
    
    angle += speed; 
    outerCircle.position.setY(outerCircleY + Math.sin(angle) * range * outerCircleModifier);
    innerCircle.position.setY(innerCircleY + Math.sin(angle) * range * innerCircleModifier);
    innerLines.position.setY(innerLinesY + Math.sin(angle) * range * innerLinesModifier);
    triangleCircles.position.setY(triangleCirclesY + Math.sin(angle) * range * triangleCirclesModifier);
    sideCircles.position.setY(sideCirclesY + Math.sin(angle) * range * sideCirclesModifier);
    smallerOuterCircle.position.setY(smOuterCircleY + Math.sin(angle) * range * smOuterCircleModifier);

    composer.render();

}

function drawAlchemyCircles() {
    // REFACTOR LATER TO MAKE IT PROCEDURAL DEPENDING ON CRUCIBLE DATA
    extrudedGroupFromSVG(outerCircleSVG, outerCircle, outerCircleY, generateColor()); 
    outerCircle.castShadow = true;
    scene.add(outerCircle);
    extrudedGroupFromSVG(innerLinesSVG, innerLines, innerLinesY, generateColor());
    innerLines.castShadow = true;
    scene.add(innerLines);
    extrudedGroupFromSVG(innerCircleSVG, innerCircle, innerCircleY, generateColor());
    innerCircle.castShadow = true;
    scene.add(innerCircle);
    extrudedGroupFromSVG(sideCirclesSVG, sideCircles, sideCirclesY, generateColor());
    sideCircles.castShadow = true;
    scene.add(sideCircles);
    extrudedGroupFromSVG(triangleCirclesSVG, triangleCircles, triangleCirclesY, generateColor());
    triangleCircles.castShadow = true;
    scene.add(triangleCircles);
    extrudedGroupFromSVG(smallerOuterCircleSVG, smallerOuterCircle, smOuterCircleY, generateColor()); 
    smallerOuterCircle.castShadow = true;
    scene.add(smallerOuterCircle);
}

function extrudedGroupFromSVG(resourcePath, group, offsetY, threeColor, glowGroup) 
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