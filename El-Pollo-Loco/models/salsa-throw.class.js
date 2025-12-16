class SalsaThrow extends MovableObject {
  width = 50;
  height = 50;

  speedX = 8;
  speedY = 10;
  acceleration = 0.45;
  direction;
  hasHit = false;

  IMAGES_ROTATION = [
    'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
  ];

  IMAGES_SPLASH = [
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png'
  ];

  constructor(x, y, direction) {
    super().loadImage(this.IMAGES_ROTATION[0]);
    this.loadImages(this.IMAGES_ROTATION);
    this.loadImages(this.IMAGES_SPLASH);
    this.x = x;
    this.y = y;
    this.direction = direction;

    this.rotationSound = new Audio('audio/throw-sound-2.mp3');
    this.rotationSound.volume = 0.4;

    this.hitSound = new Audio('audio/hit-sound.mp3');
    this.hitSound.volume = 0.5;

    this.throw();
  }

  /** 🚀 Startet den Wurf **/
  throw() {
    this.rotationSound.currentTime = 0;
    this.rotationSound.play().catch(e => console.warn('Rotation sound error:', e));

    this.moveInterval = setInterval(() => {
      // Bewegung X
      if (this.direction) {
        this.x -= this.speedX;
      } else {
        this.x += this.speedX;
      }
      this.speedX *= 0.99;

      // Bewegung Y
      this.y -= this.speedY;
      this.speedY -= this.acceleration;

      // --- 🟤 BODENKONTAKT ---
      if (this.y >= 380 && !this.hasHit) {
        this.hasHit = true;

        // 🎵 Bodentreffer-Sound
        this.hitSound.currentTime = 0;
        this.hitSound.play().catch(e => console.warn('Hit sound error:', e));

        this.splashAnimation();
      }

    }, 25);

    // Dreh-Animation
    this.rotationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_ROTATION);
    }, 50);
  }

  stopSound() {
    if (this.rotationSound) {
      this.rotationSound.pause();
      this.rotationSound.currentTime = 0;
    }
  }

  /** 💥 Splash-Animation **/
  splashAnimation(callback) {
    this.stopSound();
    clearInterval(this.moveInterval);
    clearInterval(this.rotationInterval);

    this.speedY = 0;
    this.speedX = 0;

    let i = 0;
    const interval = setInterval(() => {
      this.loadImage(this.IMAGES_SPLASH[i]);
      i++;

      if (i >= this.IMAGES_SPLASH.length) {
        clearInterval(interval);

        setTimeout(() => {
          this.loadImage('');
          this.width = 0;
          this.height = 0;

          if (callback) callback();
        }, 200);
      }
    }, 100);
  }

}
