class SalsaThrow extends MovableObject {
  width = 50;
  height = 50;
  speedY = 10;
  hasHit = false;
  acceleration = 1;
  direction; // true = nach links, false = nach rechts

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
    this.speedX = 10;

    this.rotationSound = new Audio('audio/throw-sound-2.mp3');
    this.rotationSound.volume = 0.4;

    this.throw();
  }

  /** Bewegung + Rotation **/
  throw() {
    this.speedY = 5;
    this.applyGravity();

    this.rotationSound.currentTime = 0;
    this.rotationSound.play().catch(e => console.warn('Rotation sound error:', e));

    this.moveInterval = setInterval(() => {
      if (this.direction) {
        this.x -= this.speedX;
      } else {
        this.x += this.speedX;
      }
    }, 25);

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
        if (callback) callback(); // Danach Objekt entfernen
      }
    }, 100);
  }
}
