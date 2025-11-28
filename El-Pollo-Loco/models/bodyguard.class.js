class Bodyguard extends MovableObject {
  height = 180;
  width = 160;
  y = 150;
  energy = 100;   // ★ NEU: Bodyguard kann sterben (z.B. nach 1 Treffer)
  isDead = false;
  isJumping = false;
  jumpInterval = null;


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

    // 🔈 Hurt-Sound RICHTIG definieren!
    this.hurtSound = new Audio('audio/bodyguard-1.mp3');
    this.hurtSound.volume = 0.6;
    this.hurtSound.load();
  }


  jumpInterval = null; // GANZ OBEN in der Klasse ergänzen!


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

    // SOUND ABspielen
    this.hurtSound.currentTime = 0;
    this.hurtSound.play().catch(e => console.warn('Soundfehler:', e));

    // Animation starten
    this.playAnimation(this.IMAGES_HURT);

    this.energy -= 25;  // 4 Treffer = Tod

    if (this.energy <= 0) {
      this.die();
    } else {
      // Nach 400ms weiterlaufen
      setTimeout(() => {
        this.startAttackLoop();  // weiterlaufen
      }, 400);
    }
  }


  die() {
    this.isDead = true;
    clearInterval(this.attackInterval);

    this.playAnimation(this.IMAGES_HURT);  // Letzter Schlag
    setTimeout(() => {
      this.startFallingWhenDead();
    }, 500);
  }


  startFallingWhenDead() {
    if (this.fallInterval) return;
    let fallSpeed = 0;

    this.fallInterval = setInterval(() => {
      if (this.isPaused || (this.world && this.world.isPaused)) return;

      if (this.isDead) {
        fallSpeed += 0.5;
        this.y += fallSpeed;

        if (this.y > 600) {
          clearInterval(this.fallInterval);
          this.removeFromWorld();
        }
      }
    }, 1000 / 30);
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
