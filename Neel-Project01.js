const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

var rows = 30;
var col = 30;
var SQ = squareSize = 20;
var empty = "#000000";

function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "#000000";   //"#ABCDEF"
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

var board = [];
for( r = 0; r <rows; r++){
    board[r] = [];
    for(c = 0; c < col; c++){
        board[r][c] = empty;
    }
}

function drawBoard(){
    for( r = 0; r <rows; r++){
        for(c = 0; c < col; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

const PIECES = [
    [Z,"#ff2424"],
    [S,"#ccff00"],
    [T,"#00ff00"],
    [O,"#0000db"],
    [L,"#ff24ff"],
    [I,"#00ffff"],
    [J,"#daa520"]
];

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length)
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

function Piece(shapes,color){
    this.shapes = shapes;
    this.color = color;
    this.shapesN = 0;
    this.activeShapes = this.shapes[this.shapesN];
    this.x = 3;
    this.y = -2;
}

Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeShapes.length; r++){
        for(c = 0; c < this.activeShapes.length; c++){
            if( this.activeShapes[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

Piece.prototype.draw = function(){
    this.fill(this.color);
}

Piece.prototype.unDraw = function(){
    this.fill(empty);
}

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeShapes)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        this.lock();
        p = randomPiece();
    }

}

Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeShapes)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeShapes)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function(){
    let nextPattern = this.shapes[(this.shapesN + 1)%this.shapes.length];
    let bump = 0;

    if(this.collision(0,0,nextPattern)){
        if(this.x > col/2){
            // it's the right wall
            bump = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            bump = 1; // we need to move the piece to the right
        }
    }

    if(!this.collision(bump,0,nextPattern)){
        this.unDraw();
        this.x += bump;
        this.shapesN = (this.shapesN + 1)%this.shapes.length; // (0+1)%4 => 1
        this.activeShapes = this.shapes[this.shapesN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeShapes.length; r++){
        for(c = 0; c < this.activeShapes.length; c++){
            // we skip the empty squares
            if( !this.activeShapes[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                // alert("Game Over" + " - " + "You scored " + score + ".");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < rows; r++){
        let isRowFull = true;
        for( c = 0; c < col; c++){
            isRowFull = isRowFull && (board[r][c] != empty);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < col; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < col; c++){
                board[0][c] = empty;
            }
            // increment the score
            score += 1;
        }
    }
    // update the board
    drawBoard();

    // update the score
    scoreElement.innerHTML = score;

}

// collision function

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if(newX < 0 || newX >= col || newY >= rows){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece alrady in place
            if( board[newY][newX] != empty){
                return true;
            }
        }
    }
    return false;
}

// CONTROL the piece

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

// drop speed

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 200){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}
drop();