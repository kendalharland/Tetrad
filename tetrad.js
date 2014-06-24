/*
  Quadris
  -----------------------------------------------------------------------------
  Tile names taken from: https://sites.google.com/site/polynominos/tetrominos

  TODO
  - Implement scoring
  - Implement randomized piece direction
  - Implement timer increments (different values)
  - Implement colors for different quadrominoes
  - Implement start, restart, and pause buttons
  - Implement controls for slamming a piece
  - Implement piece movement speedup
  - Get better art for pieces
  - add some MUSIC
  - figure out why 2 rows get deleted when deleting in the upper half of the board
*/


/**-- Quadris Game Settings --------------------------------------------------*/

var score = 0;
var SCORE_PER_ROW = 10;

var Quadromino;         // class for quadromino pieces
var tiles, curTile = 0; // set of quadromino tile types, id of the current tile

var QuadrisBoard = [];  // logical game board
var ColorBoard = [];    // logical game board color grid
var HEIGHT_BLOCKS = 20; // height of board in blocks
var WIDTH_BLOCKS = 25;  // width of board in blocks
var BLOCK_WIDTH = 24;   // size of block in pixels;
var BOARD_BASE_COLOR = 'black'; // background color of the quadris board
var canvas, ctx;        // visible game board

var Direction = { north: 0, east: 1, south: 2, west: 3}; // piece directions
var curDirection; // current quadris forced tile direction

var initTimeQuantum = 700, curTimeQuantum; // starting and current quantums for moment
var momentInterval; // interval from advancing to the next moment in the game
var nextLevel = 10;

var TILE_START_X = parseInt(WIDTH_BLOCKS/2);
var TILE_START_Y = parseInt(HEIGHT_BLOCKS/2);
var TILE_SHADOW_BLUR = 3;
var TILE_SHADOW_COLOR = 'black';
var TILE_SHADOW_OFFSET_X = 0;
var TILE_SHADOW_OFFSET_Y = 0;


// Utility function for representing points
function Point(x, y) {
  this.x = x; 
  this.y = y;
}


/**-- Qaudromino implementations -------------------------------------------*/


Quadromino = {

  /* _ _ _ _ 
    |_|_|_|_|
  */
  Tetril: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'cyan';
    this.rotations =[
      [[0, 1, 0, 0],
       [0, 1, 0, 0],
       [0, 1, 0, 0],
       [0, 1, 0, 0]],

      [[0, 0, 0, 0],
       [1, 1, 1, 1],
       [0, 0, 0, 0],
       [0, 0, 0, 0]],

      [[0, 0, 1, 0],
       [0, 0, 1, 0],
       [0, 0, 1, 0],
       [0, 0, 1, 0]],     

      [[0, 0, 0, 0],
       [0, 0, 0, 0],
       [1, 1, 1, 1],
       [0, 0, 0, 0]],
    ];

    this.regions = this.rotations[this.curRotation];
  },


  /*  _ _ _  
     |_|_|_|  
       |_|
  */
  Tad: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'DarkViolet';
    this.rotations =[
      [[0, 0, 0],
       [1, 1, 1],
       [0, 1, 0]],

      [[0, 1, 0],
       [1, 1, 0],
       [0, 1, 0]],

      [[0, 1, 0],
       [1, 1, 1],
       [0, 0, 0]],

      [[0, 1, 0],
       [0, 1, 1],
       [0, 1, 0]],
    ];
    this.regions = this.rotations[this.curRotation];
  },


  /* _ _
    |_|_|
    |_|_|
  */
  Basil: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'yellow';
    this.rotations =[ [[1, 1],
                      [1, 1]] ];
    this.regions = this.rotations[0];
  },


  /* _ _ 
    |_|_|
    |_|
    |_|
  */
  Jed: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'Indigo';
    this.rotations =[
      [[0, 1, 1],
       [0, 1, 0],
       [0, 1, 0]],

      [[0, 0, 0],
       [1, 1, 1],
       [0, 0, 1]],

      [[0, 0, 1],
       [0, 0, 1],
       [0, 1, 1]],

      [[1, 0, 0],
       [1, 1, 1],
       [0, 0, 0]],
    ];
    this.regions = this.rotations[this.curRotation];
  },


  /* _ _
    |_|_|
      |_|
      |_|
  */
  Led: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'LawnGreen';
    this.rotations =[
      [[1, 1, 0],
       [0, 1, 0],
       [0, 1, 0]],

      [[0, 0, 1],
       [1, 1, 1],
       [0, 0, 0]],

      [[0, 1, 0],
       [0, 1, 0],
       [0, 1, 1]],

      [[0, 0, 0],
       [1, 1, 1],
       [1, 0, 0]],
    ];
    this.regions = this.rotations[this.curRotation];
  },


  /* _ _
    |_|_|_
      |_|_|
  */
  Zaw: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'orange';
    this.rotations =[
      [[1, 1, 0],
       [0, 1, 1],
       [0, 0, 0]],

      [[0, 0, 1],
       [0, 1, 1],
       [0, 1, 0]]
    ];
    this.regions = this.rotations[this.curRotation];
  },


  /*   _ _
      |_|_|
    |_|_|
  */
  Saw: function(start) {
    this.pos = start;
    this.curRotation = 0;
    this.color = 'DeepPink';
    this.rotations =[
      [[0, 1, 1],
       [1, 1, 0],
       [0, 0, 0]],

      [[1, 0, 0],
       [1, 1, 0],
       [0, 1, 0]]
    ];
    this.regions = this.rotations[this.curRotation];
  },

  Rotate: function(tile) {
    tile.curRotation++;
    tile.regions = tile.rotations[(tile.curRotation) % tile.rotations.length];    
  },

  RotateBack: function(tile) {
    tile.curRotation--;
    tile.regions = tile.rotations[(tile.curRotation) % tile.rotations.length];    
  },

  Colliding: function(tile) {
    for (var i = 0; i < tile.regions.length; i++) {
      for (var j = 0; j < tile.regions[i].length; j++) {
        if (tile.regions[i][j]) {
          if ((tile.pos.y + i < 0 || tile.pos.y+i >= QuadrisBoard.length) 
            ||(tile.pos.x + j < 0 || tile.pos.x+j >= QuadrisBoard[0].length)
            ||QuadrisBoard[tile.pos.y+i][tile.pos.x+j])
          return true;
        }
      }
    }
    return false;
  }
};


