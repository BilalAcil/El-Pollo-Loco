class ChickenCoop extends MovableObject {
  height = 200;
  width = 230;
  y = 230;

  IMAGE = 'img/15_Chicken-Coop/Coop_img.png';

  constructor() {
    super();
    this.loadImage(this.IMAGE);
    this.x = 4470
  }
}