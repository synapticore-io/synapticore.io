import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Globe,
  Network,
  Database,
  ChevronRight,
  Terminal,
  Activity,
  FlaskConical,
  Layers,
  Zap,
  Github,
  Search,
  Menu,
  X,
  ExternalLink,
  Mail
} from 'lucide-react';

import heroData from '@content/hero.json';
import modesData from '@content/modes.json';
import statsData from '@content/stats.json';
const modeIcons = { Network, Globe, Database };

const SpatialBackground = ({ activeMode }) => {
  const mountRef = useRef(null);
  const stateRef = useRef({ activeMode, mouseX: 0, mouseY: 0 });

  useEffect(() => {
    stateRef.current.activeMode = activeMode;
  }, [activeMode]);

  useEffect(() => {
    let renderer, scene, camera, points, lines;
    let frameId;

    const init = () => {
      if (!mountRef.current || !window.THREE) return;
      const THREE = window.THREE;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.001);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.z = 900;

      const isMobile = window.innerWidth < 768;

      renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      const count = isMobile ? 150 : 400;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);

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

      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(count * 20 * 3);
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

          let tx = 0, ty = 0, tz = 0;

          if (currentMode === 0) {
            tx = Math.sin(i * 0.3) * 300 + Math.cos(time + i * 0.1) * 50;
            ty = Math.cos(i * 0.5) * 300 + Math.sin(time + i * 0.2) * 50;
            tz = Math.sin(i * 0.2) * 300;
          } else if (currentMode === 1) {
            tx = (Math.sin(i + time) * 800);
            ty = (Math.cos(i * 1.2 + time) * 500);
            tz = (Math.sin(i * 0.8) * 600);
          } else {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            tx = 500 * Math.cos(theta) * Math.sin(phi);
            ty = 500 * Math.sin(theta) * Math.sin(phi);
            tz = 500 * Math.cos(phi);
          }

          pos[ix] += (tx - pos[ix]) * 0.03;
          pos[iy] += (ty - pos[iy]) * 0.03;
          pos[iz] += (tz - pos[iz]) * 0.03;

          if (currentMode !== 1) {
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

const App = () => {
  const [activeMode, setActiveMode] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const modes = modesData.map((m, i) => {
    const IconComponent = modeIcons[m.icon];
    return { id: i, title: m.title, desc: m.description, icon: IconComponent ? <IconComponent /> : null };
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/40 selection:text-white overflow-x-hidden">
      <SpatialBackground activeMode={activeMode} />

      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.4)_100%)]" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-scanline" />
        <div className="hidden md:block absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-white/10" />
        <div className="hidden md:block absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/10" />
        <div className="hidden md:block absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-white/10" />
        <div className="hidden md:block absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-white/10" />
      </div>

      <nav className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? 'py-4 backdrop-blur-md border-b border-white/5 bg-slate-950/40' : 'py-6 sm:py-10'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500 transition-all duration-500">
              <Network size={22} className="group-hover:text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none uppercase">SYNAPTICORE<span className="text-cyan-400">.IO</span></span>
              <span className="text-[9px] text-slate-500 font-mono tracking-[0.4em] uppercase font-bold">Scientific Computing & Spatial Intelligence</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            <a href="#contact" className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 transition-all uppercase tracking-[0.2em]">Kontakt</a>
            <a href="https://github.com/synapticore-io" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 transition-all uppercase tracking-[0.2em]">GitHub</a>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/5 mt-2">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-colors py-2">Kontakt</a>
              <a href="https://github.com/synapticore-io" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-colors py-2">GitHub</a>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-20">
        <section className="min-h-screen flex items-center pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-4 bg-cyan-500/10 border border-cyan-500/20 px-4 sm:px-6 py-2 rounded-full text-cyan-400 text-[10px] font-black mb-10 tracking-[0.3em] uppercase animate-pulse">
                <FlaskConical size={14} /> <span className="hidden sm:inline">Active Sequence:</span> {modes[activeMode].title}
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] mb-8 sm:mb-12 uppercase italic">
                {heroData.title.split('\n')[0]} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">{heroData.title.split('\n')[1]}</span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-3xl text-slate-400 max-w-2xl font-light leading-relaxed mb-10 sm:mb-16">
                {heroData.description.split('\n')[0]} <br />
                <span className="text-white font-medium italic underline decoration-cyan-500 underline-offset-[12px]">{heroData.description.split('\n')[1]}</span>
              </p>

              <div className="flex flex-wrap gap-4 sm:gap-8">
                <a href="#research" className="px-6 py-4 sm:px-12 sm:py-6 bg-white text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest text-xs flex items-center gap-3">
                  {heroData.cta_text} <ChevronRight size={18} />
                </a>
                <a href="https://github.com/synapticore-io" target="_blank" rel="noopener noreferrer" className="px-6 py-4 sm:px-12 sm:py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:border-cyan-500 transition-all uppercase tracking-widest text-xs no-underline">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="research" className="py-16 md:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {modes.map((mode) => (
                <div
                  key={mode.id}
                  className={`relative p-6 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border transition-all duration-700 overflow-hidden group ${activeMode === mode.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
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

        <section className="py-16 md:py-40 bg-slate-950/40 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 md:gap-24 items-center">
              <div className="lg:w-1/2">
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em] mb-8">{statsData.title}</div>
                <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-10 leading-none">{statsData.metadata.heading.split(' ').slice(0, -1).join(' ')} <br /><span className="text-cyan-400">{statsData.metadata.heading.split(' ').slice(-1)[0]}</span></h2>
                <p className="text-slate-400 text-lg lg:text-xl font-light leading-relaxed mb-12">
                  {statsData.description}
                </p>
                <div className="grid grid-cols-2 gap-6 md:gap-12">
                  {statsData.metadata.metrics.map((metric, i) => (
                    <div key={i}>
                      <div className="text-3xl font-black mb-1 tracking-tighter italic">{metric.value}</div>
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">{metric.label}</div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://github.com/orgs/synapticore-io/repositories?q=mirror%3Afalse+fork%3Afalse+archived%3Afalse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400 transition-all"
                >
                  Repositories erkunden <ExternalLink size={12} />
                </a>
              </div>
              <div className="lg:w-1/2 relative max-w-[300px] sm:max-w-none mx-auto">
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
                  Computing
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 md:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
              Get in <span className="text-cyan-400">Touch.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-light">
              Fragen zu unserer Forschung, Interesse an Zusammenarbeit oder Open-Source-Beiträge?
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <a href="mailto:hello@synapticore.io" className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:border-cyan-500 rounded-full text-white font-bold text-sm uppercase tracking-widest transition-all">
                <Mail size={16} /> hello@synapticore.io
              </a>
              <a href="https://www.linkedin.com/in/bj%C3%B6rn-bethge-a0754a329" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors font-bold uppercase tracking-widest">
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        <footer className="py-8 border-t border-white/5 relative z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">© 2026 Synapticore.io</span>
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-mono uppercase tracking-widest text-slate-600">
              <a href="mailto:hello@synapticore.io" className="hover:text-cyan-400 transition-colors">Kontakt</a>
              <a href="https://www.linkedin.com/in/bj%C3%B6rn-bethge-a0754a329" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
              <a href="/impressum.html" className="hover:text-cyan-400 transition-colors">Impressum</a>
              <a href="/impressum.html#datenschutz" className="hover:text-cyan-400 transition-colors">Datenschutz</a>
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
