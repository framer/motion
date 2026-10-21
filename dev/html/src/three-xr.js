import { animate, cancelFrame, frame, processFrame } from "motion"
import { threeEffect } from "motion/three"
import * as THREE from "three"
import { VRButton } from "three/addons/webxr/VRButton.js"
import "./gpu-adapters.css"

animate.addEffect(threeEffect)

const canvas = document.querySelector("canvas")
const status = document.querySelector("#status")
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)

renderer.xr.enabled = true
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setClearColor("#09090b")
camera.position.set(0, 1.6, 1.5)
scene.add(new THREE.HemisphereLight("#c4b5fd", "#111827", 3))

const material = new THREE.MeshStandardMaterial({ color: "#8b5cf6" })
const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), material)
mesh.position.set(0, 1.5, -1)
scene.add(mesh)

const bounce = () => {
    animate(
        mesh,
        { scaleX: [1.5, 1], scaleY: [1.5, 1], scaleZ: [1.5, 1] },
        { type: "spring", bounce: 0.5 }
    )
    animate(
        mesh,
        { rotateY: mesh.rotation.y + Math.PI / 2 },
        { type: "spring" }
    )
    status.textContent = renderer.xr.isPresenting
        ? "Bounced from the XR session's frame loop"
        : "Bounced from requestAnimationFrame"
}

document.querySelector("#bounce").addEventListener("click", bounce)
renderer.xr.getController(0).addEventListener("select", bounce)

function resize() {
    if (renderer.xr.isPresenting) return
    const { clientWidth, clientHeight } = canvas
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
}

/**
 * Outside a session, Motion's own loop renders the scene once per frame,
 * after it's written this frame's values.
 */
const render = () => renderer.render(scene, camera)
const renderOutsideXR = () => renderer.xr.isPresenting || render()
frame.render(renderOutsideXR, true)

/**
 * In an immersive session, window.requestAnimationFrame may stop firing
 * (e.g. on Meta Quest), and an XR frame can only be drawn from the session's
 * own loop. Three.js hands its loop to XRSession.requestAnimationFrame when
 * a session starts, so process Motion's frame there and render after it.
 */
renderer.setAnimationLoop((timestamp) => {
    if (!renderer.xr.isPresenting) return
    processFrame(timestamp)
    render()
})

resize()
new ResizeObserver(resize).observe(canvas)

if (navigator.xr) {
    document.querySelector(".controls").append(VRButton.createButton(renderer))
}

window.addEventListener("pagehide", () => {
    cancelFrame(renderOutsideXR)
    renderer.setAnimationLoop(null)
    mesh.geometry.dispose()
    material.dispose()
    renderer.dispose()
})
