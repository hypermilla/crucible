import * as THREE from 'three';
import { BendModifier } from './modifiers/BendModifier';	

function createText(msg) {
    let loader = new THREE.FontLoader();
    
    loader.load('fonts/syne_mono_regular.json', function (font) {
      let message = msg;
      let geometry = new THREE.TextGeometry(message, {
        font: font,
        size: 10,
        height: 5,
        curveSegments: 1,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelSegments: 1
      });
      let material = new THREE.MeshPhongMaterial({ 
        color: 0xCEE051, 
        overdraw: 0.5,
        shininess: 70
      });
      geometry.center();
      let mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });
}


function createBendedText(string, scene) {

    //modifier.set( direction, axis, angle ).modify( Cube.geometry );

    // scene objects
    var loader = new THREE.FontLoader();
    loader.load( 'fonts/syne_mono_regular.json', function ( response ) {

        const text_geometry = new THREE.TextGeometry( string, 
                {
                    size: 12,
                    height: 1,
                    curveSegments: 32,
                    font: response,
                    style: "normal",
                    bevelEnabled: true,
                    bevelThickness: 0.2, 
                    bevelSize: 0.5, 
                });

        const text_Material = new THREE.MeshPhongMaterial( { color: 0x00AEEF } );

        text_geometry.computeBoundingBox();
        text_geometry.rotateX(Math.PI / 2);
        var direction = new THREE.Vector3( 0, 0, -1 );
        var axis =  new THREE.Vector3( 0, 1, 0 );
        var textWidthBeforeModifier = text_geometry.boundingBox.max.x - text_geometry.boundingBox.min.x;
        var angle = Math.PI / 7;

        let modifier = new BendModifier(); 
        modifier.set( direction, axis, angle ).modify( text_geometry );
        
        var text3D = new THREE.Mesh( text_geometry, text_Material );
        
        text_geometry.computeBoundingBox();
        var text_Width = text_geometry.boundingBox.max.x - text_geometry.boundingBox.min.x;
        
        text3D.position.set( -0.5 * text_Width, -50, 425 );
        console.log("text 3d position is", text3D.position);
        scene.add(text3D);
    } );				
}

export { createText, createBendedText };