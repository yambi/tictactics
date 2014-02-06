var piece;
var size = 3;// TODO: 
var board = [];// 0: neutral, 1: X, 2: O
var metaboard = [];// 0: neutral, 1: X win, 2: O win, 3: draw
var undo_board = new Array();
var redo_board = new Array();
var undo_metaboard = new Array();
var redo_metaboard = new Array();
var undo_place = new Array();
var redo_place = new Array();
var place = [];
var next = 0;
var editable = true;
var previ = -1;
var prevj = -1;
var cellsize=32;
var margin=5;

var showBoard = function(){
    if(undo_board.length > 0)document.getElementById("undo").disabled=false;
    else document.getElementById("undo").disabled=true;
    if(redo_board.length > 0)document.getElementById("redo").disabled=false;
    else document.getElementById("redo").disabled=true;

    var b = document.getElementById("board");
    while(b.firstChild){
        b.removeChild(b.firstChild);
    }
    for(var i=0;i<9;i++){
        for(var j=0;j<9;j++){
            var c;
            if(metaboard[Math.floor(i/3)][Math.floor(j/3)]==0)c=piece[board[i][j]*4].cloneNode(true);
            else c=piece[board[i][j]+3*metaboard[Math.floor(i/3)][Math.floor(j/3)]].cloneNode(true);
            c.style.top = ((i*(cellsize+margin))+(i>=3?margin:0)+(i>=6?margin:0))+"px";
            c.style.left = ((j*(cellsize+margin))+(j>=3?margin:0)+(j>=6?margin:0))+"px";
            if(isPlaceable(i,j))c.style.border = "2px solid blue";
            b.appendChild(c);
            (function(){
                var _i = i, _j = j;
                c.onclick = function(){
                    if(!editable)return;
                    if(board[_i][_j]>=1)return;
                    if(!isPlaceable(_i,_j))return;

                    if(undo_board.length==0 || !eq(undo_board[undo_board.length-1],board)){
                        undo_board.push(clone_board());
                        undo_metaboard.push(clone_metaboard());
                        undo_place.push([previ,prevj]);
                        redo_board=new Array();
                        redo_metaboard=new Array();
                        redo_place=new Array();
                    }

                    board[_i][_j]=1+next;
                    check(_i,_j);
                    metacheck();
                    previ=_i;
                    prevj=_j;
                    next=1-next;
                    showBoard();
                };
            })();
        }
    }
    if(next==0)document.getElementById("next").innerHTML="next &times;";
    if(next==1)document.getElementById("next").innerHTML="next &#x25CB;";
    //console.log(undo_board, redo_board);
    //console.log(undo_place, redo_place);
    console.log(metaboard);
}

function isPlaceable(i,j){
    if(board[i][j]>0)return false;
    if(previ<0 || prevj<0)return true;
    if(Math.floor(previ%3)==Math.floor(i/3) && Math.floor(prevj%3)==Math.floor(j/3))return true;
    for(var k=0;k<size;++k){
      for(var l=0;l<size;++l){
        if(board[Math.floor(previ%3)*3+k][Math.floor(prevj%3)*3+l]==0)return false;
      }
    }
    return true;
}

function check(i,j){
    var _i = Math.floor(i/3);
    var _j = Math.floor(j/3);
    if(metaboard[_i][_j]>0)return;

    //diagonal
    if(board[_i*size][_j*size]>0 && board[_i*size][_j*size]==board[_i*size+1][_j*size+1] && board[_i*size][_j*size]==board[_i*size+2][_j*size+2]){
      metaboard[_i][_j]=board[_i*size][_j*size];
      return;
    }
    if(board[_i*size+2][_j*size]>0 && board[_i*size+2][_j*size]==board[_i*size+1][_j*size+1] && board[_i*size+2][_j*size]==board[_i*size][_j*size+2]){
      metaboard[_i][_j]=board[_i*size+2][_j*size];
      return;
    }
    for(var k=0;k<size;k++){
      //vertical
     if(board[_i*size][_j*size+k]>0 && board[_i*size][_j*size+k]==board[_i*size+1][_j*size+k] && board[_i*size][_j*size+k]==board[_i*size+2][_j*size+k]){
        metaboard[_i][_j]=board[_i*size][_j*size+k];
        return;
      }
      //horizonal
     if(board[_i*size+k][_j*size]>0 && board[_i*size+k][_j*size]==board[_i*size+k][_j*size+1] && board[_i*size+k][_j*size]==board[_i*size+k][_j*size+2]){
        metaboard[_i][_j]=board[_i*size+k][_j*size];
        return;
      }
    }
    for(var k=0;k<size;k++){
      for(var l=0;l<size;l++){
        if(board[_i*size+k][_j*size+l]==0)return;
      }
    }
    metaboard[_i][_j]=3;
}


