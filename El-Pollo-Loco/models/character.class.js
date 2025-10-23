class Character extends MovableObject {

  height = 280;
  width = 120;
  y = 0;
  speed = 10;

  IMAGES_IDLE = [
    'img/2_character_pepe/1_idle/idle/I-1.png',
    'img/2_character_pepe/1_idle/idle/I-2.png',
    'img/2_character_pepe/1_idle/idle/I-3.png',
    'img/2_character_pepe/1_idle/idle/I-4.png',
    'img/2_character_pepe/1_idle/idle/I-5.png',
    'img/2_character_pepe/1_idle/idle/I-6.png',
    'img/2_character_pepe/1_idle/idle/I-7.png',
    'img/2_character_pepe/1_idle/idle/I-8.png',
    'img/2_character_pepe/1_idle/idle/I-9.png',
    'img/2_character_pepe/1_idle/idle/I-10.png'
  ];

  IMAGES_LONG_IDLE = [
    'img/2_character_pepe/1_idle/long_idle/I-11.png',
    'img/2_character_pepe/1_idle/long_idle/I-12.png',
    'img/2_character_pepe/1_idle/long_idle/I-13.png',
    'img/2_character_pepe/1_idle/long_idle/I-14.png',
    'img/2_character_pepe/1_idle/long_idle/I-15.png',
    'img/2_character_pepe/1_idle/long_idle/I-16.png',
    'img/2_character_pepe/1_idle/long_idle/I-17.png',
    'img/2_character_pepe/1_idle/long_idle/I-18.png',
    'img/2_character_pepe/1_idle/long_idle/I-19.png',
    'img/2_character_pepe/1_idle/long_idle/I-20.png'
  ];

  IMAGES_WALKING = [
    'img/2_character_pepe/2_walk/W-21.png',
    'img/2_character_pepe/2_walk/W-22.png',
    'img/2_character_pepe/2_walk/W-23.png',
    'img/2_character_pepe/2_walk/W-24.png',
    'img/2_character_pepe/2_walk/W-25.png',
    'img/2_character_pepe/2_walk/W-26.png',
  ];

  IMAGES_JUMPING = [
    'img/2_character_pepe/3_jump/J-31.png',
    'img/2_character_pepe/3_jump/J-32.png',
    'img/2_character_pepe/3_jump/J-33.png',
    'img/2_character_pepe/3_jump/J-34.png',
    'img/2_character_pepe/3_jump/J-35.png',
    'img/2_character_pepe/3_jump/J-36.png',
    'img/2_character_pepe/3_jump/J-37.png',
    'img/2_character_pepe/3_jump/J-38.png',
    'img/2_character_pepe/3_jump/J-39.png',
  ];

  IMAGES_DEAD = [
    'img/2_character_pepe/5_dead/D-51.png',
    'img/2_character_pepe/5_dead/D-52.png',
    'img/2_character_pepe/5_dead/D-53.png',
    'img/2_character_pepe/5_dead/D-54.png',
    'img/2_character_pepe/5_dead/D-55.png',
    'img/2_character_pepe/5_dead/D-56.png',
    'img/2_character_pepe/5_dead/D-57.png'
  ];

  IMAGES_HURT = [
    'img/2_character_pepe/4_hurt/H-41.png',
    'img/2_character_pepe/4_hurt/H-42.png',
    'img/2_character_pepe/4_hurt/H-43.png'
  ];

  IMAGES_THROW = [
    'img/2_character_pepe/2_walk/W-21.png',
    'img/2_character_pepe/2_walk/W-22.png',
    'img/2_character_pepe/2_walk/W-23.png'
  ];

  world;
  currentAnimation = 'idle';
  animationFinished = true;
  isThrowing = false;         // <<< NEU: Flag während Wurfanimation
  lastActionTime = 0;
  actionCooldown = 500; // Zeit in ms nach der zum Idle gewechselt wird

  constructor() {
    super().loadImage('img/2_character_pepe/1_idle/idle/I-1.png');
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_THROW);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_LONG_IDLE); // Long Idle Bilder laden
    this.applyGravity();
    this.atEndboss = false;
    this.animate();
    this.throwSound = new Audio('audio/throw-sound-1.mp3');
    this.throwSound.volume = 0.4; // etwas leiser
    // this.idleImage = 'img/2_character_pepe/1_idle/idle/I-1.png';
    this.showIdle = false;
    this.lastMoveTime = Date.now();
    this.idleAnimationStarted = false;
    this.longIdleActive = false; // Neue Eigenschaft für Long Idle
    this.longIdleInterval = null; // Für die Long Idle Animation
  }


  // Kollisionsbox Character
  get collisionBox() {
    return {
      x: this.x + 10, // Etwas von links verschieben
      y: this.y + 100, // Hitbox nach unten verschieben (Kopfbereich ausschließen)
      width: this.width - 20, // Breite reduzieren für schmalere Hitbox
      height: this.height - 110 // Höhe reduzieren (Kopf und Füße ausschließen)
    };
  }

  isAboveGround() {
    // Hier muss der "Boden" definiert werden
    // Wenn du unterschiedliche Bodenhöhen hast, musst du das hier anpassen
    const groundLevel = 155; // oder 156 - je nachdem wo dein Boden ist

    return this.y < groundLevel;
  }


  drawFrame(ctx) {
    if (this instanceof Character) {
      const box = this.collisionBox;
      ctx.beginPath();
      ctx.lineWidth = "1";
      ctx.stokeStyle = "blue"; // Andere Farbe für Character
      // Relative Position zur Hitbox zeichnen
      ctx.rect(box.x - this.x, box.y - this.y, box.width, box.height);
      ctx.stroke();
    }
  }


  animate() {
    // Bewegung und Kamera
    setInterval(() => {
      if (this.atEndboss) {
        this.world.camera_x = -4100 + 100;
      } else {
        this.world.camera_x = -this.x + 100;
      }

      // Bewegung
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
        this.handleMovement();
      }

      if (
        this.world.keyboard.LEFT &&
        this.x > 0 &&
        (!this.atEndboss || this.x > 3980)
      ) {
        this.moveLeft();
        this.otherDirection = true;
        this.handleMovement();
      }

      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.jump();
        this.handleMovement();
      }

      // 👉 WURF-ANIMATION (Taste D)
      if (this.world.keyboard.D && this.animationFinished) {
        this.throwAnimation();
        this.lastActionTime = Date.now(); // verhindert Idle-Reset während des Wurfs
        this.lastMoveTime = Date.now(); // <--- doppelt sicher!
      }

      // Endboss-Bereich aktivieren
      if (this.x >= 4100) {
        this.atEndboss = true;
      }

      // Zur Idle-Animation wechseln nach Inaktivität
      if (
        Date.now() - this.lastActionTime > this.actionCooldown &&
        !this.isAboveGround() &&
        !this.isHurt() &&
        !this.isDead() &&
        this.currentAnimation !== 'idle'
      ) {
        this.currentAnimation = 'idle';
      }
    }, 1000 / 60);


    // Animation
    setInterval(() => {
      // Wenn wir gerade werfen, soll die normale Animations-Logik nichts tun
      if (this.isThrowing) return;

      const idleTime = Date.now() - this.lastMoveTime;

      if (this.isDead()) {
        this.stopLongIdleAnimation();
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isHurt()) {
        this.stopLongIdleAnimation();
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.stopLongIdleAnimation();
        this.playAnimation(this.IMAGES_JUMPING);
      } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        this.stopLongIdleAnimation();
        this.playAnimation(this.IMAGES_WALKING);
      } else if (idleTime > 12000) {
        if (!this.longIdleActive) {
          this.startLongIdleAnimation();
        }
      } else if (idleTime > 10000) {
        if (!this.idleAnimationStarted) {
          this.playIdleAnimation();
        }
      } else {
        this.stopLongIdleAnimation();
        this.loadImage(this.IMAGES_IDLE[0]);
      }
    }, 50);

  }

  handleMovement() {
    this.lastMoveTime = Date.now();
    this.idleAnimationStarted = false;
    this.stopLongIdleAnimation();
  }

  throwAnimation() {
    // blockiere weitere Würfe
    if (!this.animationFinished || this.isThrowing) return;

    this.animationFinished = false;
    this.isThrowing = true;
    this.lastActionTime = Date.now(); // verhindert dass sofort Idle startet

    // 🎵 Sound abspielen
    this.throwSound.currentTime = 0; // Start von vorne, falls schnell mehrfach geworfen wird
    this.throwSound.play();

    const throwImages = this.IMAGES_THROW; // benutze das Array aus der Klasse
    let current = 0;

    // Zeige jedes Frame für 200ms -> gesamt 600ms
    const frameDuration = 50;

    const interval = setInterval(() => {
      // Lade aktuelles Frame
      const path = throwImages[current];
      if (path) this.loadImage(path);

      current++;

      // alle Frames gezeigt?
      if (current >= throwImages.length) {
        clearInterval(interval);

        // kleine Pause (optional), dann zurück zur normalen Idle-Anzeige
        setTimeout(() => {
          // Wenn Salsa-Flaschen vorhanden sind, werfe eine
          if (this.world.statusBarSalsa.salsaCount > 0) {
            this.world.statusBarSalsa.salsaCount--;

            // Neue Salsa-Flasche erzeugen
            const offsetX = this.otherDirection ? -50 : 100;
            const salsa = new SalsaThrow(this.x + offsetX, this.y + 60, this.otherDirection);
            this.world.throwableObjects.push(salsa);

            // Optional: Wurf-Sound (bereits in throwSound enthalten)
          }

          // Reset zurück zur Idle-Animation
          this.loadImage(this.IMAGES_IDLE[0]);
          this.animationFinished = true;
          this.isThrowing = false;
        }, 50);
      }
    }, frameDuration);
  }



  startLongIdleAnimation() {
    this.longIdleActive = true;
    this.idleAnimationStarted = false;
    let currentImageIndex = 0;

    this.longIdleInterval = setInterval(() => {
      // Prüfen ob Bewegung stattfindet
      if (Date.now() - this.lastMoveTime < 12000) {
        this.stopLongIdleAnimation();
        return;
      }

      // Long Idle Animation in Schleife abspielen
      this.loadImage(this.IMAGES_LONG_IDLE[currentImageIndex]);
      currentImageIndex = (currentImageIndex + 1) % this.IMAGES_LONG_IDLE.length;
    }, 200); // Geschwindigkeit der Long Idle Animation
  }

  stopLongIdleAnimation() {
    if (this.longIdleInterval) {
      clearInterval(this.longIdleInterval);
      this.longIdleInterval = null;
    }
    this.longIdleActive = false;
  }

  playIdleAnimation() {
    this.idleAnimationStarted = true;
    let currentImage = 0;

    const idleInterval = setInterval(() => {
      // Prüfen ob Bewegung stattfindet oder Long Idle beginnen sollte
      if (Date.now() - this.lastMoveTime < 10000 || Date.now() - this.lastMoveTime > 12000) {
        clearInterval(idleInterval);
        this.idleAnimationStarted = false;
        return;
      }

      if (currentImage < this.IMAGES_IDLE.length) {
        this.loadImage(this.IMAGES_IDLE[currentImage]);
        currentImage++;
      } else {
        // Bei letztem Bild stehen bleiben
        this.loadImage(this.IMAGES_IDLE[this.IMAGES_IDLE.length - 1]);
      }
    }, 200);
  }

  applyGravity() {
    setInterval(() => {
      let previousY = this.y; // Vorherige Position speichern
      let previousSpeedY = this.speedY; // Vorherige Geschwindigkeit speichern

      // Gravity anwenden
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }

      // Character auf Boden-Position fixieren
      if (!this.isAboveGround() && this.speedY <= 0) {
        this.y = 155; // Auf exakte Boden-Position setzen
        this.speedY = 0; // Fallgeschwindigkeit zurücksetzen
      }

      // // Y-Wert nach dem Fallen anzeigen
      // if (previousSpeedY > 0 && this.speedY <= 0) {
      //   console.log("✅ Fall beendet! End-Y-Position:", this.y,
      //     "Gefallen von Y:", previousY, "zu Y:", this.y);
      // }

      // // Auf dem Boden
      // if (!this.isAboveGround()) {
      //   if (previousY !== this.y) {
      //     console.log("🏁 Auf dem Boden gelandet! Y-Position:", this.y);
      //   }
      // }
    }, 1000 / 25);
  }
}