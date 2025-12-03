class Bodyguard extends MovableObject {
  height = 180;
  width = 160;
  y = 150;
  energy = 100;
  isDead = false;
  isJumping = false;
  jumpInterval = null;
  attackInterval = null;
  lastSpeedX = 0;
  lastDirection = false;  // false = rechts schauen / true = links schauen



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
    this.hasJumped = false;

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
    if (this.isJumping || this.hasJumped) return;  // 🛑 DOPPEL-Schutz
    this.isJumping = true;
    this.hasJumped = true;    // Sobald gestartet → Flag setzen

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

          // ⬇️ Hier Statusbar ERST jetzt erstellen!
          if (!this.world.bodyguardStatus) {
            this.world.bodyguardStatus = new BodyguardStatusBar(this.world);
            this.world.addToMap(this.world.bodyguardStatus);  // ✨ WICHTIG!
          }
        }

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

      // ❗ Spieler wieder freigeben
      if (this.world && this.world.character) {
        this.world.character.freezeForBodyguard = false;
      }

      // Nach 1 Sekunde Angriff starten
      setTimeout(() => {
        this.startAttackLoop();
      }, 1000);

    }, this.IMAGES_LAND.length * 100);
  }




  startAttackLoop() {
    if (!this.hasJumped) return;                  // ❗ Nur nach dem Sprung aktiv!

    if (this.attackInterval) clearInterval(this.attackInterval);

    // 👉 Falls Werte aus Pause/HIT existieren → diese verwenden!
    if (this.lastSpeedX !== 0) {
      this.speedX = this.lastSpeedX;
    } else if (this.speedX === 0) {
      this.speedX = -15;                          // Standard: nach links starten
    }

    // 👉 Blickrichtung nicht überschreiben!
    if (this.lastDirection !== undefined) {
      this.otherDirection = this.lastDirection;
    } else if (this.otherDirection === undefined) {
      this.otherDirection = false;                // Standard-Richtung
    }

    this.attackInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALK);
      this.x += this.speedX;

      // 🔁 Normale Laufgrenzen
      if (this.x <= 4000) {
        this.speedX = 0;
        setTimeout(() => {
          this.otherDirection = true;
          this.speedX = +15;
        }, 200);
      }

      if (this.x >= 4570) {
        this.speedX = 0;
        setTimeout(() => {
          this.otherDirection = false;
          this.speedX = -15;
        }, 200);
      }

      // 💾 Aktuelle Werte merken (wichtig für Pause/HIT)
      this.lastSpeedX = this.speedX;
      this.lastDirection = this.otherDirection;

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

    // STOPPEN
    if (this.attackInterval) {
      clearInterval(this.attackInterval);
      this.attackInterval = null;
    }

    // 💾 Letzte Richtung vorm Hit speichern
    this.lastDirection = this.otherDirection;
    this.lastSpeedX = this.speedX;
    this.speedX = 0;

    // SOUND
    this.hurtSound.currentTime = 0;
    this.hurtSound.play().catch(e => console.warn('Soundfehler:', e));

    // SCHADEN
    this.energy -= 25;

    // 🔁 STATUS LEISTE UPDATEN
    if (this.world && this.world.bodyguardStatus) {
      this.world.bodyguardStatus.setPercentage(this.energy);
    }

    // ❗❗❗ HIER FÜGEN WIR DEN FALLBACK EIN ❗❗❗
    if (this.world && this.world.character) {
      const player = this.world.character;

      // 1️⃣ Spieler steht rechts → Bodyguard soll NICHT zurückweichen:
      if (player.x > this.x) {
        this.otherDirection = false;  // Rechts schauen
        this.speedX = 5;              // leicht vorwärts gehen
      }

      // 2️⃣ Spieler steht links → Bodyguard soll auch nicht zurückweichen:
      else {
        this.otherDirection = true;   // Links schauen
        this.speedX = -5;             // leicht vorwärts gehen
      }
    }
    // ❗ ENDE DES FALLBACKS


    // WENN TOT → STERBEN
    if (this.energy <= 0) {
      this.die();
      return;
    }

    // HURT ANIMATION (bleibt gleich)
    const FRAMES_PER_LOOP = this.IMAGES_HURT.length;
    const LOOPS = 2;
    const TOTAL_FRAMES = FRAMES_PER_LOOP * LOOPS;
    const FRAME_DELAY = 100;

    let frameCounter = 0;
    const hurtInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_HURT);
      frameCounter++;
      if (frameCounter >= TOTAL_FRAMES) {
        clearInterval(hurtInterval);
        this.startAttackLoop();
      }
    }, FRAME_DELAY);
  }


  die() {
    if (this.isDead) return;
    this.isDead = true;

    // 🧹 STATUSBAR ENTFERNEN (WICHTIG!)
    if (this.world?.bodyguardStatus) {
      console.log("🧹 Bodyguard-Statusbar entfernt!");
      this.world.bodyguardStatus = null;
    }

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
    }, 200);

    // 👉 Sofort den Fall starten
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

  pause() {
    // Alle Bewegungs-Intervalle pausieren
    if (this.attackInterval) clearInterval(this.attackInterval);
    if (this.jumpInterval) clearInterval(this.jumpInterval);
    if (this.fallInterval) clearInterval(this.fallInterval);
  }

  resume() {
    if (!this.isDead && !this.isJumping) {
      this.speedX = this.lastSpeedX;        // Bewegung wiederherstellen
      this.otherDirection = this.lastDirection;
      this.startAttackLoop();
    }
  }



}
