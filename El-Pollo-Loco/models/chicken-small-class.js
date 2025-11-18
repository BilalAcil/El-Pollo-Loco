class ChickenSmall extends MovableObject {

  y = 375;
  height = 50;
  width = 40;
  isDead = false;

  IMAGES_WALKING = [
    'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
    'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
    'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
  ];

  IMAGE_DEAD = 'img/3_enemies_chicken/chicken_small/2_dead/dead.png';

  constructor() {
    super().loadImage('img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
    this.loadImages(this.IMAGES_WALKING);

    this.x = 500 + Math.random() * 4000;
    this.speed = 0.15 + Math.random() * 0.2;

    this.animate();
  }

  animate() {
    // 🟢 Bewegung starten und merken
    this.moveInterval = setInterval(() => {
      // Nur bewegen, wenn der Gegner noch lebt
      if (!this.isDead) {
        this.moveLeft(); // Gegner bewegt sich nach links
      }
    }, 1000 / 60); // 60 FPS = flüssige Bewegung

    // 🟣 Animation starten und merken
    this.animationInterval = setInterval(() => {
      // Nur animieren, wenn der Gegner noch lebt
      if (!this.isDead) {
        this.playAnimation(this.IMAGES_WALKING); // Lauf-Animation abspielen
      }
    }, 200); // Wechselt alle 200ms das Bild → typische Lauf-Animation
  }

}
