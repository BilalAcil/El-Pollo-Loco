class SalsaThrow extends MovableObject {
  width = 50;
  height = 50;
  speedY = 10;
  acceleration = 1;
  direction; // true = nach links, false = nach rechts

  IMAGES_ROTATION = [
    'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
  ];

  constructor(x, y, direction) {
    super().loadImage(this.IMAGES_ROTATION[0]);
    this.loadImages(this.IMAGES_ROTATION);
    this.x = x;
    this.y = 330;
    this.direction = direction;
    this.speedX = 10; // Wurfgeschwindigkeit

    // 🎵 Sound vorbereiten
    this.rotationSound = new Audio('audio/throw-sound-2.mp3');
    this.rotationSound.volume = 0.4;

    this.throw();
  }

  /** Bewegung + Rotation **/
  throw() {
    this.speedY = 5; // Start-Höhe
    this.applyGravity();


    // 🎧 Starte Rotations-Sound beim Flugbeginn
    this.rotationSound.currentTime = 0;
    this.rotationSound.play().catch(e => console.warn('Rotation sound error:', e));

    setInterval(() => {
      // Richtung des Wurfs
      if (this.direction) {
        this.x -= this.speedX;
      } else {
        this.x += this.speedX;
      }
    }, 25);

    // Rotation der Flasche
    setInterval(() => {
      this.playAnimation(this.IMAGES_ROTATION);
    }, 50);
  }
}
