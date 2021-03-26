import * as THREE from "three";

export let circles = {
    top: [
        {
            path: "data/smallerOuterCircle.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/innerCircle.svg",
            yOffset: 0,
            rotationSpeed: 0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/sideCircles.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/triangleCircles.svg",
            yOffset: 0,
            rotationSpeed: 0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path:  "data/triangleWithCircles.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        }  
    ],
    center: [
        {
            path:  "data/innerLines.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/star.svg",
            yOffset: 0,
            rotationSpeed: 0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/square.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/starWithCircle.svg",
            yOffset: 0,
            rotationSpeed: 0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },

    ],
    bottom: [
        { 
            path: "data/outerCircle.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/doubleStarCircle.svg",
            yOffset: 0,
            rotationSpeed: 0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/hexagonCircleBigger.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/starHexagon.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        },
        {
            path: "data/hexagonCircle.svg",
            yOffset: 0,
            rotationSpeed: -0.001,
            movementSpeed: 0.1,
            meshGroup: new THREE.Group(),
            addedToScene: false
        }
    ]
}
