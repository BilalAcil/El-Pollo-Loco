class Bodyguard extends MovableObject {
  height = 180;
  width = 160;
  y = 150;
  energy = 100;   // ★ NEU: Bodyguard kann sterben (z.B. nach 1 Treffer)
  isDead = false;
  isJumping = false;

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

    // 🟢 NEU: WALK-Bilder vorladen!
    this.loadImages(this.IMAGES_WALK);
  }



  jumpToEndboss() {
    if (this.isJumping) return;
    this.isJumping = true;

    // 🔊 Sound: Bodyguard springt runter
    this.bodyguardSound.currentTime = 0;   // optional: immer von vorne
    this.bodyguardSound.play();

    // Sprungkraft
    this.speedY = 32;       // vertikal
    this.speedX = -12;      // horizontal
    this.playAnimation(this.IMAGES_JUMP_START);

    const interval = setInterval(() => {

      // SPRUNGPHASEN
      if (this.speedY > 0) {
        this.playAnimation(this.IMAGES_JUMP_UP);     // hoch
      } else {
        this.playAnimation(this.IMAGES_JUMP_HOVER);  // oben schweben
      }

      // Flug — leichte Reibung (damit er nicht unendlich fliegt)
      this.x += this.speedX;
      this.speedX *= 0.99;

      // --- LANDUNG ---
      if (this.speedY <= 0 && !this.isAboveGround()) {
        this.y = 260;
        this.speedY = 0;
        this.speedX = 0;

        // 🔊 Sound: Aufprall-Boom
        this.boomSound.currentTime = 0;
        this.boomSound.play();

        // 👉 ALLE Objekte kurz hüpfen lassen
        if (this.world) {
          this.world.jumpFromShock();   // 🚀 SCHOCK-EFFEKT HIER
        }

        this.landAnimation();
        this.isJumping = false;
        clearInterval(interval);
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
    this.speedX = -10;
    this.otherDirection = false; // Blick nach links

    this.attackInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALK);
      this.x += this.speedX;

      // LINKS ► RECHTS
      if (this.x <= 4000) {
        this.speedX = 0;            // kurz stehen bleiben
        setTimeout(() => {
          this.otherDirection = true;
          this.speedX = +10;        // dann erst loslaufen
        }, 200); // 200ms Pause
      }

      // RECHTS ► LINKS
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
    this.energy -= 25; // oder 100 direkt killen

    if (this.energy <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    clearInterval(this.attackInterval);   // stoppe Bewegung!
    this.playAnimation(this.IMAGES_LAND); // kleine Todesanimation
    this.startFallingWhenDead();          // WIE ENDBOSS!
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
