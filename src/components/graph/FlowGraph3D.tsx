import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  FlowGraphData, 
  GraphNode, 
  GraphEdge 
} from '../../agent/graph/flowGraphModel';
import { 
  RotateCcw, 
  Crosshair, 
  Plus, 
  Minus, 
  Zap, 
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';

export interface FlowGraph3DProps {
  graph: FlowGraphData;
  selectedNodeId: string | null;
  selectedEdge: { source: string; target: string } | null;
  impactNodeIds?: Set<string>;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEdge: (edge: GraphEdge | null) => void;
  onExpandBranch?: (nodeId: string) => void;
  onCollapseBranch?: (nodeId: string) => void;
  onTriggerImpact?: (nodeId: string) => void;
  onNodeDragEnd?: (nodeId: string, x: number, y: number, z: number) => void;
  onFallbackTo2D?: () => void;
}

export const FlowGraph3D: React.FC<FlowGraph3DProps> = ({
  graph,
  selectedNodeId,
  selectedEdge,
  impactNodeIds,
  onSelectNode,
  onSelectEdge,
  onExpandBranch,
  onCollapseBranch,
  onTriggerImpact,
  onNodeDragEnd,
  onFallbackTo2D
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Camera reset helper
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !sceneRef.current) return;
    cameraRef.current.position.set(0, 50, 880);
    cameraRef.current.lookAt(0, 0, 0);
    sceneRef.current.rotation.set(0, 0, 0);
  }, []);

  // Camera focus on selected node
  const handleFocusSelected = useCallback(() => {
    if (!selectedNodeId || !cameraRef.current || !sceneRef.current) return;
    const group = nodeMeshesRef.current.get(selectedNodeId);
    if (!group) return;

    const targetPos = group.position;
    cameraRef.current.position.set(targetPos.x, targetPos.y + 40, targetPos.z + 320);
    cameraRef.current.lookAt(targetPos.x, targetPos.y, targetPos.z);
  }, [selectedNodeId]);

  // Zoom helpers
  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(cameraRef.current.position.z - 120, 250);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(cameraRef.current.position.z + 120, 1900);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          handleFocusSelected();
          break;
        case 'r':
          handleResetCamera();
          break;
        case 'e':
          if (selectedNodeId && onExpandBranch) onExpandBranch(selectedNodeId);
          break;
        case 'c':
          if (selectedNodeId && onCollapseBranch) onCollapseBranch(selectedNodeId);
          break;
        case 'i':
          if (selectedNodeId && onTriggerImpact) onTriggerImpact(selectedNodeId);
          break;
        case 'escape':
          onSelectNode(null);
          onSelectEdge(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, handleFocusSelected, handleResetCamera, onExpandBranch, onCollapseBranch, onTriggerImpact, onSelectNode, onSelectEdge]);

  useEffect(() => {
    // 1. WebGL Availability Check
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLAvailable(false);
        if (onFallbackTo2D) onFallbackTo2D();
        return;
      }
    } catch {
      setWebGLAvailable(false);
      if (onFallbackTo2D) onFallbackTo2D();
      return;
    }

    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 900;
    const height = mountRef.current.clientHeight || 640;

    // 2. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.0006);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 4500);
    camera.position.set(0, 50, 880);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 3. Multi-point Cinematic Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x070b14, 0.85);
    scene.add(hemiLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 3.8, 1600);
    cyanLight.position.set(450, 400, 500);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.2, 1400);
    purpleLight.position.set(-450, -300, 400);
    scene.add(purpleLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2.0, 1200);
    amberLight.position.set(0, 300, -300);
    scene.add(amberLight);

    // 4. Circular Operations Radar Grid Floor
    const gridPolar = new THREE.PolarGridHelper(1100, 16, 8, 64, 0x1e293b, 0x0f172a);
    gridPolar.position.y = -260;
    scene.add(gridPolar);

    // 5. Constellation Micro-Starfield (180 stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 180;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 2200;
      starPositions[i + 1] = (Math.random() - 0.5) * 1200;
      starPositions[i + 2] = (Math.random() - 0.5) * 1400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ 
      size: 3.0, 
      color: 0x38bdf8, 
      transparent: true, 
      opacity: 0.45,
      blending: THREE.AdditiveBlending 
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 6. Node Groups (Sphere + Glass Shell + Halo + Label)
    const nodeGroups: Map<string, THREE.Group> = new Map();
    const nodePositions: Map<string, THREE.Vector3> = new Map();
    const shockwaveMeshes: THREE.Mesh[] = [];

    const createTextSprite = (text: string, colorHex: string, badgeText?: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 84;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High-DPI background pill with gradient
        const grad = ctx.createLinearGradient(0, 0, 320, 84);
        grad.addColorStop(0, 'rgba(8, 14, 26, 0.95)');
        grad.addColorStop(1, 'rgba(12, 20, 36, 0.92)');
        ctx.fillStyle = grad;
        ctx.roundRect(6, 6, 308, 72, 16);
        ctx.fill();

        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayLabel = text.length > 22 ? text.slice(0, 21) + '…' : text;
        ctx.fillText(displayLabel, 160, 32);

        // Subtitle badge
        if (badgeText) {
          ctx.fillStyle = colorHex;
          ctx.font = 'bold 13px monospace';
          ctx.fillText(badgeText, 160, 60);
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(125, 33, 1);
      return sprite;
    };

    graph.nodes.forEach(node => {
      const isSelected = node.id === selectedNodeId;
      const isImpacted = impactNodeIds?.has(node.id);
      const isAnomalous = node.risk === 'CRITICAL' || node.changed;

      let baseColor = 0x0c83fd;
      let hexStr = '#0C83FD';
      if (isAnomalous) {
        baseColor = 0xf43f5e;
        hexStr = '#F43F5E';
      } else if (node.risk === 'HIGH') {
        baseColor = 0xf59e0b;
        hexStr = '#F59E0B';
      } else if (node.type === 'action') {
        baseColor = 0x10b981;
        hexStr = '#10B981';
      } else if (node.type === 'hypothesis') {
        baseColor = 0xa855f7;
        hexStr = '#A855F7';
      }

      const group = new THREE.Group();
      const posX = node.x ?? 0;
      const posY = -(node.y ?? 0);
      const posZ = node.z ?? 0;
      group.position.set(posX, posY, posZ);

      const radius = 15 + (node.importance || 0.5) * 12;

      // Inner Core Mesh
      const coreGeo = new THREE.SphereGeometry(radius, 32, 32);
      const coreMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: isSelected || isImpacted ? baseColor : (isAnomalous ? 0xe11d48 : 0x071b38),
        emissiveIntensity: isSelected ? 1.0 : 0.45,
        roughness: 0.2,
        metalness: 0.7
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.userData = { nodeId: node.id, nodeData: node };
      group.add(coreMesh);

      // Outer Glass Shell
      const shellGeo = new THREE.SphereGeometry(radius * 1.14, 24, 24);
      const shellMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.22,
        roughness: 0.1,
        metalness: 0.1,
        blending: THREE.AdditiveBlending
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      group.add(shellMesh);

      // Glowing Pulsing Halo Rings for Selected or Anomalous nodes
      if (isSelected || isImpacted || isAnomalous) {
        const haloGeo = new THREE.RingGeometry(radius * 1.25, radius * 1.45, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x38bdf8 : (isAnomalous ? 0xf43f5e : 0xa855f7),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        group.add(haloMesh);
        shockwaveMeshes.push(haloMesh);
      }

      // 3D Billboard Text Label
      const badgeText = node.status !== 'OBSERVED' ? node.status : (node.metadata.successRate ? `SR: ${node.metadata.successRate}` : node.type.toUpperCase());
      const textSprite = createTextSprite(node.label, hexStr, badgeText);
      textSprite.position.set(0, radius + 26, 0);
      group.add(textSprite);

      scene.add(group);
      nodeGroups.set(node.id, group);
      nodePositions.set(node.id, new THREE.Vector3(posX, posY, posZ));
    });

    nodeMeshesRef.current = nodeGroups;

    // 7. 3D Curved Bezier Edges & Traveling Pulse Packets
    const pulsePackets: Array<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number; speed: number }> = [];

    graph.edges.forEach(edge => {
      const p1 = nodePositions.get(edge.source);
      const p2 = nodePositions.get(edge.target);
      if (!p1 || !p2) return;

      const isCausal = edge.relation === 'caused' || edge.relation === 'deployed_by';
      const isSelectedEdge = selectedEdge && 
        ((selectedEdge.source === edge.source && selectedEdge.target === edge.target) ||
         (selectedEdge.source === edge.target && selectedEdge.target === edge.source));

      const midPoint = new THREE.Vector3()
        .addVectors(p1, p2)
        .multiplyScalar(0.5);
      midPoint.z += 30; // Curve outward spatially

      const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
      const points = curve.getPoints(28);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const edgeColor = isSelectedEdge 
        ? 0x00f0ff 
        : (isCausal ? 0xf43f5e : (edge.status === 'CORRELATED' ? 0xa855f7 : 0x334155));

      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        linewidth: isSelectedEdge ? 3 : 1.5,
        transparent: true,
        opacity: isSelectedEdge ? 1.0 : (edge.confidence || 0.75)
      });

      const line = new THREE.Line(curveGeo, lineMat);
      line.userData = { edgeData: edge };
      scene.add(line);

      // Active flow animated particle pulse
      if (edge.status === 'OBSERVED' || isCausal || isSelectedEdge) {
        const pulseGeo = new THREE.SphereGeometry(3.5, 12, 12);
        const pulseMat = new THREE.MeshBasicMaterial({ 
          color: isCausal ? 0xf43f5e : (isSelectedEdge ? 0x00f0ff : 0x38bdf8) 
        });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        scene.add(pulseMesh);
        pulsePackets.push({
          mesh: pulseMesh,
          curve,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.003
        });
      }
    });

    // 8. Interactive Mouse Orbit, Pan, and Node Dragging
    let isDragging = false;
    let isOrbiting = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };
    let draggedNodeId: string | null = null;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshesToIntersect = Array.from(nodeGroups.values()).map(g => g.children[0]);
      const intersects = raycaster.intersectObjects(meshesToIntersect);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.nodeData as GraphNode;
        onSelectNode(hitNode);
        if (e.button === 0) {
          isDragging = true;
          draggedNodeId = hitNode.id;
        }
      } else {
        if (e.button === 2 || e.button === 0) {
          isOrbiting = true;
        } else if (e.button === 1) {
          isPanning = true;
        }
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      if (isDragging && draggedNodeId) {
        const group = nodeGroups.get(draggedNodeId);
        if (group) {
          group.position.x += deltaX * 0.85;
          group.position.y -= deltaY * 0.85;
        }
      } else if (isOrbiting) {
        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x += deltaY * 0.005;
      } else if (isPanning) {
        camera.position.x -= deltaX * 0.65;
        camera.position.y += deltaY * 0.65;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (isDragging && draggedNodeId) {
        const group = nodeGroups.get(draggedNodeId);
        if (group && onNodeDragEnd) {
          onNodeDragEnd(draggedNodeId, group.position.x, -group.position.y, group.position.z);
        }
      }
      isDragging = false;
      isOrbiting = false;
      isPanning = false;
      draggedNodeId = null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY * 0.65, 250), 1900);
    };

    const onDoubleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshesToIntersect = Array.from(nodeGroups.values()).map(g => g.children[0]);
      const intersects = raycaster.intersectObjects(meshesToIntersect);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData.nodeData as GraphNode;
        handleFocusSelected();
        if (onExpandBranch) onExpandBranch(hitNode.id);
      }
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 900;
      const h = mountRef.current.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(mountRef.current);

    // 10. Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate shockwave rings
      shockwaveMeshes.forEach(ring => {
        const scale = 1 + (Math.sin(elapsedTime * 3) + 1) * 0.12;
        ring.scale.set(scale, scale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsedTime * 3) * 0.35;
      });

      // Animate traveling pulse packets along bezier curves
      pulsePackets.forEach(pkt => {
        pkt.progress = (pkt.progress + pkt.speed) % 1.0;
        const pos = pkt.curve.getPointAt(pkt.progress);
        pkt.mesh.position.copy(pos);
      });

      // Subtle starfield rotation
      starfield.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [graph, selectedNodeId, selectedEdge, impactNodeIds, onSelectNode, onNodeDragEnd, onFallbackTo2D, handleFocusSelected, onExpandBranch]);

  if (!webGLAvailable) {
    return (
      <div className="w-full h-full min-h-[600px] bg-[#060913] border border-card-border rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-2xl">
        <p className="text-text-muted text-xs">WebGL is not supported or hardware acceleration is disabled in this environment.</p>
        <button
          onClick={onFallbackTo2D}
          className="px-4 py-2 rounded-xl bg-[#0C83FD] text-white font-bold text-xs shadow-lg cursor-pointer"
        >
          Switch to 2D Canvas View
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[620px] rounded-2xl overflow-hidden border border-card-border/90 bg-[#060913] shadow-2xl select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Navigation & Camera Toolbar */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-20">
        <div className="bg-[#0c1424]/90 backdrop-blur-md border border-card-border px-3.5 py-1.5 rounded-xl text-xs text-text-muted flex items-center gap-2.5 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="font-semibold text-white text-[11px]">3D Spatial Orbit</span>
          <span className="text-[10px] text-text-muted hidden md:inline">Right-drag: Orbit • Left-drag: Move • Scroll: Zoom • Dbl-click: Fly</span>
        </div>

        <div className="flex items-center gap-1 bg-[#0c1424]/90 backdrop-blur-md border border-card-border p-1 rounded-xl shadow-lg">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Camera Position (R)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-text-muted hover:text-white hover:bg-card-border/60 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset [R]</span>
          </button>
          {selectedNodeId && (
            <button
              onClick={handleFocusSelected}
              title="Focus Camera on Selected Entity (F)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0C83FD] bg-[#0C83FD]/10 border border-[#0C83FD]/30 hover:bg-[#0C83FD]/20 transition-all cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Focus [F]</span>
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcut Cheatsheet Banner */}
      <div className="absolute bottom-4 left-4 hidden lg:flex items-center gap-3 bg-[#0c1424]/80 backdrop-blur-md border border-card-border/60 px-3 py-1.5 rounded-xl text-[10px] text-text-muted z-10 font-mono">
        <span><strong className="text-white">F</strong>: Focus</span>
        <span><strong className="text-white">R</strong>: Reset Cam</span>
        <span><strong className="text-white">E</strong>: Expand</span>
        <span><strong className="text-white">C</strong>: Collapse</span>
        <span><strong className="text-white">I</strong>: Impact</span>
        <span><strong className="text-white">Esc</strong>: Clear</span>
      </div>
    </div>
  );
};
