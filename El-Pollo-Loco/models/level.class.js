class Level {
  enemies;
  clouds;
  backgroundObjects;
  corncobs;
  level_end_x;
  bodyguards;

  constructor(enemies, clouds, backgroundObjects, corncobs = [], bodyguards, level_end_x = 4500) {
    this.bodyguards = bodyguards;
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.corncobs = corncobs;
    this.level_end_x = level_end_x;
  }
}
