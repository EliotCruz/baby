import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- entrada */
let tarjetaMostrada = false;

function animarEntrada() {
  if (sinMovimiento) {
    const card = document.querySelector<HTMLElement>('[data-hero-info-card]');
    if (card) {
      card.style.opacity = '1';
      card.style.transform = 'none';
      card.style.pointerEvents = 'auto';
    }
    return;
  }

  // 1. Título superior: entrada inmediata, flotando libre sobre el video
  gsap.set('[data-hero-title-item]', { opacity: 0, y: -16 });
  gsap.set('[data-hero-scroll]', { opacity: 0, y: 10 });

  // 2. Tarjeta informativa: inicialmente invisible y comprimida, esperando el segundo 7
  gsap.set('[data-hero-info-card]', {
    opacity: 0,
    y: 36,
    scale: 0.92,
    pointerEvents: 'none',
  });
  gsap.set('[data-hero-card-item]', { opacity: 0, y: 14 });
  gsap.set('[data-hero-card-line]', { scaleX: 0, transformOrigin: 'left center' });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('[data-parallax] :is(img, video)', { scale: 1.06, duration: 1.8, ease: 'power2.out' }, 0)
    .to('[data-hero-title-item]', { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, 0.2);

  configurarAparicionTarjeta();
}

function mostrarTarjetaInfo() {
  if (tarjetaMostrada) return;
  tarjetaMostrada = true;

  const card = document.querySelector<HTMLElement>('[data-hero-info-card]');
  if (!card) return;

  const tlCard = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tlCard
    .to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: 'elastic.out(1, 0.75)',
      onStart: () => {
        card.setAttribute('data-revelada', 'true');
        card.style.pointerEvents = 'auto';
      },
    })
    .to('[data-hero-card-line]', { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.75')
    .to('[data-hero-card-item]', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, '-=0.6')
    .to('[data-hero-scroll]', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');
}

function configurarAparicionTarjeta() {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');

  // Disparar cuando el video alcance el segundo 6.8 - 7 (aterrizaje del limón en la carriola)
  if (video) {
    const alActualizarTiempo = () => {
      if (video.currentTime >= 6.8) {
        mostrarTarjetaInfo();
        video.removeEventListener('timeupdate', alActualizarTiempo);
      }
    };
    video.addEventListener('timeupdate', alActualizarTiempo);
  }

  // Respaldo de seguridad en caso de que el video tarde o autoplay esté pausado
  setTimeout(mostrarTarjetaInfo, 7200);

  // Respaldo si el usuario hace scroll hacia abajo antes del segundo 7
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 30) {
        mostrarTarjetaInfo();
      }
    },
    { once: true, passive: true }
  );
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

/* ----------------------------------------------------------- video hero */
function iniciarVideoHero() {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!video) return;
  video.muted = true;
  video.play().catch(() => {});
}

iniciarVideoHero();
animarEntrada();
parallaxHero();
animarSecciones();
dibujarRamitas();
cuentaRegresiva();
petalos();

