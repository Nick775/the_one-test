$(document).ready(function () {
  generateMap();
  spawnPlayer();
  spawnEnemies();
  spawnHealthPotions();
  spawnDamageBooster();
  addKeyPressListener();
  setInterval(moveEnemies, 1000);
});
let map = [];
let playerPosition = { row: 0, col: 0 };
let enemies = [];
let healthPotions = [];
let damageBoosters = [];
let playerHealth = 6;
let playerDamage = 1;

function generateMap() {
  let mapContainer = $(".field");

  for (let i = 0; i < 24; i++) {
    map[i] = [];
    for (let j = 0; j < 40; j++) {
      map[i][j] = "tileW";
    }
  }

  let countOfHallsX = getRandomInt(6, 9);
  let countOfHallsY = getRandomInt(6, 9);

  for (let i = 0; i < countOfHallsX; i++) {
    let hallPositionX = getRandomInt(1, 23);
    for (let j = 0; j < 40; j++) {
      map[hallPositionX][j] = "tile";
    }

    let roomSizeX = getRandomInt(3, 8);
    let roomSizeY = getRandomInt(3, 8);

   
    for (let ry = 0; ry < roomSizeY; ry++) {
      for (let rx = 0; rx < roomSizeX; rx++) {
        if (hallPositionX > 8) {
          map[hallPositionX - ry][rx] = "tile";
        } else {
          map[hallPositionX + ry][rx] = "tile";
        }
      }
    }
  }

  for (let i = 0; i < countOfHallsY; i++) {
    let hallPositionY = getRandomInt(1, 23);
    for (let j = 0; j < 24; j++) {
      map[j][hallPositionY] = "tile";
    }
    let roomPositionY = getRandomInt(1, 15); 

    let roomSizeX = getRandomInt(3, 8);
    let roomSizeY = getRandomInt(3, 8);


    for (let ry = 0; ry < roomSizeY; ry++) {
      for (let rx = 0; rx < roomSizeX; rx++) {
        map[roomPositionY + ry][rx + hallPositionY] = "tile";
      }
    }
  }

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 40; j++) {
      let tile = $("<div>").addClass(map[i][j]);
      mapContainer.append(tile);
    }
  }
}

function spawnPlayer() {
  let playerRow, playerCol;

  do {
    playerRow = getRandomInt(0, 23);
    playerCol = getRandomInt(0, 39);
  } while (map[playerRow][playerCol] !== "tile");

  map[playerRow][playerCol] = "tileP";
  playerPosition = { row: playerRow, col: playerCol };

  updateMap();
}

function spawnHealthPotions() {
  for (let i = 0; i < 4; i++) {
    let potionRow, potionCol;

    do {
      potionRow = getRandomInt(0, 23);
      potionCol = getRandomInt(0, 39);
    } while (map[potionRow][potionCol] !== "tile");

    
    healthPotions.push({ row: potionRow, col: potionCol });

    map[potionRow][potionCol] = "tileHP";
  }

  updateMap();
}

function spawnDamageBooster() {
  for (let i = 0; i < 2; i++) {
    let potionRow, potionCol;

    do {
      potionRow = getRandomInt(0, 23);
      potionCol = getRandomInt(0, 39);
    } while (map[potionRow][potionCol] !== "tile");

    damageBoosters.push({ row: potionRow, col: potionCol });

    map[potionRow][potionCol] = "tileSW";
  }

  updateMap();
}

function spawnEnemies() {
  for (let i = 0; i < 10; i++) {
    let enemyRow, enemyCol;

    do {
      enemyRow = getRandomInt(0, 23);
      enemyCol = getRandomInt(0, 39);
    } while (map[enemyRow][enemyCol] !== "tile");

    let health = 3;
    map[enemyRow][enemyCol] = "tileE";
    enemies.push({
      row: enemyRow,
      col: enemyCol,
      health: health,
      direction: getRandomDirection(),
    });
  }

  updateMap();
}

function moveEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];

    let newDirection = getRandomDirection();
    let attempts = 0;

    while (attempts < 4 && !canMove(enemy, newDirection)) {
      newDirection = getRandomDirection();
      attempts++;
    }

    if (attempts === 4) {
      continue;
    }

    let newEnemyRow = enemy.row;
    let newEnemyCol = enemy.col;

    switch (newDirection) {
      case "up":
        newEnemyRow = Math.max(0, enemy.row - 1);
        break;
      case "down":
        newEnemyRow = Math.min(23, enemy.row + 1);
        break;
      case "left":
        newEnemyCol = Math.max(0, enemy.col - 1);
        break;
      case "right":
        newEnemyCol = Math.min(39, enemy.col + 1);
        break;
    }

    map[enemy.row][enemy.col] = "tile";
    map[newEnemyRow][newEnemyCol] = "tileE" + enemy.health;

    if (isPlayerNearEnemy(enemy, playerPosition)) {
      attackPlayer();
    }
    enemies[i] = {
      row: newEnemyRow,
      col: newEnemyCol,
      health: enemy.health,
      direction: newDirection,
    };
  }

  updateMap();
}

