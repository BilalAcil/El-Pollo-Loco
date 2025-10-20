class ChickenNest extends MovableObject {
  height = 100;
  width = 160;
  y = 365;

  IMAGE = 'img/4_enemie_boss_chicken/6_idle/Chicken-Nest.png';

  constructor() {
    super();
    this.loadImage(this.IMAGE);
    this.x = 4490; // Position des Hühnernests
  }
}