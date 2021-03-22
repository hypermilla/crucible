import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls' 
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

let camera, scene, renderer, controls; 
let angle = 0; 
let speed = 0.003; 
let range = 100; 

//circle parts
const outerCircleSVG = 'svg/outerCircle.svg';
const innerLinesSVG = 'svg/innerLines.svg';
const innerCircleSVG = 'svg/innerCircle.svg';
const sideCirclesSVG = 'svg/sideCircles.svg';
const triangleCirclesSVG = 'svg/triangleCircles.svg';
const smallerOuterCircleSVG = 'svg/smallerOuterCircle.svg';

const outerCircle = new THREE.Group();
const innerLines = new THREE.Group();
const innerCircle = new THREE.Group();
const sideCircles = new THREE.Group();
const triangleCircles = new THREE.Group();
const smallerOuterCircle = new THREE.Group();

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
const triangleCirclesModifier = 0.2; 
const smOuterCircleModifier = 0.2; 

init(); 
animate(); 

function init() 
{
    scene = new THREE.Scene();

    // CIRCLE 
    extrudedGroupFromSVG(outerCircleSVG, outerCircle, outerCircleY); 
    outerCircle.castShadow = true;
    scene.add(outerCircle);
    extrudedGroupFromSVG(innerLinesSVG, innerLines, innerLinesY);
    innerLines.castShadow = true;
    scene.add(innerLines);
    extrudedGroupFromSVG(innerCircleSVG, innerCircle, innerCircleY);
    innerCircle.castShadow = true;
    scene.add(innerCircle);
    extrudedGroupFromSVG(sideCirclesSVG, sideCircles, sideCirclesY);
    sideCircles.castShadow = true;
    scene.add(sideCircles);
    extrudedGroupFromSVG(triangleCirclesSVG, triangleCircles, triangleCirclesY);
    triangleCircles.castShadow = true;
    scene.add(triangleCircles);
    extrudedGroupFromSVG(smallerOuterCircleSVG, smallerOuterCircle, smOuterCircleY); 
    smallerOuterCircle.castShadow = true;
    scene.add(smallerOuterCircle);

    // Ambient Light
    const light = new THREE.AmbientLight( 0x32254C, 2 ); 
    scene.add( light );

    const targetObj = new THREE.Object3D();
    targetObj.position.set(0,0,0);
    scene.add(targetObj);

    // spotlight from the top 
    const spotLightTop = new THREE.SpotLight( 0x4ECECE, 1.2);
    spotLightTop.position.set( 0, 1000, 0 );
    spotLightTop.target = targetObj;
    scene.add( spotLightTop );

    // spotlight bot 
    const spotlightBot = new THREE.SpotLight( 0xB078FF, 1);
    spotlightBot.position.set( 0, -1000, 0 );
    spotlightBot.target = targetObj;
    scene.add( spotlightBot );

    // CAMERA
    camera = new THREE.PerspectiveCamera(
        100,                                   // Field of view
        window.innerWidth/window.innerHeight, // Aspect ratio
        0.05,                                  // Near clipping pane
        4000                                  // Far clipping pane
    );
    camera.position.set(20,600,-400);
    camera.lookAt(new THREE.Vector3(0,0,0));

    // RENDERER 
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 0 );
    document.body.appendChild( renderer.domElement );

    // RENDER FINAL SCENE
    renderer.render( scene, camera );

    // INTERACTIVE CONTROLS 
    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 500;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;
    
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

    renderer.render( scene, camera );
}

function extrudedGroupFromSVG(resourcePath, group, offsetY) 
{
    // instantiate a loader
    const loader = new SVGLoader();

    // load a SVG resource
    loader.load(resourcePath, function ( data ) {
        const paths = data.paths;

        for ( let i = 0; i < paths.length; i ++ ) {
            const path = paths[ i ];

            const material = new THREE.MeshPhongMaterial( {
                color: 0x27A0E2
            } );

            const shapes = path.toShapes( true );

            for ( let j = 0; j < shapes.length; j ++ ) {

                const shape = shapes[ j ];
                const geometry = new THREE.ExtrudeGeometry(shape, {
                    steps: 3,
                    depth: 5,
                    bevelEnabled: true,
                    bevelThickness: 1,
                    bevelSize: 1, 
                    bevelOffset: 0,
                    bevelSegments: 3
                });

                const mesh = new THREE.Mesh( geometry, material );
                group.add( mesh );
            }
        }

        group.scale.y *= -1;
        group.position.set(0,offsetY,0);
        group.rotateX(Math.PI / 2);
    });
}