function metacheck(){
    var xwin = false;
    var owin = false;
    //diagonal
    if(metaboard[0][0]&1 && metaboard[1][1]&1 && metaboard[2][2]&1)xwin=true;
    if(metaboard[0][0]&2 && metaboard[1][1]&2 && metaboard[2][2]&2)owin=true;
    if(metaboard[0][2]&1 && metaboard[1][1]&1 && metaboard[2][0]&1)xwin=true;
    if(metaboard[0][2]&2 && metaboard[1][1]&2 && metaboard[2][0]&2)owin=true;

    for(var k=0;k<size;k++){
      //vertical
      if(metaboard[k][0]&1 && metaboard[k][1]&1 && metaboard[k][2]&1)xwin=true;
      if(metaboard[k][0]&2 && metaboard[k][1]&2 && metaboard[k][2]&2)owin=true;
      //horizontal
      if(metaboard[0][k]&1 && metaboard[1][k]&1 && metaboard[2][k]&1)xwin=true;
      if(metaboard[0][k]&2 && metaboard[1][k]&2 && metaboard[2][k]&2)owin=true;
    }
    var draw = true;
    for(var k=0;k<size;k++){
      for(var l=0;l<size;l++){
        if(metaboard[k][l]==0)draw=false;
      }
    }
    
    if(draw || (xwin && owin))$("#info")[0].innerHTML="draw!";
    else if(xwin)$("#info")[0].innerHTML="&times; win!";
    else if(owin)$("#info")[0].innerHTML="&#x25CB; win!";
    else $("#info")[0].innerHTML="";
    console.log(draw+":"+xwin+":"+owin);
}



function clone_board(){
    cb = [];  
    for(var i = 0; i<size*size;i++){
        cb[i] = [];
        for(var j=0;j<size*size;j++){
            cb[i][j] = board[i][j];
        }
    }
    return cb;    
}

function clone_metaboard(){
    cb = [];  
    for(var i = 0; i<size;i++){
        cb[i] = [];
        for(var j=0;j<size;j++){
            cb[i][j] = metaboard[i][j];
        }
    }
    return cb;    
}

function undo(){
    if(!editable)return;
    editable=false;

    if(undo_board.length > 0){
        redo_board.push(clone_board());
        board=undo_board.pop();
        redo_metaboard.push(clone_metaboard());
        metaboard=undo_metaboard.pop();
        redo_place.push([previ,prevj]);
        var tmp=undo_place.pop();
        previ=tmp[0];
        prevj=tmp[1];
        next=1-next;
    }
    showBoard();
    metacheck();
    editable=true;
}

function redo(){
    if(!editable)return;
    editable=false;
    if(redo_board.length > 0){
        undo_board.push(clone_board());
        board=redo_board.pop();
        undo_metaboard.push(clone_metaboard());
        metaboard=redo_metaboard.pop();
        undo_place.push([previ,prevj]);
        var tmp=redo_place.pop();
        previ=tmp[0];
        prevj=tmp[1];
        next=1-next;
    }
    showBoard();
    metacheck();
    editable=true;
}

function eq(b1,b2){
    for(var i=0;i<size*size;++i){
        for(var j=0;j<size*size;++j){
            if(b1[i][j]!=b2[i][j])return false;
        }
    }
    return true;
}

function reset(){
    next=0;
    previ = -1;
    prevj = -1;

    board = [];
    for(var i = 0; i<9;i++){
        board[i] = [];
        for(var j=0;j<9;j++){
            board[i][j] = 0;
        }
    }
    metaboard = [];
    for(var i = 0; i<3;i++){
        metaboard[i] = [];
        for(var j=0;j<3;j++){
            metaboard[i][j] = 0;
        }
    }
    showBoard();
}

$(function(){
    piece = [
        $("#cell")[0],
        $("#x")[0],
        $("#o")[0],
        $("#green")[0],
        $("#green_x")[0],
        $("#green_o")[0],
        $("#red")[0],
        $("#red_x")[0],
        $("#red_o")[0],
        $("#yellow")[0],
        $("#yellow_x")[0],
        $("#yellow_o")[0]
    ];
    reset();
    showBoard();
});
