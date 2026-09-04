import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- entrada */
function animarEntrada() {
  if (sinMovimiento) return;

  gsap.set('[data-hero-item]', { opacity: 0, y: 22 });
  gsap.set('[data-hero-card]', { opacity: 0, y: 34 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('[data-parallax] img', { scale: 1.12, duration: 1.8, ease: 'power2.out' }, 0)
    .to('[data-hero-card]', { opacity: 1, y: 0, duration: 1 }, 0.25)
    .to('[data-hero-item]', { opacity: 1, y: 0, duration: 0.8, stagger: 0.11 }, 0.45);
}

/* -------------------------------------------------------------- parallax */
function parallaxHero() {
  if (sinMovimiento) return;
  const capa = document.querySelector<HTMLElement>('[data-parallax]');
  if (!capa) return;

  gsap.to(capa, {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: {
      trigger: capa.parentElement,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* --------------------------------------------------- aparición al scroll */
function animarSecciones() {
  const elementos = gsap.utils.toArray<HTMLElement>('[data-anim]');
  if (sinMovimiento) {
    gsap.set(elementos, { opacity: 1, y: 0 });
    return;
  }
  elementos.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

/* ------------------------------------------------------ trazo de ramitas */
function dibujarRamitas() {
  if (sinMovimiento) return;
  document.querySelectorAll<SVGSVGElement>('[data-ramita]').forEach((svg) => {
    const trazos = svg.querySelectorAll<SVGPathElement>('path');
    trazos.forEach((p) => {
      const largo = p.getTotalLength();
      gsap.set(p, { strokeDasharray: largo, strokeDashoffset: largo });
    });
    gsap.to(trazos, {
      strokeDashoffset: 0,
      duration: 1.4,
      stagger: 0.08,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: svg, start: 'top 85%' },
    });
  });
}

/* ------------------------------------------------------ cuenta regresiva */
function cuentaRegresiva() {
  const caja = document.querySelector<HTMLElement>('[data-cuenta]');
  if (!caja) return;
  const objetivo = new Date(caja.dataset.fecha!).getTime();
  const salidas = {
    dias: caja.querySelector<HTMLElement>('[data-u="dias"]')!,
    horas: caja.querySelector<HTMLElement>('[data-u="horas"]')!,
    min: caja.querySelector<HTMLElement>('[data-u="min"]')!,
    seg: caja.querySelector<HTMLElement>('[data-u="seg"]')!,
  };
  const aviso = document.querySelector<HTMLElement>('[data-cuenta-fin]');
  const dosDigitos = (n: number) => String(n).padStart(2, '0');

  const pintar = () => {
    const falta = objetivo - Date.now();
    if (falta <= 0) {
      caja.classList.add('hidden');
      aviso?.classList.remove('hidden');
      return;
    }
    const s = Math.floor(falta / 1000);
    salidas.dias.textContent = String(Math.floor(s / 86400));
    salidas.horas.textContent = dosDigitos(Math.floor(s / 3600) % 24);
    salidas.min.textContent = dosDigitos(Math.floor(s / 60) % 60);
    salidas.seg.textContent = dosDigitos(s % 60);
  };

  pintar();
  setInterval(pintar, 1000);
}

/* --------------------------------------------------------------- pétalos */
function petalos() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-petalos-canvas]');
  if (!canvas || sinMovimiento) return;
  const ctx = canvas.getContext('2d')!;
  const colores = ['#C79098', '#F0C9B4', '#F7EFE3', '#F0D078', '#8A9A78'];
  let particulas: Array<Record<string, number | string>> = [];
  let animando = false;

  const medir = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  medir();
  window.addEventListener('resize', medir);

  const soltar = () => {
    const w = canvas.offsetWidth;
    for (let i = 0; i < 70; i++) {
      particulas.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        vy: 1 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 1.1,
        r: 4 + Math.random() * 6,
        giro: Math.random() * Math.PI,
        vgiro: (Math.random() - 0.5) * 0.08,
        color: colores[Math.floor(Math.random() * colores.length)],
      });
    }
    if (!animando) {
      animando = true;
      requestAnimationFrame(cuadro);
    }
  };

  const cuadro = () => {
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.offsetWidth, h);
    particulas = particulas.filter((p) => (p.y as number) < h + 30);
    particulas.forEach((p) => {
      p.y = (p.y as number) + (p.vy as number);
      p.x = (p.x as number) + (p.vx as number) + Math.sin((p.y as number) / 40) * 0.5;
      p.giro = (p.giro as number) + (p.vgiro as number);
      ctx.save();
      ctx.translate(p.x as number, p.y as number);
      ctx.rotate(p.giro as number);
      ctx.fillStyle = p.color as string;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r as number, (p.r as number) * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    if (particulas.length) requestAnimationFrame(cuadro);
    else animando = false;
  };

  document.querySelectorAll('[data-petalos]').forEach((b) => b.addEventListener('click', soltar));
}

animarEntrada();
parallaxHero();
animarSecciones();
dibujarRamitas();
cuentaRegresiva();
petalos();
