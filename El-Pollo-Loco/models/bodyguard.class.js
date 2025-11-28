class Bodyguard extends MovableObject {
  height = 180;
  width = 160;
  y = 150;
  energy = 100;
  isDead = false;
  isJumping = false;
  jumpInterval = null;
  attackInterval = null;


  // 🔊 Sounds
  bodyguardSound = new Audio('audio/bodyguard-sound.mp3');
  boomSound = new Audio('audio/Boom.mp3');

  IMAGE = 'img/4_enemie_boss_chicken/1_walk/G2.png';

  IMAGES_JUMP_START = ['img/4_enemie_boss_chicken/3_attack/G20.png'];
  IMAGES_JUMP_UP = ['img/4_enemie_boss_chicken/3_attack/G19.png'];
  IMAGES_JUMP_HOVER = ['img/4_enemie_boss_chicken/3_attack/G18.png'];
  IMAGES_LAND = [
    'img/4_enemie_boss_chicken/3_attack/G17.png',
    'img/4_enemie_boss_chicken/3_attack/G16.png',
    'img/4_enemie_boss_chicken/3_attack/G15.png',
    'img/4_enemie_boss_chicken/3_attack/G14.png',
    'img/4_enemie_boss_chicken/3_attack/G13.png'
  ];

  IMAGES_WALK = [
    'img/4_enemie_boss_chicken/1_walk/G1.png',
    'img/4_enemie_boss_chicken/1_walk/G2.png',
    'img/4_enemie_boss_chicken/1_walk/G3.png',
    'img/4_enemie_boss_chicken/1_walk/G4.png'
  ];

  IMAGES_HURT = [
    'img/4_enemie_boss_chicken/4_hurt/G21.png',
    'img/4_enemie_boss_chicken/4_hurt/G22.png',
    'img/4_enemie_boss_chicken/4_hurt/G23.png'
  ];

  IMAGES_DEAD = [
    'img/4_enemie_boss_chicken/5_dead/G24.png',
    'img/4_enemie_boss_chicken/5_dead/G25.png',
    'img/4_enemie_boss_chicken/5_dead/G26.png'
  ];


  constructor() {
    super();
    this.x = 4700;
    this.loadImage(this.IMAGE);
    this.applyGravity();

    // Bilder vorladen
    this.loadImages(this.IMAGES_JUMP_START);
    this.loadImages(this.IMAGES_JUMP_UP);
    this.loadImages(this.IMAGES_JUMP_HOVER);
    this.loadImages(this.IMAGES_LAND);
    this.loadImages(this.IMAGES_WALK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);

    // 🔈 Hurt-Sound RICHTIG definieren!
    this.hurtSound = new Audio('audio/bodyguard-hurt.mp3');
    this.hurtSound.volume = 0.6;
    this.hurtSound.load();
  }


  jumpToEndboss() {
    if (this.isJumping) return;
    this.isJumping = true;

    // 🔊 Sound: Bodyguard springt runter
    this.bodyguardSound.currentTime = 0;
    this.bodyguardSound.play();

    // Sprungkraft
    this.speedY = 32;
    this.speedX = -12;
    this.playAnimation(this.IMAGES_JUMP_START);

    // ❗ Intervall speichern (wichtig!)
    this.jumpInterval = setInterval(() => {

      if (this.speedY > 0) {
        this.playAnimation(this.IMAGES_JUMP_UP);
      } else {
        this.playAnimation(this.IMAGES_JUMP_HOVER);
      }

      this.x += this.speedX;
      this.speedX *= 0.99;

      // --- LANDUNG ---
      if (this.speedY <= 0 && !this.isAboveGround()) {
        this.y = 260;
        this.speedY = 0;
        this.speedX = 0;

        this.boomSound.currentTime = 0;
        this.boomSound.play();

        if (this.world) {
          this.world.jumpFromShock();
        }

        // ⛔ SPRUNG-INTERVALL KORREKT BEENDEN!
        clearInterval(this.jumpInterval);
        this.jumpInterval = null;

        this.landAnimation();
        this.isJumping = false;
      }

    }, 40);
  }

  landAnimation() {
    this.playAnimation(this.IMAGES_LAND);

    setTimeout(() => {
      this.loadImage('img/4_enemie_boss_chicken/3_attack/G13.png');

      // Nach 1 Sekunde Endlosschleife starten
      setTimeout(() => {
        this.startAttackLoop();
      }, 1000);

    }, this.IMAGES_LAND.length * 100);
  }



  startAttackLoop() {
    // ❗ Sicherstellen, dass nur EIN Intervall aktiv ist:
    if (this.attackInterval) {
      clearInterval(this.attackInterval);
    }

    this.speedX = -10;
    this.otherDirection = false;

    this.attackInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALK);
      this.x += this.speedX;

      if (this.x <= 4000) {
        this.speedX = 0;
        setTimeout(() => {
          this.otherDirection = true;
          this.speedX = +10;
        }, 200);
      }

      if (this.x >= 4570) {
        this.speedX = 0;
        setTimeout(() => {
          this.otherDirection = false;
          this.speedX = -10;
        }, 200);
      }
    }, 60);
  }


  get collisionBox() {
    return {
      x: this.x,
      y: this.y + 30, // 🔥 Box etwas nach unten verschieben
      width: this.width,
      height: this.height - 30
    };
  }



  hit() {
    if (this.isDead) return;

    // ✅ Sofort stehen bleiben & Angriffs-Intervall stoppen
    if (this.attackInterval) {
      clearInterval(this.attackInterval);
      this.attackInterval = null;
    }
    this.speedX = 0;

    // SOUND abspielen
    this.hurtSound.currentTime = 0;
    this.hurtSound.play().catch(e => console.warn('Soundfehler:', e));

    // SCHADEN zufügen
    this.energy -= 25;  // 4 Treffer = Tod

    // Wenn tot → direkt Sterbe-Logik
    if (this.energy <= 0) {
      this.die();
      return;
    }

    // 🔁 Hurt-Animation 2× abspielen – LANGSAM & BLOCKIEREND
    const FRAMES_PER_LOOP = this.IMAGES_HURT.length; // z.B. 3 Bilder
    const LOOPS = 2;                                  // 2x abspielen
    const TOTAL_FRAMES = FRAMES_PER_LOOP * LOOPS;     // z.B. 6 Frames
    const FRAME_DELAY = 100;                          // 100 ms pro Frame

    let frameCounter = 0;

    const hurtInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_HURT);
      frameCounter++;

      if (frameCounter >= TOTAL_FRAMES) {
        clearInterval(hurtInterval);

        // 👉 Erst jetzt wieder laufen lassen
        this.startAttackLoop();
      }
    }, FRAME_DELAY);
  }



  die() {
    if (this.isDead) return;
    this.isDead = true;

    // ❗ Alle Bewegungs-Intervalle stoppen
    if (this.attackInterval) clearInterval(this.attackInterval);
    if (this.jumpInterval) clearInterval(this.jumpInterval);
    this.speedX = 0; // stehen bleiben

    // 🔊 Sound erst NACH 200ms abspielen
    if (!this.dieSound) {
      this.dieSound = new Audio('audio/bodyguard-die.mp3');
      this.dieSound.volume = 0.5;
    }
    setTimeout(() => {
      this.dieSound.currentTime = 0;
      this.dieSound.play();
    }, 200);  // kurze Verzögerung für besseren Effekt

    // 👉 Sofort den Fall starten (ohne extra Animation vorher!)
    this.startFallingWhenDead();
  }



  startFallingWhenDead() {
    if (this.fallInterval) return;

    let fallSpeed = 0;

    // IMAGES_DEAD Endlosschleife während Fall
    this.deathAnimInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_DEAD);
    }, 200);  // du kannst hier z.B. 300 (langsamer) oder 100 (schneller) probieren

    // GRAVITY / FALL
    this.fallInterval = setInterval(() => {
      if (this.isPaused || (this.world && this.world.isPaused)) return;

      fallSpeed += 0.5;
      this.y += fallSpeed;

      // Wenn aus dem Bild verschwunden → stoppen & entfernen
      if (this.y > 600) {
        clearInterval(this.fallInterval);
        clearInterval(this.deathAnimInterval);
        this.removeFromWorld();
      }
    }, 1000 / 30); // 30 FPS
  }




  removeFromWorld() {
    if (this.world) {
      const i = this.world.level.enemies.indexOf(this);
      if (i > -1) {
        this.world.level.enemies.splice(i, 1);
        console.log("🗑️ Bodyguard wurde entfernt!");
      }
    }
  }


}
