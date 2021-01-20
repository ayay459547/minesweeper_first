function Mine(tr,td,mineNum){
    this.tr = tr; //行數
    this.td = td; //列數
    this.mineNum = mineNum; //地雷數 

    this.squares = []; //儲存所有方塊信息，他是一個二為數組，按行與列的順序排放。存取都使用行列的形式
    this.tds = [];     //儲存所有的單元格的DOM(二為數組)
    this.surplusMine = mineNum; //剩餘數量
    this.allRight = false; //右鍵點擊小紅標是否為是地雷 判斷玩家是否成功

    this.parent = document.querySelector('.gameBox');
}

//生成N個不重複的數字
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td); //生成空數組 數量為格子總數
    for(var i=0;i<square.length;i++){
        square[i] = i; 
    }
    square.sort(function(){return 0.5-Math.random()});
    // console.log(square);
    return square.slice(0,this.mineNum);
}

Mine.prototype.init = function(){
    // console.log(this.randomNum());
    var rn = this.randomNum(); //地雷的位置
    var n = 0; //用來找到對應的索引
    for(var i=0;i<this.tr;i++){
        this.squares[i] = [];
        for(var j=0;j<this.td;j++){
            // this.squares[i][j] = 0;

            //取一個方塊在數組裡的數據要使用行與列的形式去取。
            //找方塊周圍的方塊的時候要用座標的形式去取。
            //行與列的形式與座標的形式x,y
            if(rn.indexOf(++n)!=-1){
                //如果這個條件成立,說明現在循環到這個索引在雷的數組裡找到了,那就表示這個索引對應的是地雷
                this.squares[i][j] = {type:'mine',x:j,y:i};
            }else{
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};
            }
        }
        
    }

    this.parent.oncontextmenu=function(){
        return false;
    }
    // console.log(this.squares);
    this.updateNum();
    this.createDom();


    //剩下棋子
    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
}

//創建表格
Mine.prototype.createDom = function(){
    var This = this;
    var table = document.createElement('table');
    for(var i=0;i<this.tr;i++){
        var domTr = document.createElement('tr');//行
        this.tds[i] = [];

        for(var j=0;j<this.td;j++){
            var domTd = document.createElement('td');//列
            // domTd.innerHTML = 0;

            domTd.pos = [i,j]; //把格子對應的行列存到格子身上,為了下面通過這個值去數組裡取到對應的數據
            domTd.onmousedown = function(){
                This.play(event,this); //This指的是實例對象,this指的是點擊的那個td
            }

            this.tds[i][j] = domTd; //把所有創建的td添加到數組中

            // if(this.squares[i][j].type == 'mine'){
            //     domTd.className = 'mine';
            // }
            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = "";
    this.parent.appendChild(table);
};

//找格子周圍的八格
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = []; //把找到的格子的座標返回出去(二維數組)

    for(var i=x-1;i<=x+1;i++){
        for(var j=y-1;j<=y+1;j++){
            if(
                i<0 ||  //格子 左邊 超出範圍
                j<0 ||  //格子 上面 超出範圍
                i>this.td-1|| //格子 右邊 超出範圍
                j>this.tr-1|| //格子 下面 超出範圍
                (i == x && j == y)||  // 自己的位置
                this.squares[j][i].type == 'mine' //周圍的格子是地雷
            ){
                continue;
            }

            result.push([j,i]); //要以行與列的形式返回，因為到時候需要用他去取數組裡的數據
        }
    }

    return result;
}

//更新所有的數字
Mine.prototype.updateNum = function(){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            //要更新 0 周圍的數字
            if(this.squares[i][j].type == 'number'){
                continue;
            }
            var num = this.getAround(this.squares[i][j]); //獲取地雷周圍的數字
            
            for(var k=0;k<num.length;k++){
                
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
    // console.log(this.squares);
}

//
Mine.prototype.play = function(ev,obj){
    var This = this;

    //點擊左鍵
    if(ev.which == 1 && obj.className!='flag'){
        // console.log(ev.which);
        // console.log(obj);

        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        // console.log(curSquare);

        var cl = ['zero','one','two','three','four','five','six','seven','eight'];

        if(curSquare.type == 'number'){
            //點到數字
            // console.log("number");
            obj.innerHTML=curSquare.value;
            obj.className=cl[curSquare.value];
            // console.log(curSquare.value);

            if(curSquare.value==0){
                obj.innerHTML="";
            }

            function getAllZero(square){
                var around = This.getAround(square); //找到周圍格子
                for(var i=0;i<around.length;i++){
                    var x = around[i][0];
                    var y = around[i][1];

                    This.tds[x][y].className = cl[This.squares[x][y].value];

                    if(This.squares[x][y].value == 0){
                        if(!This.tds[x][y].check){
                            This.tds[x][y].check = true;
                            getAllZero(This.squares[x][y]);
                        }
                    }else{
                        This.tds[x][y].innerHTML= This.squares[x][y].value;
                    }
                }

            }
            getAllZero(curSquare);

        }else{
            //點到地雷
            // console.log("mine");
            this.gameOver(obj);
        }
    }
 
    //點擊右鍵
    if(ev.which==3){
        if(obj.className && obj.className != 'flag'){
            return;
        }
        obj.className = (obj.className=='flag')?'':'flag';

        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight = true;
        }else{
            this.allRight = false;
        }

        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = --this.surplusMine;
            // console.log("+1");
        }else{
            this.mineNumDom.innerHTML = ++this.surplusMine;
            // console.log("-1");
        }

        if(this.surplusMine == 0){
            if(this.allRight == true){
                alert("恭喜你,遊戲通過");
            }else{
                alert("遊戲失敗");
                this.gameOver();
            }
        }
        
    }
}
 //遊戲失敗
 Mine.prototype.gameOver = function(clickTd){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }

            this.tds[i][j].onmousedown = null;
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor = "red";
    }
 }

// var mine = new Mine(28,28,99);
// mine.init();

// console.log(mine.getAround(mine.squares[0][0]));

//buttton
var btns = document.querySelectorAll('.level button');
var mine = null;
var ln = 0; //選中狀態
var arr = [[9,9,10],[16,16,40],[28,28,99]];

for(let i=0;i<btns.length-1;i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        this.className = 'active';
        
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick();
btns[3].onclick = function(){
    mine.init();
}


