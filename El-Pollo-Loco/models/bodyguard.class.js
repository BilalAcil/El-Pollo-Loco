class Bodyguard extends MovableObject {
  height = 180;
  width = 160;
  y = 150;
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
  }


  jumpToEndboss() {
    if (this.isJumping) return;
    this.isJumping = true;

    // 🔊 Sound: Bodyguard springt runter
    this.bodyguardSound.currentTime = 0.5;   // optional: immer von vorne
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
        this.boomSound.currentTime = 0;   // optional
        this.boomSound.play();

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
    }, this.IMAGES_LAND.length * 100);
  }


  // Bodenprüfung
  isAboveGround() {
    return this.y < 260;
  }
}
