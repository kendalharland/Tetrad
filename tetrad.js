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
*/


/*--- Board functions -------*/

  
var Quadromino;     // class for quadromino pieces
var tiles, curTile; // set of quadromino tile types, id of the current tile

var QuadrisBoard = [];  // logical game board
var HEIGHT_BLOCKS = 30; // height of board in blocks
var WIDTH_BLOCKS = 50;  // width of board in blocks
var BLOCK_WIDTH = 15;   // size of block in pixels;
var canvas, ctx;        // visible game board

var Direction = { north: 0, east: 1, south: 2, west: 3}; // piece directions
var curDirection; // current quadris forced tile direction


// struct like class for representing points
function Point(x, y) {
  this.x = x; 
  this.y = y;
}


/*-- Qaudris tile implementations --------------------------------------------*/

Quadromino = {

  /* _ _ _ _ 
    |_|_|_|_|
  */
  Tetril: function(start) {
    this.pos = start;
    this.curRotation = 0;
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


var listener = new window.keypress.Listener();

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
};


listener.simple_combo("tab", function() {
  get_next_tile(active_tile);
  draw_board(ctx, active_tile);
});

/**-- Auto game actions -------------------------------------------------*/

function disabled() {}

function set_direction_north() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.north;
  listener.simple_combo("w", up_control);
  listener.simple_combo("a", left_control);
  listener.simple_combo("s", disabled);
  listener.simple_combo("d", right_control);
  listener.simple_combo("space", rotate_control);
}


function set_direction_south() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.south;
  listener.simple_combo("w", disabled);
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
  listener.simple_combo("d", disabled);
  listener.simple_combo("space", rotate_control);
}


function set_direction_east() {
  listener.reset();//listener.unregister_many(combos);
  curDirection = Direction.east;
  listener.simple_combo("w", up_control);
  listener.simple_combo("a", disabled);
  listener.simple_combo("s", down_control);
  listener.simple_combo("d", right_control);
  listener.simple_combo("space", rotate_control);
}


function draw_board(ctx, tile) {
  // color entire board white
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, BLOCK_WIDTH*WIDTH_BLOCKS, BLOCK_WIDTH*HEIGHT_BLOCKS);
  // draw landed pieces
  ctx.fillStyle = "purple";
  for (var i = 0; i < QuadrisBoard.length; i++) {
    for (var j = 0; j < QuadrisBoard[i].length; j++) {
      if (QuadrisBoard[i][j]) {
        ctx.fillRect( BLOCK_WIDTH*j,
                      BLOCK_WIDTH*i,
                      BLOCK_WIDTH,
                      BLOCK_WIDTH);
      }
    }
  }
  // draw the active tile
  ctx.fillStyle = 'red';
  for (var i = 0; i < tile.regions.length; i++) {
     for (var j = 0; j < tile.regions[i].length; j++) {
       if (tile.regions[i][j]) {
        ctx.fillRect( BLOCK_WIDTH*(tile.pos.x + j), 
                      BLOCK_WIDTH*(tile.pos.y + i),
                      BLOCK_WIDTH, 
                      BLOCK_WIDTH);
      }
    }
  }
}


// Change the active tile a random tile
function get_next_tile(tile) {
  var which = Math.floor(Math.random()*tiles.length);
  active_tile = new tiles[which](new Point(10, 10));
}


// place a tile onto the quadris board
function land_tile(tile) {
  for (var i = 0; i < tile.regions.length; i++) {
    for (var j = 0; j < tile.regions[i].length; j++) {
      if (tile.regions[i][j]) {
        QuadrisBoard[tile.pos.y+i][tile.pos.x+j] = 1;
      }
    }
  }
  // check to see if any rows or columns in the matrix consist of all ones.
  var oneCount_row, oneCount_col;
  var fullRows = [], fullCols = [];
  for (var i = 0; i < QuadrisBoard.length; i++) {
    if (QuadrisBoard[i].indexOf(0) < 0)
      fullRows.push(i);
  }
  // check for cols
  var col;
  for (var i = 0; i < QuadrisBoard[i].length; i++)
    col = [];
    for (var j = 0; j < QuadrisBoard.length; ++) {
      col.push(QuadrisBoard[j][i]);
    }
    if (col.indexOf(0) < 0);
      fullCols.push(i);
  }

  delete_rows(fullRows);
  delete_cols(fullCols);
}

// delete rows from the QuadrisBoard
function delete_rows(rows){}
function delete_cols(cols){}
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


// move to the next moment in time
function next_moment() {
  if (try_land_tile(active_tile)) {
    get_next_tile(active_tile);
    // tile has landed, swap directions and controls
    if (curDirection == Direction.north) set_direction_east();
    else if (curDirection == Direction.east) set_direction_south();
    else if (curDirection == Direction.south) set_direction_west();
    else if (curDirection == Direction.west) set_direction_north();
  }

  draw_board(ctx, active_tile);
}


/*-- Starting a new game ---*/

// set up quadris board
for (var i = 0; i < HEIGHT_BLOCKS; i++) {
  QuadrisBoard.push([]);
  for (var j = 0; j < WIDTH_BLOCKS; j++)
    QuadrisBoard[i].push(0);
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

curTile = 0;
active_tile = new tiles[curTile](new Point(25, 7));

set_direction_south();
draw_board(ctx, active_tile);
setInterval(function(){ next_moment(); }, 1000);
