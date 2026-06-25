import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GokuGym() {
  useEffect(() => {
    let W = window.innerWidth, H = window.innerHeight;

    /* ── Custom Cursor Logic ── */
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let rx = W/2, ry = H/2, mx = W/2, my = H/2;

    const handleMouseMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if(dot) { dot.style.left = mx+'px'; dot.style.top = my+'px'; }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let ringId;
    const updateRing = () => {
      rx += (mx - rx) * .13; ry += (my - ry) * .13;
      if(ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
      ringId = requestAnimationFrame(updateRing);
    };
    updateRing();

    /* ── 2D Aura Canvas Setup ── */
    const canvas2d = document.getElementById('bg-canvas-2d');
    const ctx = canvas2d.getContext('2d');
    canvas2d.width = W; canvas2d.height = H;

    const mouse = {x:0.5, y:0.5};
    const handleCanvasMouse = (e) => {
      mouse.x = e.clientX/W; mouse.y = e.clientY/H;
    };
    window.addEventListener('mousemove', handleCanvasMouse);

    const PCOUNT = 150;
    const parts = Array.from({length:PCOUNT}, () => resetParticle({}));
    function resetParticle(p){
      p.x = Math.random(); p.y = Math.random() + 0.1;
      p.r = Math.random() * 2.5 + 0.5;
      p.spd = Math.random() * 0.0008 + 0.0002;
      p.sway = Math.random() * Math.PI * 2;
      p.swaySpd = Math.random() * 0.02 + 0.01;
      p.alpha = Math.random() * 0.6 + 0.2;
      return p;
    }

    let t = 0;
    let loopId;
    function loopName(){
      loopId = requestAnimationFrame(loopName);
      t += 0.016;
      
      ctx.fillStyle = '#050507';
      ctx.fillRect(0,0,W,H);

      parts.forEach(p => {
        p.y -= p.spd; p.sway += p.swaySpd;
        if(p.y < -0.02) resetParticle(p);
        const px = (p.x + Math.sin(p.sway) * 0.01) * W;
        const py = p.y * H;
        ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255, ${140 + Math.floor(Math.random()*80)}, 10, ${p.alpha})`;
        ctx.fill();
      });

      const cx = mouse.x * W, cy = mouse.y * H;
      const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 300);
      glow.addColorStop(0, 'rgba(255, 100, 0, 0.25)');
      glow.addColorStop(0.5, 'rgba(255, 50, 0, 0.08)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 300, 0, Math.PI*2);
      ctx.fillStyle = glow; ctx.fill();
      
      if(gokuModel) {
        gokuModel.position.y = Math.sin(t * 2) * 0.03;
      }
      renderer.render(scene, camera);
    }

    /* ── Three.js 3D Goku Scene Setup ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 1.4, 1.8);

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas-3d'), alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const auraLight = new THREE.PointLight(0xffaa00, 2, 30);
    auraLight.position.set(0, 1.5, -1);
    scene.add(auraLight);

    const loader = new GLTFLoader();
    let gokuModel = null;

    // Move goku.glb into your wix-studio-clone/public/ folder!
    loader.load('/goku.glb', (gltf) => {
      gokuModel = gltf.scene;
      gokuModel.position.set(0, 0, 0);
      gokuModel.scale.set(1, 1, 1);
      scene.add(gokuModel);

      gsap.timeline({
        scrollTrigger: {
          trigger: "#app",
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      })
      .to(camera.position, { z: 4.5, y: 0.8, ease: "none" }, 0)
      .to(gokuModel.rotation, { y: Math.PI * 0.15, ease: "none" }, 0);
    });

    loopName();

    /* ── Resize Handler ── */
    const handleResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas2d.width = W; canvas2d.height = H;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', handleResize);

    /* ── Intro Elements Animations ── */
    const tl = gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to('#main-nav', {opacity:1, duration:1.2}, 0.2);
    tl.set('#ht', {opacity:1}, 0.6);
    document.querySelectorAll('.hero-title .line span').forEach((el,i)=>{
      gsap.set(el,{y:'115%'});
      tl.to(el,{y:'0%',duration:0.95,ease:'power4.out'},0.65+i*0.16);
    });
    gsap.set(['#ey','#hs','#hc','#pc'],{y:24,opacity:0});
    gsap.set('#stats',{y:32,opacity:0});
    tl.to('#ey',{opacity:1,y:0,duration:0.8},0.55);
    tl.to('#hs',{opacity:1,y:0,duration:0.9},1.05);
    tl.to('#hc',{opacity:1,y:0,duration:0.8},1.25);
    tl.to('#pc',{opacity:1,y:0,duration:0.8},1.45);
    tl.to('#stats',{opacity:1,y:0,duration:0.9},1.65);

    gsap.from('.prog-card',{
      scrollTrigger:{trigger:'#programs',start:'top 78%'},
      y:60,opacity:0,duration:0.85,stagger:0.15,ease:'power3.out'
    });

    const pvEl = document.getElementById('pv');
    const steps = [0,500,1500,4000,8001,9001];
    let si = 0;
    const iv = setInterval(()=>{
      si++;
      if(pvEl) pvEl.textContent = si>=steps.length-1 ? (clearInterval(iv),'OVER 9,000') : steps[si].toLocaleString();
    },350);

    /* ── Cleanup on Unmount ── */
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleCanvasMouse);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(ringId);
      cancelAnimationFrame(loopId);
      clearInterval(iv);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ background: '#050507', color: '#fff', fontFamily: 'Rajdhani, sans-serif', overflowX: 'hidden' }}>
      <div id="cursor-dot" style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, width: '8px', height: '8px', borderRadius: '50%', background: '#FF8C00', pointerEvents: 'none', transform: 'translate(-50%, -50%)', boxShadow: '0 0 14px #FF8C00, 0 0 28px #FF4400' }}></div>
      <div id="cursor-ring" style={{ position: 'fixed', top: 0, left: 0, zIndex: 9998, width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid rgba(255,140,0,0.5)', pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}></div>
      
      <canvas id="bg-canvas-2d" style={{ position: 'fixed', inset: 0, zIndex: -2, width: '100vw', height: '100vh', display: 'block', background: '#050507' }}></canvas>
      <canvas id="bg-canvas-3d" style={{ position: 'fixed', inset: 0, zIndex: -1, width: '100vw', height: '100vh', display: 'block', pointerEvents: 'none' }}></canvas>

      <div id="app" style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav id="main-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', background: 'rgba(5,5,7,0.6)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,140,0,0.08)', opacity: 0 }}>
          <a href="#" className="logo" style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '.15em', background: 'linear-gradient(90deg,#fff 30%,#FF8C00 80%,#FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>GOKU FITNESS</a>
          <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '40px', listStyle: 'none' }}>
            <li><a href="#programs" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase' }}>Saga Programs</a></li>
            <li><a href="#stats" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase' }}>Chamber Memberships</a></li>
          </ul>
          <a href="#" className="btn-glass">Join the Sect</a>
        </nav>

        <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px' }}>
          <p className="eyebrow" id="ey" style={{ fontFamily: 'Orbitron', fontSize: '.65rem', fontWeight: 600, letterSpacing: '.4em', textTransform: 'uppercase', color: '#FF8C00', marginBottom: '24px' }}>⚡ Training Beyond Mortal Limits ⚡</p>
          <h1 className="hero-title" id="ht" style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(2.6rem, 8vw, 7.5rem)', lineHeight: '.95', letterSpacing: '-.01em', textTransform: 'uppercase', opacity: 0 }}>
            <span className="line"><span style={{ display: 'inline-block' }}>Awaken Your</span></span>
            <span className="line"><span className="highlight" style={{ display: 'inline-block' }}>Inner Saiyan</span></span>
          </h1>
          <p className="hero-sub" id="hs" style={{ marginTop: '28px', fontSize: '1.15rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '.05em', maxWidth: '520px' }}>Elite training forged in the fires of battle. Where warriors become legends and power levels shatter every ceiling.</p>
          <div className="hero-ctas" id="hc" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '52px' }}>
            <a href="#" className="btn-glass btn-hero">🔥 Unleash Your Power</a>
          </div>
          <div className="power-counter" id="pc" style={{ marginTop: '72px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="power-label" style={{ fontFamily: 'Orbitron', fontSize: '.6rem', fontWeight: 600, letterSpacing: '.3em', color: 'rgba(255,255,255,0.35)' }}>Current Power Level</span>
            <span className="power-value" id="pv" style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', fontWeight: 900, background: 'linear-gradient(90deg, #FF8C00, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0</span>
          </div>
        </section>

        <section id="programs" style={{ maxWidth: '1200px', margin: '120px auto 0', padding: '0 48px' }}>
          <p className="section-label" style={{ fontFamily: 'Orbitron', fontSize: '.6rem', letterSpacing: '.4em', textTransform: 'uppercase', color: '#FF8C00', marginBottom: '16px' }}>Saga Programs</p>
          <h2 className="section-title" style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: '60px' }}>Choose Your<br/>Training Arc</h2>
          <div className="programs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div className="prog-card" style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,140,0,0.03))', backdropFilter: 'blur(20px)', padding: '36px 30px' }}>
              <span className="prog-icon" style={{ fontSize: '2.4rem', marginBottom: '20px', display: 'block' }}>🌙</span>
              <p className="prog-saga" style={{ fontFamily: 'Orbitron', fontSize: '.55rem', letterSpacing: '.3em', color: '#FF8C00', marginBottom: '8px', textTransform: 'uppercase' }}>Saiyan Saga</p>
              <h3 className="prog-name" style={{ fontFamily: 'Orbitron', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px', textTransform: 'uppercase' }}>Foundation Protocol</h3>
              <p className="prog-desc" style={{ fontSize: '.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>Build your base power. Core strength, endurance conditioning, and functional movement.</p>
            </div>
            {/* Add more cards as needed */}
          </div>
        </section>
      </div>
    </div>
  );
}