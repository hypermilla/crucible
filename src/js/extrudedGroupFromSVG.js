
import * as THREE from 'three';
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";


function extrudedGroupFromSVG(resourcePath) 
{
    // instantiate a loader
    const loader = new SVGLoader();

    // load a SVG resource
    loader.load(resourcePath, function ( data ) {
        const paths = data.paths;
        const group = new THREE.Group();

        for ( let i = 0; i < paths.length; i ++ ) {
            const path = paths[ i ];

            const material = new THREE.MeshBasicMaterial( {
                color: path.color,
                side: THREE.DoubleSide,
                depthWrite: false
            } );

            const shapes = path.toShapes( true );

            for ( let j = 0; j < shapes.length; j ++ ) {

                const shape = shapes[ j ];
                const geometry = new THREE.ExtrudeGeometry(shape, {
                    depth: 10,
                    bevelEnabled: false  
                });

                const mesh = new THREE.Mesh( geometry, material );
                group.add( mesh );
            }
        }

        group.scale.y *= -1;
        // const bbox = new THREE.Box3().setFromObject(group); 
        // const bbox_width = bbox.max.x - bbox.min.x;
        // const bbox_height = bbox.max.y - bbox.min.y;
        // group.position.set( - 0.5 * bbox_width, -0.5 * bbox_height, 0 );
        group.position.set(0,0,0);
        console.log(resourcePath, "group position is", group.position);

        return group;
    });
}

export { extrudedGroupFromSVG };