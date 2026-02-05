import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Cpu, 
  Globe, 
  Network, 
  ChevronRight, 
  Terminal, 
  Activity, 
  FlaskConical, 
  Layers, 
  Zap,
  Github,
  Search,
  Box
} from 'lucide-react';

// --- THREE.JS BACKGROUND WITH MORPHING LOGIC ---
const SpatialBackground = ({ activeMode }) => {
  const mountRef = useRef(null);
  const stateRef = useRef({ activeMode, mouseX: 0, mouseY: 0 });

  useEffect(() => {
    stateRef.current.activeMode = activeMode;
  }, [activeMode]);

  useEffect(() => {
    let renderer, scene, camera, points, lines;
    let frameId;
    const T = window.THREE;

    const init = () => {
      if (!mountRef.current || !window.THREE) return;
      const THREE = window.THREE;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.001);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.z = 900;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      const count = 400; // Ausgewogene Anzahl für Performance & Optik
      const geometry = new THREE.BufferGeometry();
      
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      
      // Initiale Positionen
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        
        velocities[i * 3] = (Math.random() - 0.5) * 2;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x22d3ee,
        size: 3,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      // Linien-System
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(count * 20 * 3); // Buffer für Verbindungen
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
      });
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      const handleMouseMove = (e) => {
        stateRef.current.mouseX = (e.clientX - window.innerWidth / 2) * 0.2;
        stateRef.current.mouseY = (e.clientY - window.innerHeight / 2) * 0.2;
      };
      window.addEventListener('mousemove', handleMouseMove);

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        const currentMode = stateRef.current.activeMode;

        // Kamera-Bewegung
        camera.position.x += (stateRef.current.mouseX - camera.position.x) * 0.05;
        camera.position.y += (-stateRef.current.mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        const pos = points.geometry.attributes.position.array;
        const lPos = lines.geometry.attributes.position.array;
        let lineIdx = 0;

        for (let i = 0; i < count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          // --- MORPHING LOGIC ---
          let tx = 0, ty = 0, tz = 0;

          if (currentMode === 0) { // NEUROMORPHIC (Clusters)
            tx = Math.sin(i * 0.3) * 300 + Math.cos(time + i * 0.1) * 50;
            ty = Math.cos(i * 0.5) * 300 + Math.sin(time + i * 0.2) * 50;
            tz = Math.sin(i * 0.2) * 300;
          } else if (currentMode === 1) { // SPATIAL CLOUD (Expand)
            tx = (Math.sin(i + time) * 800);
            ty = (Math.cos(i * 1.2 + time) * 500);
            tz = (Math.sin(i * 0.8) * 600);
          } else { // NEXUS MESH (Sphere)
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            tx = 500 * Math.cos(theta) * Math.sin(phi);
            ty = 500 * Math.sin(theta) * Math.sin(phi);
            tz = 500 * Math.cos(phi);
          }

          // Flüssiges Lerping zur Zielposition
          pos[ix] += (tx - pos[ix]) * 0.03;
          pos[iy] += (ty - pos[iy]) * 0.03;
          pos[iz] += (tz - pos[iz]) * 0.03;

          // Verbindungslinien berechnen (optimiert)
          if (currentMode !== 1) { // In der Cloud keine Linien für Fokus auf Partikel
            for (let j = i + 1; j < Math.min(i + 15, count); j++) {
              const jx = j * 3;
              const dist = Math.hypot(pos[ix] - pos[jx], pos[iy] - pos[jx+1], pos[iz] - pos[jx+2]);
              if (dist < 200) {
                lPos[lineIdx++] = pos[ix];
                lPos[lineIdx++] = pos[iy];
                lPos[lineIdx++] = pos[iz];
                lPos[lineIdx++] = pos[jx];
                lPos[lineIdx++] = pos[jx+1];
                lPos[lineIdx++] = pos[jx+2];
              }
            }
          }
        }

        points.geometry.attributes.position.needsUpdate = true;
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.setDrawRange(0, lineIdx / 3);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(frameId);
        renderer.dispose();
      };
    };

    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = init;
      document.head.appendChild(script);
    } else {
      init();
    }
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// --- MAIN APPLICATION COMPONENT ---
const App = () => {
  const [activeMode, setActiveMode] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const timer = setInterval(() => {
      setActiveMode((prev) => (prev + 1) % 3);
    }, 7000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const modes = [
    { id: 0, title: "Neuromorphic Computing", desc: "Simulation biologischer Synapsenpfade.", icon: <Network /> },
    { id: 1, title: "Spatial LiDAR Cloud", desc: "Echtzeit-Analyse hochfrequenter Raumdaten.", icon: <Box /> },
    { id: 2, title: "Nexus Topology", desc: "Globale dezentrale Mesh-Netzwerke.", icon: <Globe /> }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/40 selection:text-white overflow-x-hidden">
      {/* 3D Morphing Background */}
      <SpatialBackground activeMode={activeMode} />

      {/* CSS Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.4)_100%)]" />
        {/* Moving Scanline */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-scanline" />
        {/* Hud Corners */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/10" />
        <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/10" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/10" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/10" />
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? 'py-4 backdrop-blur-md border-b border-white/5 bg-slate-950/40' : 'py-10'}`}>
        <div className="container mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500 transition-all duration-500">
              <Network size={22} className="group-hover:text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none uppercase">SYNAPTICORE<span className="text-cyan-400">.IO</span></span>
              <span className="text-[9px] text-slate-500 font-mono tracking-[0.4em] uppercase font-bold">Research Platform</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {['Infrastruktur', 'Labor', 'Forschung'].map((link) => (
              <a key={link} href="#" className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 transition-all uppercase tracking-[0.2em]">{link}</a>
            ))}
            <button className="bg-white/5 border border-white/10 hover:border-cyan-500 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20">
        <section className="min-h-screen flex items-center pt-20">
          <div className="container mx-auto px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-4 bg-cyan-500/10 border border-cyan-500/20 px-6 py-2 rounded-full text-cyan-400 text-[10px] font-black mb-10 tracking-[0.3em] uppercase animate-pulse">
                <FlaskConical size={14} /> Active Sequence: {modes[activeMode].title}
              </div>

              <h1 className="text-7xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] mb-12 uppercase italic">
                Rethink <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Computation</span>
              </h1>

              <p className="text-xl lg:text-3xl text-slate-400 max-w-2xl font-light leading-relaxed mb-16">
                Wir verschmelzen physikalischen Raum mit neuronaler Logik. <br />
                <span className="text-white font-medium italic underline decoration-cyan-500 underline-offset-[12px]">Ein dezentrales Nervensystem für die Industrie.</span>
              </p>

              <div className="flex flex-wrap gap-8">
                <button className="px-12 py-6 bg-white text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-xs flex items-center gap-3">
                  Infrastruktur starten <ChevronRight size={18} />
                </button>
                <button className="px-12 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:border-cyan-500 transition-all uppercase tracking-widest text-xs">
                  Labor Protokoll
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic HUD Features */}
        <section className="py-32 relative">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {modes.map((mode) => (
                <div 
                  key={mode.id}
                  className={`relative p-12 rounded-[2.5rem] border transition-all duration-700 overflow-hidden group ${activeMode === mode.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className={`absolute top-0 right-0 p-8 transition-all duration-700 opacity-20 ${activeMode === mode.id ? 'scale-150 opacity-100 rotate-12 text-cyan-400' : ''}`}>
                    {mode.icon}
                  </div>
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${activeMode === mode.id ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-400'}`}>
                    {mode.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{mode.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-light">{mode.desc}</p>
                  
                  <div className={`mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${activeMode === mode.id ? 'text-cyan-400 opacity-100' : 'opacity-0'}`}>
                    System Aktiv <Activity size={12} className="animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scientific Details Section */}
        <section className="py-40 bg-slate-950/40 relative">
          <div className="container mx-auto px-8">
            <div className="flex flex-col lg:flex-row gap-24 items-center">
              <div className="lg:w-1/2">
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] mb-8">Hardware-Software Nexus</div>
                <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-10 leading-none">Berechnungen <br />im <span className="text-cyan-400">Vektorfeld.</span></h2>
                <p className="text-slate-400 text-lg lg:text-xl font-light leading-relaxed mb-12">
                  Synapticore nutzt neuromorphe Architektur-Prinzipien, um Latenzen in der räumlichen Intelligenz um 90% zu reduzieren. Wir verarbeiten Daten dort, wo sie entstehen.
                </p>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <div className="text-3xl font-black mb-1 tracking-tighter italic">0.08ms</div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Synaptische Latenz</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-1 tracking-tighter italic">12.4TB</div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Live Mesh Kapazität</div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                {/* Decorative Tech Graphic */}
                <div className="w-full aspect-square border border-white/10 rounded-full flex items-center justify-center relative animate-slow-spin">
                  <div className="w-3/4 h-3/4 border border-cyan-500/20 rounded-full animate-reverse-spin border-dashed" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,1)]" />
                  <div className="absolute inset-0 flex items-center justify-center rotate-45">
                     <div className="w-full h-[1px] bg-white/5" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                     <div className="w-full h-[1px] bg-white/5" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-cyan-500/40 text-[10px] uppercase tracking-[1em]">
                  Researching
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lab Footer */}
        <footer className="py-24 border-t border-white/5 backdrop-blur-3xl relative z-30">
          <div className="container mx-auto px-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
              <div className="max-w-md">
                <span className="text-3xl font-black tracking-tighter uppercase mb-8 block">Synapticore<span className="text-cyan-500">.io</span></span>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Ein Open-Science-Laboratorium zur Erforschung der Grenzen von physischer und digitaler Intelligenz.
                </p>
                <div className="flex gap-6">
                   <a href="#" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300">
                     <Github size={20} />
                   </a>
                   <a href="#" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300">
                     <Terminal size={20} />
                   </a>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-20">
                <div className="flex flex-col gap-6">
                  <span className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Lab Notes</span>
                  <ul className="text-slate-500 text-xs space-y-4 font-mono uppercase tracking-widest">
                    <li className="hover:text-cyan-400 cursor-pointer">Manifest</li>
                    <li className="hover:text-cyan-400 cursor-pointer">Papers</li>
                    <li className="hover:text-cyan-400 cursor-pointer">Docs</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-6">
                  <span className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Systems</span>
                  <ul className="text-slate-500 text-xs space-y-4 font-mono uppercase tracking-widest">
                    <li className="hover:text-cyan-400 cursor-pointer">Nodes</li>
                    <li className="hover:text-cyan-400 cursor-pointer">Network</li>
                    <li className="hover:text-cyan-400 cursor-pointer">Security</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-600 tracking-[0.2em] uppercase">Status: Core Systems Operational // Ver 0.4.8_A</span>
              </div>
              <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">© 2026 Synapticore Lab Research Unit</span>
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes scanline {
          from { top: -100px; }
          to { top: 120%; }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 30s linear infinite;
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;