
import * as THREE from 'three';
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

function extrudeGroupFromSVG(resourcePath, group, offsetY, threeColor) 
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
                emissiveIntensity: 1.5
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
        group.rotation.y = 0;
    });
}

export { extrudeGroupFromSVG };