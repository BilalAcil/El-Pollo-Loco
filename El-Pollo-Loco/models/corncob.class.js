class Corncob extends MovableObject {
  height = 80;
  width = 60;
  y = 350;

  IMAGE = 'img/12_corncob/corncob.png';

  constructor() {
    super();
    this.loadImage(this.IMAGE);
    this.x = 4000;
  }

  // 🎯 Eigene, etwas kleinere Kollisionsbox
  get collisionBox() {
    return {
      x: this.x + 12,         // links etwas innen
      y: this.y + 10,         // oben etwas innen
      width: this.width - 20, // rechts/links schmaler
      height: this.height - 20 // oben/unten etwas kleiner
    };
  }
}
