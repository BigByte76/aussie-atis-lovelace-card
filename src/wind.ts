// Wind particles drawn on a canvas over the runway map: short streaks that
// drift downwind, like the runway map on aussieadsb.com.
import { headingVector, type Point } from "./model";

export interface WindState {
  /** Direction the wind blows FROM, in degrees. null = variable. */
  direction: number | null;
  speed: number; // knots
  gust: number | null; // knots
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  alpha: number;
  turn: number; // for variable wind: degrees per second
}

const MAX_PARTICLES = 140;

export class WindParticles {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private frame: number | null = null;
  private lastTime = 0;
  private wind: WindState | null = null;
  private rotation = 0;
  private viewWidth = 400;
  private viewHeight = 300;
  private colour = "#888";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  /** Update the wind and view. Particles are regenerated when the wind changes. */
  configure(wind: WindState | null, rotation: number, viewWidth: number, viewHeight: number, colour: string): void {
    const changed =
      JSON.stringify(wind) !== JSON.stringify(this.wind) ||
      rotation !== this.rotation ||
      viewWidth !== this.viewWidth ||
      viewHeight !== this.viewHeight;
    this.wind = wind;
    this.rotation = rotation;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.colour = colour;
    if (changed) this.particles = [];
    if (!this.active) this.clear();
  }

  private get active(): boolean {
    return !!this.wind && this.wind.speed > 0;
  }

  start(): void {
    if (this.frame !== null || !this.active) return;
    this.lastTime = performance.now();
    const step = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.tick(dt);
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  stop(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Match the canvas backing store to its displayed size. */
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  private spawn(randomAge: boolean): Particle {
    const wind = this.wind!;
    // Speed in view-box units per second: visible but calm at low winds.
    const gustFactor = wind.gust && wind.gust > wind.speed ? 1 + Math.random() * (wind.gust / wind.speed - 1) : 1;
    const speed = (6 + wind.speed * 1.5) * gustFactor * (0.85 + Math.random() * 0.3);
    const blowsTo = wind.direction === null ? Math.random() * 360 : wind.direction + 180 + (Math.random() - 0.5) * 16;
    const v: Point = headingVector(blowsTo, this.rotation);
    const life = 2.5 + Math.random() * 3;
    return {
      x: Math.random() * this.viewWidth,
      y: Math.random() * this.viewHeight,
      vx: v.x * speed,
      vy: v.y * speed,
      age: randomAge ? Math.random() * life : 0,
      life,
      alpha: 0.25 + Math.random() * 0.55,
      turn: wind.direction === null ? (Math.random() - 0.5) * 60 : 0,
    };
  }

  private tick(dt: number): void {
    if (!this.active) {
      this.clear();
      return;
    }
    this.resize();
    while (this.particles.length < MAX_PARTICLES) this.particles.push(this.spawn(this.particles.length > 0));

    const ctx = this.ctx;
    const scale = this.canvas.width / this.viewWidth;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.strokeStyle = this.colour;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.3;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.turn) {
        const angle = (p.turn * dt * Math.PI) / 180;
        const vx = p.vx * Math.cos(angle) - p.vy * Math.sin(angle);
        p.vy = p.vx * Math.sin(angle) + p.vy * Math.cos(angle);
        p.vx = vx;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.age += dt;
      const outside = p.x < -10 || p.y < -10 || p.x > this.viewWidth + 10 || p.y > this.viewHeight + 10;
      if (p.age > p.life || outside) {
        this.particles[i] = this.spawn(false);
        continue;
      }
      // Fade in and out over the particle's life.
      const fade = Math.min(1, p.age / 0.6, (p.life - p.age) / 0.6);
      ctx.globalAlpha = p.alpha * fade;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.35, p.y - p.vy * 0.35);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