/*--- Tile controls and movement --------------------------------------------*/


// slam helper functions
var _slam = {

  north: function (tile) {
    clearInterval(momentInterval);
    while(move_tile_up(tile, 1));
    try_land_tile(tile);
    reset_moment_interval(curTimeQuantum);
  },

  east: function(tile){
    clearInterval(momentInterval);
    while(move_tile_right(tile, 1));
    try_land_tile(tile);
    reset_moment_interval(curTimeQuantum);
  },

  south: function(tile){
    clearInterval(momentInterval);
    while(move_tile_down(tile, 1));
    try_land_tile(tile);
    reset_moment_interval(curTimeQuantum);
  },

  west: function(tile){
    clearInterval(momentInterval);
    while(move_tile_left(tile, 1));
    try_land_tile(tile);
    reset_moment_interval(curTimeQuantum);
  }
};


// slam a tile down immediately
function slam_tile(tile) {
  if (curDirection == Direction.north)
    _slam.north(tile);
  else if (curDirection == Direction.east)
    _slam.east(tile);
  else if (curDirection == Direction.south)
    _slam.south(tile);
  else if (curDirection == Direction.west)
    _slam.west(tile);
}


// move a game tile up n spaces
function move_tile_up(tile, n) {
  tile.pos.y -= n;
  if (Quadromino.Colliding(tile)) {
    tile.pos.y += n;
    return false;
  }
  return true;
}


// move a game tile down n spaces
function move_tile_down(tile, n) { 
  tile.pos.y += n;
  if (Quadromino.Colliding(tile)) {
    tile.pos.y -= n;
    return false;
  }
  return true;
}


// move a game tile left n spaces
function move_tile_left(tile, n) {
  tile.pos.x -= 1;
  if (Quadromino.Colliding(tile)) {
    tile.pos.x += 1;
    return false;
  }
  return true;
}


// move a game tile right n spaces
function move_tile_right(tile, n) {
  tile.pos.x += 1;
  if (Quadromino.Colliding(tile)) {
    tile.pos.x -= 1;
    return false;
  }
  return true;
}


/**-- Game controls ----------------------------------------------------------*/


function slam_control() {
  ctx.fillStyle = 'orange';
  slam_tile(active_tile);
  draw_board(ctx, active_tile);
}


function up_control() {
  ctx.fillStyle = 'orange';
  move_tile_up(active_tile, 1);
  draw_board(ctx, active_tile);
}


function down_control() {
  ctx.fillStyle = 'orange';
  move_tile_down(active_tile, 1);
  draw_board(ctx, active_tile);
}


function left_control() {
  ctx.fillStyle = 'orange';
  move_tile_left(active_tile, 1);
  draw_board(ctx, active_tile);
}


function right_control() {
  ctx.fillStyle = 'orange';
  move_tile_right(active_tile, 1);
  draw_board(ctx, active_tile);
}