function addKeyPressListener() {
  $(document).keydown(function (event) {
    let newPlayerRow = playerPosition.row;
    let newPlayerCol = playerPosition.col;

    switch (event.keyCode) {
      case 87: 
        newPlayerRow = Math.max(0, playerPosition.row - 1);
        break;
      case 83: 
        newPlayerRow = Math.min(23, playerPosition.row + 1);
        break;
      case 65: 
        newPlayerCol = Math.max(0, playerPosition.col - 1);
        break;
      case 68: 
        newPlayerCol = Math.min(39, playerPosition.col + 1);
        break;
      case 32: 
        attackEnemy();
        break;
      default:
        return;
    }

    let placeToStep = map[newPlayerRow][newPlayerCol];
    if (
      placeToStep === "tile" ||
      placeToStep === "tileHP" ||
      placeToStep === "tileSW"
    ) {
      if (map[newPlayerRow][newPlayerCol] === "tileHP") {
        playerHealth++;
      }
      if (map[newPlayerRow][newPlayerCol] === "tileSW") {
        playerDamage++;
        let inventory = $(".inventory");
        let itemSword = $("<div>").addClass("tileSW");
        inventory.append(itemSword);
      }
 
      map[playerPosition.row][playerPosition.col] = "tile";
      map[newPlayerRow][newPlayerCol] = "tileP";


      playerPosition = { row: newPlayerRow, col: newPlayerCol };

   
      updateMap();
    }
  });
}

function attackEnemy() {
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];

    if (isPlayerNearEnemy(enemy, playerPosition)) {

      enemy.health -= playerDamage;

      if (enemy.health <= 0) {

        map[enemy.row][enemy.col] = "tile";
        enemies.splice(i, 1); 
      } else {
        map[enemy.row][enemy.col] = "tileE" + enemy.health;
      }

      updateMap();
      break;
    }
  }
  if (enemies.length === 0) {
    alert("С Победой");
    location.reload();
  }
}

function attackPlayer() {
  if (playerHealth > 1) {
    playerHealth--;

    updateMap();
  } else {
    alert("GAME OVER");
    location.reload();
  }
}

function updateMap() {
  let mapContainer = $(".field");
  mapContainer.empty();

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 40; j++) {
      let tile = $("<div>").addClass(map[i][j]);
      mapContainer.append(tile);

      if (map[i][j].startsWith("tileE")) {
        let enemyHealth = parseInt(map[i][j].substring(5), 10);
        let enemyTile = $("<div>").addClass("enemy-tile");
        tile.append(enemyTile);

        let healthBarContainer = $("<div>").addClass("health-bar-container");
        let healthBar = $("<div>")
          .addClass("health-bar")
          .css("width", enemyHealth * 33.33 + "%"); 

        healthBarContainer.append(healthBar);
        enemyTile.append(healthBarContainer);
      }
      if (map[i][j].startsWith("tileP")) {
        let healthBarContainer = $("<div>").addClass("health-bar-container");
        let healthBar = $("<div>")
          .addClass("health-bar")
          .css("width", (playerHealth / 6) * 100 + "%"); 

        healthBarContainer.append(healthBar);
        tile.append(healthBarContainer);
      }
    }
  }
}

function canMove(entity, direction) {
  let newRow = entity.row;
  let newCol = entity.col;

  switch (direction) {
    case "up":
      newRow = Math.max(0, entity.row - 1);
      break;
    case "down":
      newRow = Math.min(23, entity.row + 1);
      break;
    case "left":
      newCol = Math.max(0, entity.col - 1);
      break;
    case "right":
      newCol = Math.min(39, entity.col + 1);
      break;
  }

  return map[newRow][newCol] === "tile";
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDirection() {
  let directions = ["up", "down", "left", "right"];
  return directions[getRandomInt(0, 3)];
}

function isPlayerNearEnemy(enemy, playerPosition) {
  let distance =
    Math.abs(playerPosition.row - enemy.row) +
    Math.abs(playerPosition.col - enemy.col);
  return distance === 1;
}
