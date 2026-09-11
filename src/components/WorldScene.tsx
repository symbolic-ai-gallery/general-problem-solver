import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
type Props = {
  state: string[];
  frameId: string;
  action?: string;
  paused: boolean;
  speed: number;
  dark: boolean;
  onComplete: (id: string) => void;
  cameraReset: number;
  cameraKind: string;
};
type Pose = {
  x: number;
  y: number;
  chair: number;
  ball: number;
  bananas: number;
  eaten: number;
};
const poseFor = (state: string[]): Pose => ({
  x: state.includes("at door") ? -3.7 : state.includes("on chair") ? 0 : -0.65,
  y: state.includes("on chair") ? 1.25 : 0,
  chair: state.includes("chair at door") ? -3 : 0,
  ball: state.includes("has ball") ? 1 : 0,
  bananas: state.includes("has bananas") ? 1 : 0,
  eaten: state.includes("not hungry") ? 1 : 0,
});
export default function WorldScene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    latest = useRef(props);
  latest.current = props;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (failed) props.onComplete(props.frameId);
  }, [failed, props.frameId, props.onComplete]);
  useEffect(() => {
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }
    const mount = host.current!;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-7, 7, 5.6, -5.6, 0.1, 100);
    camera.position.set(12, 11, 15);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.7, 2.0, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minZoom = 0.7;
    controls.maxZoom = 2.2;
    controls.maxPolarAngle = Math.PI / 2.1;
    const ambient = new THREE.HemisphereLight(0xffffff, 0x8a8791, 2);
    scene.add(ambient);
    const light = new THREE.DirectionalLight(0xffffff, 2.8);
    light.position.set(-5, 12, 8);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    Object.assign(light.shadow.camera, {
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
      far: 40,
    });
    light.shadow.normalBias = 0.04;
    scene.add(light);
    const mats: THREE.Material[] = [],
      geos: THREE.BufferGeometry[] = [];
    const mat = (color: string, roughness = 0.7) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness });
      mats.push(m);
      return m;
    };
    const stone = mat("#dedbdf"),
      wallMat = mat("#e7e5e8"),
      fur = mat("#ad8266"),
      face = mat("#dec5a5"),
      wood = mat("#817594"),
      yellow = mat("#e6bb4b"),
      blue = mat("#678cb1"),
      black = mat("#25272d");
    function mesh(
      geo: THREE.BufferGeometry,
      m: THREE.Material,
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
    ) {
      geos.push(geo);
      const o = new THREE.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    }
    const box = (
      w: number,
      h: number,
      d: number,
      m: THREE.Material,
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
    ) => mesh(new THREE.BoxGeometry(w, h, d), m, parent, x, y, z);
    const ball = (
      r: number,
      m: THREE.Material,
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
    ) => mesh(new THREE.SphereGeometry(r, 20, 14), m, parent, x, y, z);
    box(10, 0.25, 7, stone, scene, -0.5, -0.15, 0);
    box(10, 4.5, 0.12, wallMat, scene, -0.5, 2.1, -3.5);
    const doorMat = mat("#b1a9b9");
    box(1.7, 3.1, 0.14, doorMat, scene, -3.6, 1.5, -3.38);
    ball(0.08, black, scene, -3.0, 1.4, -3.25);
    const chair = new THREE.Group();
    scene.add(chair);
    box(1.55, 0.18, 1.5, wood, chair, 0, 1.15, 0);
    for (const x of [-0.58, 0.58])
      for (const z of [-0.56, 0.56])
        box(0.13, 1.1, 0.13, wood, chair, x, 0.52, z);
    box(1.55, 1.0, 0.13, wood, chair, 0, 1.7, -0.67);
    const monkey = new THREE.Group();
    scene.add(monkey);
    const body = mesh(
      new THREE.CapsuleGeometry(0.35, 0.55, 6, 14),
      fur,
      monkey,
      0,
      1.08,
      0,
    );
    body.scale.z = 0.8;
    ball(0.45, fur, monkey, 0, 1.92, 0);
    ball(0.31, face, monkey, 0, 1.85, 0.29);
    for (const x of [-0.45, 0.45]) ball(0.19, fur, monkey, x, 1.97, 0);
    for (const x of [-0.12, 0.12]) ball(0.042, black, monkey, x, 1.97, 0.57);
    const leftHand = ball(0.13, fur, monkey, -0.49, 1.03, 0.23),
      rightHand = ball(0.13, fur, monkey, 0.49, 1.03, 0.23);
    const arms = [-1, 1].map((side) => ({
      shoulder: new THREE.Vector3(side * 0.37, 1.52, 0.1),
      upper: mesh(
        new THREE.CylinderGeometry(0.105, 0.105, 1, 10),
        fur,
        monkey,
        0,
        0,
        0,
      ),
      lower: mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 1, 10),
        fur,
        monkey,
        0,
        0,
        0,
      ),
      elbow: ball(0.115, fur, monkey, 0, 0, 0),
    }));
    const axis = new THREE.Vector3(0, 1, 0);
    function bone(link: THREE.Mesh, start: THREE.Vector3, end: THREE.Vector3) {
      const direction = end.clone().sub(start);
      link.position.copy(start).add(end).multiplyScalar(0.5);
      link.scale.y = direction.length();
      link.quaternion.setFromUnitVectors(axis, direction.normalize());
    }
    function articulate() {
      arms.forEach((arm, i) => {
        const wrist = [leftHand, rightHand][i].position;
        const direction = wrist.clone().sub(arm.shoulder),
          length = direction.length();
        const perpendicular = new THREE.Vector3()
          .crossVectors(direction, new THREE.Vector3(0, 0, 1))
          .normalize();
        const elbow = arm.shoulder
          .clone()
          .add(wrist)
          .multiplyScalar(0.5)
          .addScaledVector(
            perpendicular,
            (i === 0 ? -1 : 1) *
              Math.sqrt(Math.max(0, 0.65 ** 2 - (length / 2) ** 2)),
          );
        arm.elbow.position.copy(elbow);
        bone(arm.upper, arm.shoulder, elbow);
        bone(arm.lower, elbow, wrist);
      });
    }
    for (const x of [-0.22, 0.22]) {
      mesh(
        new THREE.CapsuleGeometry(0.13, 0.48, 4, 10),
        fur,
        monkey,
        x,
        0.39,
        0,
      );
      ball(0.18, fur, monkey, x, 0.12, 0.13);
    }
    const tail = mesh(
      new THREE.TorusGeometry(0.43, 0.07, 8, 24, Math.PI * 1.4),
      fur,
      monkey,
      0,
      0.8,
      -0.4,
    );
    tail.rotation.y = Math.PI / 2;
    const toy = ball(0.24, blue, scene, -3.2, 1.1, 0.28);
    const bananas = new THREE.Group();
    scene.add(bananas);
    for (let i = 0; i < 3; i++) {
      const banana = mesh(
        new THREE.TorusGeometry(0.3, 0.065, 8, 20, Math.PI * 0.9),
        yellow,
        bananas,
        (i - 1) * 0.14,
        0,
        0,
      );
      banana.rotation.z = 0.2 + i * 0.3;
      banana.rotation.y = i * 0.4;
    }
    const string = mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 1.3, 6),
      mat("#aaa2ac"),
      scene,
      0,
      4.6,
      0,
    );
    const resize = () => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height);
      camera.left = (-5.6 * r.width) / r.height;
      camera.right = (5.6 * r.width) / r.height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    let current = poseFor(latest.current.state),
      from = { ...current },
      to = { ...current },
      elapsed = 0,
      frameId = "",
      completed = false,
      previous = performance.now(),
      raf = 0,
      reset = -1,
      dropX = -0.05;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    function render(now: number) {
      raf = requestAnimationFrame(render);
      const p = latest.current,
        dt = Math.min(80, now - previous);
      previous = now;
      if (p.frameId !== frameId) {
        frameId = p.frameId;
        from = { ...current };
        to = poseFor(p.state);
        if (from.ball > 0.9 && to.ball === 0) dropX = from.x + 0.52;
        elapsed = 0;
        completed = false;
      }
      if (!p.paused && !completed) elapsed += dt * p.speed;
      const t = Math.min(1, elapsed / (reduced.matches ? 150 : 1050)),
        s = t * t * t * (t * (t * 6 - 15) + 10);
      for (const k of Object.keys(current) as (keyof Pose)[])
        current[k] = from[k] + (to[k] - from[k]) * s;
      monkey.position.set(current.x, current.y, 0.4);
      if (to.y !== from.y && !reduced.matches)
        monkey.position.z += Math.sin(Math.PI * s) * 0.25;
      chair.position.x = current.chair;
      const moving = Math.abs(to.x - from.x) > 0.2;
      monkey.rotation.z = moving
        ? Math.sin(t * Math.PI * 6) * 0.025 * (1 - s)
        : 0;
      const grabbing =
        p.action === "grasp bananas" && to.bananas === 1 && from.bananas < 0.5;
      const eating = p.action === "eat bananas" && from.bananas > 0.5;
      const gesture = Math.sin(t * Math.PI);
      rightHand.position.set(0.49, 1.03, 0.23);
      if (grabbing)
        rightHand.position.set(
          0.49 * (1 - gesture),
          1.03 + 1.62 * gesture,
          0.23 - 0.63 * gesture,
        );
      if (eating)
        rightHand.position.set(
          0.49 * (1 - gesture),
          1.03 + 0.82 * gesture,
          0.23 + 0.07 * gesture,
        );
      leftHand.position.z = p.action?.startsWith("push chair") ? 0.5 : 0.23;
      articulate();
      toy.position.set(
        current.ball > 0.001 ? current.x + 0.52 : dropX,
        0.25 + current.ball * (current.y + 0.85),
        0.65,
      );
      if (p.action === "drop ball" && from.ball > 0.9) {
        const fall = Math.min(1, Math.max(0, (t - 0.15) / 0.7));
        toy.position.set(
          dropX,
          0.25 + (from.y + 0.85) * (1 - fall * fall),
          0.65,
        );
      }
      bananas.position.set(
        (current.x + 0.49) * current.bananas,
        3.9 * (1 - current.bananas) + (current.y + 1.03) * current.bananas,
        0.63 * current.bananas,
      );
      bananas.scale.setScalar(Math.max(0.001, 1 - current.eaten));
      if (grabbing) {
        if (t < 0.5) bananas.position.set(0, 3.9, 0);
        else bananas.position.copy(rightHand.position).add(monkey.position);
      }
      if (eating) {
        const mouth = Math.min(1, t * 2),
          easing = mouth * mouth * (3 - 2 * mouth);
        bananas.position.set(
          current.x + 0.49 * (1 - easing),
          current.y + 1.03 + 0.82 * easing,
          0.63 + 0.07 * easing,
        );
        bananas.scale.setScalar(Math.max(0.001, 1 - Math.max(0, t - 0.5) * 2));
      }
      string.visible = current.bananas < 0.01 && current.eaten < 0.01;
      if (reset !== p.cameraReset) {
        reset = p.cameraReset;
        if (p.cameraKind === "reset") {
          camera.position.set(12, 11, 15);
          camera.zoom = 1;
          controls.target.set(-0.7, 2.0, 0);
        } else if (p.cameraKind === "in" || p.cameraKind === "out")
          camera.zoom = THREE.MathUtils.clamp(
            camera.zoom * (p.cameraKind === "in" ? 1.2 : 1 / 1.2),
            0.7,
            2.2,
          );
        else {
          const offset = camera.position
            .clone()
            .sub(controls.target)
            .applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              p.cameraKind === "left" ? 0.25 : -0.25,
            );
          camera.position.copy(controls.target).add(offset);
        }
        camera.updateProjectionMatrix();
      }
      stone.color.set(p.dark ? "#34333e" : "#dedbdf");
      wallMat.color.set(p.dark ? "#292832" : "#e7e5e8");
      ambient.intensity = p.dark ? 1.6 : 2;
      light.intensity = p.dark ? 2.2 : 2.8;
      controls.update();
      renderer.render(scene, camera);
      if (t === 1 && !completed) {
        completed = true;
        const done = frameId;
        queueMicrotask(() => latest.current.onComplete(done));
      }
    }
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      className="world-canvas"
      ref={host}
      role="img"
      aria-label="Monkey, chair, ball and bananas in a three-dimensional room"
    >
      {failed && <p className="canvas-error">WebGL 不可用，请查看状态列表。</p>}
    </div>
  );
}
