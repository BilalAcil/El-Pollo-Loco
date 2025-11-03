class Maracas extends MovableObject {
  height = 40;
  width = 60;
  y = 380;
  rotation = -50; // Drehwinkel in Grad

  IMAGE = 'img/14_maracas/maracas.png';

  constructor() {
    super();
    this.loadImage(this.IMAGE);
    this.x = 4545
  }
}