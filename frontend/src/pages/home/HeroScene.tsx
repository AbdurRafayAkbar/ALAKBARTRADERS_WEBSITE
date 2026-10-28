import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Three.js backdrop for the hero: grains of rice tumbling slowly through the
// dark green, with gold dust between them. The camera leans toward the
// pointer. Loaded lazily, and only when WebGL works and motion is allowed.
export default function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const css = getComputedStyle(host)
    const colour = (name: string, fallback: string) => new THREE.Color(css.getPropertyValue(name).trim() || fallback)
    const cream = colour('--color-primary-50', '#edf5f0')
    const gold = colour('--color-accent', '#caa753')
    const deep = colour('--color-primary-900', '#035a3a')

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(deep, 8, 22)
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50)
    camera.position.set(0, 0, 12)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 6, 8)
    scene.add(key)
    const rim = new THREE.PointLight(gold, 30, 30)
    rim.position.set(-6, -3, 4)
    scene.add(rim)

    // Rice: one stretched sphere drawn many times (instancing keeps it to one draw call).
    const small = window.innerWidth < 768
    const count = small ? 380 : 900
    const grainGeo = new THREE.SphereGeometry(0.09, 10, 8)
    grainGeo.scale(1, 3.2, 1)
    const grainMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.05 })
    const grains = new THREE.InstancedMesh(grainGeo, grainMat, count)
    const seeds = Array.from({ length: count }, () => ({
      pos: new THREE.Vector3((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 12),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      spin: (Math.random() - 0.5) * 0.6,
      fall: 0.12 + Math.random() * 0.35,
      sway: Math.random() * Math.PI * 2,
    }))
    const tint = new THREE.Color()
    seeds.forEach((_, i) => grains.setColorAt(i, tint.copy(cream).lerp(gold, Math.random() < 0.18 ? 0.85 : Math.random() * 0.15)))
    scene.add(grains)

    // Gold dust.
    const dustCount = small ? 250 : 600
    const dustPos = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount * 3; i++) dustPos[i] = (Math.random() - 0.5) * (i % 3 === 2 ? 10 : 24)
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dustMat = new THREE.PointsMaterial({ color: gold, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false })
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host
      if (!w || !h) return
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const sizer = new ResizeObserver(resize)
    sizer.observe(host)
    resize()

    const pointer = { x: 0, y: 0 }
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    // Pause when the hero is off screen or the tab is hidden.
    let visible = true
    const watcher = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    watcher.observe(host)

    const matrix = new THREE.Matrix4()
    const quat = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    const clock = new THREE.Clock()
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      if (!visible || document.hidden) return
      const t = clock.elapsedTime
      seeds.forEach((s, i) => {
        s.pos.y -= s.fall * dt
        s.pos.x += Math.sin(t * 0.6 + s.sway) * 0.004
        if (s.pos.y < -7.5) s.pos.y = 7.5
        s.rot.x += s.spin * dt
        s.rot.z += s.spin * 0.7 * dt
        matrix.compose(s.pos, quat.setFromEuler(s.rot), scale)
        grains.setMatrixAt(i, matrix)
      })
      grains.instanceMatrix.needsUpdate = true
      dust.rotation.y = t * 0.02
      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.04
      camera.position.y += (-pointer.y * 0.9 - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      sizer.disconnect()
      watcher.disconnect()
      window.removeEventListener('pointermove', onPointer)
      grainGeo.dispose()
      grainMat.dispose()
      grains.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={hostRef} aria-hidden className="absolute inset-0" />
}
