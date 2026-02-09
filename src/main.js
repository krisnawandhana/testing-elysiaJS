import "./style.css";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ======================
   UTIL
====================== */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/* ======================
   PARTICLE
====================== */
class Particle {
  constructor(x, y, angle, speed, size, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = random(60, 100);
    this.size = size;
    this.color = color;
    this.gravity = 0.05;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life--;
  }

  draw() {
    ctx.globalAlpha = this.life / 100;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* ======================
   FIREWORK
====================== */
class Firework {
  constructor() {
    this.x = random(100, canvas.width - 100);
    this.y = canvas.height;
    this.targetY = random(canvas.height * 0.2, canvas.height * 0.5);
    this.speed = random(6, 9);
    this.exploded = false;
    this.trail = [];
    this.particles = [];
    this.color = `hsl(${random(0, 360)}, 100%, 60%)`;
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;

      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 8) this.trail.shift();

      if (this.y <= this.targetY) {
        this.explode();
      }
    } else {
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => p.life > 0);
    }
  }

  draw() {
    if (!this.exploded) {
      // trail
      ctx.beginPath();
      this.trail.forEach((p, i) => {
        ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // head
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      this.particles.forEach(p => p.draw());
    }
  }

  explode() {
    this.exploded = true;

    // inner burst
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push(
        new Particle(this.x, this.y, angle, random(2, 4), 2, this.color)
      );
    }

    // outer burst
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          angle,
          random(4, 7),
          2.5,
          `hsl(${random(0, 360)}, 100%, 60%)`
        )
      );
    }
  }
}

/* ======================
   LOOP
====================== */
const fireworks = [];

function launchFireworks() {
  const count = Math.floor(random(1, 3));
  for (let i = 0; i < count; i++) {
    fireworks.push(new Firework());
  }
}

// lebih rame tapi tetap smooth
setInterval(launchFireworks, 600);

function animate() {
  // fade effect (motion blur)
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  fireworks.forEach(fw => {
    fw.update();
    fw.draw();
  });

  requestAnimationFrame(animate);
}

animate();
