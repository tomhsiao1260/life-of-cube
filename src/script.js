import './style.css'
import * as THREE from 'three'
import Stats from 'stats.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

import solidVertexShader from './shaders/solid/vertex.glsl'
import solidFragmentShader from './shaders/solid/fragment.glsl'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'
import heartVertexShader from './shaders/heart/vertex.glsl'
import heartFragmentShader from './shaders/heart/fragment.glsl'

// Scene
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// Load texture for particles
const TextureLoader = new THREE.TextureLoader();
const spotTexture = TextureLoader.load( './textures/spot.png' )

// FPS meter
const stats = new Stats()
stats.showPanel(0)
// document.body.appendChild(stats.dom)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Parameters
const parameters = {
    width: 0.5,  // size of geometry
    speed: 1,    // progress speed
    step: 6,     // number of splits
    size: 10,    // particle size
    counts: 30,  // particles number along one side
    nHeart: 100, // heart particles number
}

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// ############################################################### //
// #######################   Solid Part   ######################## //
// ############################################################### //

const width = parameters.width

// Material
const solidMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    vertexShader: solidVertexShader,
    fragmentShader: solidFragmentShader,
    uniforms:
    {
        uTime:  { value: 0 },
        uWidth: { value: parameters.width },
        uStep:  { value: parameters.step },
    }
})

// Geometry
const solidGeometry = new THREE.BoxGeometry(width, width, width, 50, 50, 50)

// Mesh
const solid = new THREE.Mesh(solidGeometry, solidMaterial)
scene.add(solid)

// ############################################################### //
// ####################   Particles Part   ####################### //
// ############################################################### //

const counts = parameters.counts

// Material
const particlesMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uTime:    { value: 0 },
        uWidth:   { value: parameters.width },
        uStep:    { value: parameters.step },
        uSize:    { value: parameters.size * renderer.getPixelRatio() },
        uTexture: { value: spotTexture },
    }
})

// Geometry
const particlesGeometry = new THREE.BufferGeometry()

// Use BoxGeometry position, UV attributes on our particles geometry
const cube = new THREE.BoxGeometry(width, width, width, counts, counts, counts)
particlesGeometry.attributes.position = cube.attributes.position
particlesGeometry.attributes.uv = cube.attributes.uv

// Set 1 random value for each vertex
const particlesCount = particlesGeometry.attributes.position.count;
const particlesRandom = new Float32Array(particlesCount * 1)
particlesRandom.forEach( (value, i) => particlesRandom[i] = Math.random())
particlesGeometry.setAttribute('aRandomness', new THREE.BufferAttribute(particlesRandom, 1))

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// ############################################################### //
// ######################   Heart Part   ######################### //
// ############################################################### //

// Material
const heartMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: heartVertexShader,
    fragmentShader: heartFragmentShader,
    uniforms:
    {
        uTime:    { value: 0 },
        uWidth:   { value: parameters.width },
        uStep:    { value: parameters.step },
        uSize:    { value: 1.0 * parameters.size * renderer.getPixelRatio() },
        uTexture: { value: spotTexture },
    }
})

// Geometry
const heartGeometry = new THREE.BufferGeometry()

// particles number
const heartCount = parameters.nHeart 
// Original position for each vertex (all set to 0)
const heartPosition = new Float32Array(heartCount * 3)
// Set 3 random values for each vertex
const heartRandom = new Float32Array(heartCount * 3)
// Color for each vertex
const heartColor = new Float32Array(heartCount * 3)

heartPosition.forEach( (value, i) => heartPosition[i] = 0)
heartRandom.forEach( (value, i) => heartRandom[i] = Math.random())
heartColor.forEach( (value, i) => {
    switch ( i % 3 ) {
        case 0: heartColor[i] = Math.random() * 0.5;       break // red
        case 1: heartColor[i] = Math.random() * 0.5;       break // green
        case 2: heartColor[i] = Math.random() * 0.5 + 0.5; break // blue
    }
})

heartGeometry.setAttribute('position', new THREE.BufferAttribute(heartPosition, 3))
heartGeometry.setAttribute('aRandomness', new THREE.BufferAttribute(heartRandom, 3))
heartGeometry.setAttribute('color', new THREE.BufferAttribute(heartColor, 3))

// Points
const heart = new THREE.Points(heartGeometry, heartMaterial)
scene.add(heart)

// RWD
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    cameraPosition(camera)

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Fullscreen
window.addEventListener('dblclick', () => {
    if(!document.fullscreenElement){ canvas.requestFullscreen() }
    else { document.exitFullscreen() }
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

const cameraPosition = (camera) => {
    switch (sizes.width > 768)  {
        case false: camera.position.set(0.325, -0.325, 1.3); break  // Mobile
        case true: camera.position.set(0.25, -0.25, 1);      break  // Desktop
    }
}
cameraPosition(camera)
scene.add(camera)

// Controls
const controls = new TrackballControls( camera, canvas )
controls.rotateSpeed = 2.0
controls.dynamicDampingFactor = 0.1

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Desktop
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})
// Mobile
window.addEventListener('touchstart', (event) => {
    mouse.x = event.touches[0].clientX / sizes.width * 2 - 1
    mouse.y = - (event.touches[0].clientY / sizes.height) * 2 + 1
})

const heartSpeed = (sizes.width > 768) ? 0.01 : 0.05

// Animate
const clock = new THREE.Clock()
const tick = () => {
    stats.begin()
    const elapsedTime = clock.getElapsedTime()

    // make heart particles follow the mouse
    raycaster.setFromCamera(mouse, camera)
    const ray = raycaster.ray.direction
    // heart movement according to raycaster ( need some vector calculations )
    const heartMove = camera.position.clone()
                                     .add( ray.normalize() )
                                     .sub( solid.position )
                                     .normalize()
                                     .multiplyScalar( parameters.width/2.5 )
                                     .sub( heart.position )
                                     .multiplyScalar( heartSpeed )
    heart.position.add( heartMove )

    controls.update()
    renderer.render(scene, camera)

    solidMaterial.uniforms.uTime.value = elapsedTime * parameters.speed / Math.PI
    particlesMaterial.uniforms.uTime.value = elapsedTime * parameters.speed / Math.PI
    heartMaterial.uniforms.uTime.value = elapsedTime * parameters.speed / Math.PI

    solid.rotation.z = elapsedTime * 0.01;
    solid.rotation.y = elapsedTime * -0.03;
    particles.rotation.z = elapsedTime * 0.01;
    particles.rotation.y = elapsedTime * -0.03;

    window.requestAnimationFrame(tick)
    stats.end()
}
tick()