function rotate_control() {
  Quadromino.Rotate(active_tile);
  // make sure quadromino can actually rotate
  if (Quadromino.Colliding(active_tile)) {
    if (!move_tile_right(active_tile, 1)  &&
        !move_tile_left(active_tile, 1)   &&
        !move_tile_up(active_tile, 1)     &&
        !move_tile_down(active_tile, 1))
      Quadromino.RotateBack(active_tile);
  }
  draw_board(ctx, active_tile);
  reset_moment_interval(curTimeQuantum);
};



/**-- Auto game actions -------------------------------------------------*/


var listener = new window.keypress.Listener();


function disable_controls() { listener.reset(); }


function disabled() {}


function set_random_direction() {
  var numDirs = Object.keys(Direction).length;
  var dice = Math.ceil(Math.random()*numDirs) % numDirs;
  set_direction(dice);
}


function set_direction(dice) {
  switch(dice) {
    default: set_direction_north(); break;
    case 0: set_direction_east(); break;
    case 1: set_direction_south(); break;
    case 2: set_direction_west(); break;
    case 3: set_direction_north(); break;
  }
}


function set_direction_north() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.north;
  listener.simple_combo("w", up_control);
  listener.simple_combo("a", left_control);
  listener.simple_combo("s", slam_control);
  listener.simple_combo("d", right_control);
  listener.simple_combo("space", rotate_control);
}


function set_direction_south() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.south;
  listener.simple_combo("w", slam_control);
  listener.simple_combo("a", left_control);
  listener.simple_combo("s", down_control);
  listener.simple_combo("d", right_control);
  listener.simple_combo("space", rotate_control);
}


function set_direction_west() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.west;
  listener.simple_combo("w", up_control);
  listener.simple_combo("a", left_control);
  listener.simple_combo("s", down_control);
  listener.simple_combo("d", slam_control);
  listener.simple_combo("space", rotate_control);
}


function set_direction_east() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.east;
  listener.simple_combo("w", up_control);
  listener.simple_combo("a", slam_control);
  listener.simple_combo("s", down_control);
  listener.simple_combo("d", right_control);
  listener.simple_combo("space", rotate_control);
}


// draw the Game board in its current state
function draw_board(ctx, tile) {
  ctx.shadowBlur = TILE_SHADOW_BLUR;
  ctx.shadowColor = TILE_SHADOW_COLOR;
  ctx.shadowOffsetX = TILE_SHADOW_OFFSET_X;
  ctx.shadowOffsetY = TILE_SHADOW_OFFSET_Y;

  // color entire board base color
  ctx.fillStyle = BOARD_BASE_COLOR;
  ctx.fillRect(0, 0, BLOCK_WIDTH*WIDTH_BLOCKS, BLOCK_WIDTH*HEIGHT_BLOCKS);

  // draw landed pieces
  for (var i = 0; i < HEIGHT_BLOCKS; i++)
    for (var j = 0; j < WIDTH_BLOCKS; j++)
      if (QuadrisBoard[i][j]) {
        ctx.fillStyle = ColorBoard[i][j];
        ctx.fillRect( BLOCK_WIDTH*j,  BLOCK_WIDTH*i,
                      BLOCK_WIDTH  ,  BLOCK_WIDTH);
      }
      
  // draw the active tile
  ctx.fillStyle = tile.color;
  for (var i = 0; i < tile.regions.length; i++)
     for (var j = 0; j < tile.regions[i].length; j++)
       if (tile.regions[i][j]) {
        ctx.fillRect( BLOCK_WIDTH*(tile.pos.x + j), 
                      BLOCK_WIDTH*(tile.pos.y + i),
                      BLOCK_WIDTH, 
                      BLOCK_WIDTH);
      }
}


// Change the active tile a random tile
function get_next_tile(tile) {
  var which = Math.floor(Math.random()*tiles.length);
  active_tile = new tiles[which](new Point(TILE_START_X, TILE_START_Y));
  if(Quadromino.Colliding(active_tile)) {
    end_game();
    return false;
  }
  return true;
}


// place a tile onto the quadris board
function land_tile(tile) {
  for (var i = 0; i < tile.regions.length; i++) {
    for (var j = 0; j < tile.regions[i].length; j++) {
      if (tile.regions[i][j]) {
        QuadrisBoard[tile.pos.y+i][tile.pos.x+j] = 1;
        ColorBoard[tile.pos.y+i][tile.pos.x+j] = tile.color;
      }
    }
  }
  check_for_full_rows();
}


