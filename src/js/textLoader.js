import * as THREE from 'three';
import { BendModifier } from './modifiers/BendModifier';	

function draw3DCircleText (string, group, radius, center, threeColor) {
  let loader = new THREE.FontLoader();
  
  loader.load('data/syne_mono_regular.json', function (font) {

    const characterCount = string.length; 
    const angleInterval = 2 * Math.PI / characterCount;  
    const material = new THREE.MeshPhongMaterial( {
      color: threeColor,
      emissive: threeColor,
      emissiveIntensity: 1
  } );


    for (let i = 0; i < string.length; i++ ) {

      let geometry = new THREE.TextGeometry(string[i], {
        font: font,
        size: 60,
        height: 10,
        curveSegments: 2,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelSegments: 1
      });

      geometry.center();

      let mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        center.x + (Math.cos(angleInterval * i) * radius),
        center.y,
        center.z + (Math.sin(angleInterval * i) * radius)
      );
      
      mesh.lookAt(center);
      mesh.rotateY(Math.PI);
      
      group.add(mesh);
    }
  });
}

function draw3DText(string, scene) {
    let loader = new THREE.FontLoader();
    
    loader.load('data/syne_mono_regular.json', function (font) {

      let geometry = new THREE.TextGeometry(string, {
        font: font,
        size: 32,
        height: 5,
        curveSegments: 1,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1,
        bevelSegments: 1
      });
      let material = new THREE.MeshPhongMaterial({ 
        color: 0xffffff
      });
      geometry.center();
      
      let mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    });
}


function draw3DBendedText(string, scene) {

    //modifier.set( direction, axis, angle ).modify( Cube.geometry );

    // scene objects
    var loader = new THREE.FontLoader();
    loader.load( 'data/syne_mono_regular.json', function ( response ) {

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
        scene.add(text3D);
    } );				
}

export { draw3DCircleText, draw3DText, draw3DBendedText };