// check to see if any rows have been filled
function check_for_full_rows() {
  // check to see if any rows or columns in the matrix consist of all ones.
  var fullRows = [];
  for (var i = 0; i < HEIGHT_BLOCKS; i++) {
    if (QuadrisBoard[i].indexOf(0) < 0)
      fullRows.push(i);
  }
  delete_rows(fullRows);
  if (fullRows.length)
    check_for_full_rows();
}
  

// delete rows from the QuadrisBoard
function delete_rows(rows) {
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] < HEIGHT_BLOCKS/2) { // if top half of the board
      for (var j = rows[i]; j < HEIGHT_BLOCKS-1; j++) {
        QuadrisBoard[j] = QuadrisBoard[j+1].slice(0);
        ColorBoard[j] = ColorBoard[j+1].slice(0);
      }
      for (var j = 0; j < WIDTH_BLOCKS; j++) {
        QuadrisBoard[HEIGHT_BLOCKS-1][j] = 0;
        ColorBoard[j] = BOARD_BASE_COLOR;
      }
    } else {
      for (var j = rows[i]; j > 0; j--) {
        for (var k = 0; k < WIDTH_BLOCKS; k++) {
          QuadrisBoard[j] = QuadrisBoard[j-1].slice(0);
          ColorBoard[j] = ColorBoard[j-1].slice(0);
        }
      }
      // fill with zeroes
      for (var j = 0; j < WIDTH_BLOCKS; j++) {
        QuadrisBoard[0][j] = 0;
        ColorBoard[0][j] = BOARD_BASE_COLOR;
      }
    }
  }
  increase_score(rows.length);
}


function increase_score(numRows) {
  score += numRows * SCORE_PER_ROW;
  if (score && score >= nextLevel) {
    reset_moment_interval(curTimeQuantum*0.75);
    nextLevel += score + SCORE_PER_ROW;
  }
}




// end the curren game
function end_game() {
  clearInterval(momentInterval);
  disable_controls();
  console.log("YOU LOSE");
  alert("Game Over");
}


// attempt to place a tile (or rather, check if we should place a tile)
function try_land_tile(tile) {
  if (curDirection == Direction.north && !move_tile_up(tile, 1)) {
    land_tile(tile);
    return true;
  }
  else if (curDirection == Direction.south && !move_tile_down(tile, 1)) {
    land_tile(tile);
    return true;
  }
  else if (curDirection == Direction.west && !move_tile_left(tile, 1)) {
    land_tile(tile);
    return true;
  }
  else if (curDirection == Direction.east && !move_tile_right(tile, 1)) {
    land_tile(tile);
    return true;
  }
  return false;
}


// display the user's current score
function update_score_display() {
  document.querySelector("span[name='score']").innerHTML = score;
}


// move to the next moment in time
function next_moment() {
  // check if the player's tile has landed
  if (try_land_tile(active_tile)) {
    // if we can retrieve the next tile the game continues
    if (get_next_tile(active_tile)) { 
      //update the score if any rows were cleared
      update_score_display();
      // tile has landed, swap directions and controls
      set_random_direction();
    }
    // don't start the next moment, game has ended
    else return; 
  }

  draw_board(ctx, active_tile);
  reset_moment_interval(curTimeQuantum);
}


// reset the time state for the current game
function reset_moment_interval(quantum) {
  curTimeQuantum = quantum;
  clearInterval(momentInterval);
  momentInterval = setInterval(function(){ next_moment(); }, quantum);
}


/**-- Starting a new game ----------------------------------------------------*/


// set up quadris board and color board
for (var i = 0; i < HEIGHT_BLOCKS; i++) {
  QuadrisBoard.push([]);
  ColorBoard.push([]);
  for (var j = 0; j < WIDTH_BLOCKS; j++) {
    QuadrisBoard[i].push(0);
    ColorBoard[i].push(BOARD_BASE_COLOR);
  }
}

// set of tile types
tiles = [
  Quadromino.Tetril,
  Quadromino.Tad,
  Quadromino.Basil,
  Quadromino.Jed,
  Quadromino.Led,
  Quadromino.Zaw,
  Quadromino.Saw,
];

// setup canvas
canvas = document.querySelector("canvas");
ctx = canvas.getContext('2d');
canvas.setAttribute("width", BLOCK_WIDTH*WIDTH_BLOCKS);
canvas.setAttribute("height", BLOCK_WIDTH*HEIGHT_BLOCKS);

// init active tile
active_tile = new tiles[curTile](new Point(TILE_START_X, TILE_START_Y));
// init direction
set_direction_south();
// init game view
draw_board(ctx, active_tile);
// init score display
update_score_display();
// start game
reset_moment_interval(initTimeQuantum);