const m = Math;
const pi = m.PI;
const halfPi = pi/2;
const quarterPi = pi/4;
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d"); // dynamic
const canvas2 = document.getElementById("c2");
const ctx2 = canvas2.getContext("2d"); // static
const canvas3 = document.getElementById("c3");
const ctx3 = canvas3.getContext("2d"); // halfstatic
const canvas4 = document.getElementById("c4");
const ctx4 = canvas4.getContext("2d"); // dynamic

//colors
canvas2.style.backgroundColor = "#000"; //around maze fill
const shadowCol = "#000";
let floor = new Image();
floor.src = "floor4.png";
let floorPat; 
const w = canvas.width = canvas2.width = canvas3.width = canvas4.width = window.innerWidth;
const winHalfH = window.innerHeight/2;
const h = canvas.height = canvas2.height = canvas3.height= canvas4.height = window.innerHeight;
const itab = 100; // initial tab

let corns,msgPos,trans,PAUSE,eps,tab,halfTab,rootTab,N,intrnlns,ws,vision,sqVision,cannonR,cannonsChanged,segments,wireStack,visibles,cannonStep,jam,fix,go,width,height,eye1,eye2,temp,cannons,botStep,radar,r_ctx,grdVec,grd2,redSquare,sq_ctx,blackSquare,bsq_ctx,player,maze,row,sets,cursor,dir,KEY,lw_w,pad1,pad2,pad3,pad4,pad5,pad6,pad7,pad8,bug,wireLength,blinkRad,blinkStep,lastdT,wireChanged,dieStep;
let bugMsg = defMsg = initMsg = false;
function cannon(){
    this.active = false;
    this.activate = function(i,j){
        if(this.active) 
            return false;
        this.active = true;
        this.j = j; this.i = i;
        this.x = jx(j); this.y = jx(i);
        this.arc = 0;
        return true;
    };
    this.deactivate = function(){
        this.active = false;
    };
    this.HIT = null;
    this.hit = function(i){
        this.HIT = null;
        let target = m.atan2(bots[i].y-this.y,bots[i].x-this.x);
        if(bots[i].i===this.i && bots[i].j===this.j){
            this.HIT = i;
            return;
        }
        if(inRange(target,mod360(this.arc+quarterPi),quarterPi)){
            let intersects = [];
            let ray = new dot(bots[i].x-this.x, bots[i].y-this.y);
            for (let seg of segments){
                let dot = newSegRay(seg,ray,this);
                if(dot) intersects.push({dot:dot,seg:seg});
            }
            let botDist = sqdist(bots[i],this);
            if(intersects.length){
               intersects.sort((a,b)=>sqdist(a.dot,this)-sqdist(b.dot,this));
                if(sqdist(intersects[0].dot,this) > botDist){
                    this.HIT = i;
                }
            }
            else{
                this.HIT = i;
            }
        }
    };
}

function cannonsNewStep(diff){
    cannonStep = diff/500;
}
function spawnBots(n){
    let f = Vfield(bug);
    let i = player.i, j = player.j;
    wireStack.push({i:i,j:j});
    while(f[i][j].dir!=0){
        switch(f[i][j].dir){
            case 1:
                j--;
                break;
            case 2:
                i--;
                break;
            case 3:
                j++;
                break;
            case 4:
                i++;
                break;
        }
        wireStack.push({i:i,j:j});
    }
    let spawn = {}, min;
    for(let i=0; i<n; i++){
        while(1){// DANGER
            spawn.i = ~~(m.random()*height);
            spawn.j = ~~(m.random()*width);
            let b = new bot(spawn.i, spawn.j);
            min = bugField(b);
            if(min.dist > 2){
                bots.push(b);
                break;
            }
        }
    }
    wireStack = [];
}
function bot(i,j){// default dir & step
    this.i = i;
    this.j = j;
    this.x = jx(this.j);
    this.y = jx(this.i);
    this.dir = 0;
    this.dying = false;
    this.jam=false;
    this.spawn = {i:this.i,j:this.j};
    this.respawn = function(){
        let sp={}, min;
        while(1){// DANGER
            sp.i = ~~(m.random()*height);
            sp.j = ~~(m.random()*width);
            this.i = sp.i; this.j=sp.j;
            min = bugField(this);
            if(min.dist > 2){
                break;
            }
        }
        
       /* this.i = this.spawn.i;
        this.j = this.spawn.j;*/
        this.x = jx(this.j);
        this.y = jx(this.i);
        this.dir = 0;
        this.dying = false;
        this.jam=false;
    }
}

function botsNewStep(diff){
    botStep = round((diff/8)*(rootTab/10));
}

function tile(dist,dir){ // vector field units
    this.dist = dist;
    this.dir = dir;
}
function cell(lower, right, set){ // cell structure
    this.l = lower;  // right and lower walls
    this.r = right; // boolean parameters standing for 
    this.s = set; // number of set cell belongs to
}


function dot(x=0,y=0){
    this.x = x;
    this.y = y;
    this.eq = function(o){
        return epsEq(this.x,o.x) && epsEq(this.y,o.y);
    };
    this.rotate = function(ang){
        let x = this.x, y = this.y;
        let newX = m.cos(ang)*x-m.sin(ang)*y;
        let newY = m.sin(ang)*x+m.cos(ang)*y;
        return new dot(newX,newY);
    };
}
function segment(a,b){
    this.a = a;
    this.b = b;
    this.eq = function(seg){
        return this.a.eq(seg.a) && this.b.eq(seg.b);
    };
    this.vertical = function(){
        return epsEq(this.a.x, this.b.x); 
    };
    this.horizontal = function(){
        return epsEq(this.a.y, this.b.y);
    };
    this.concat = function(seg){
        this.b = seg.b;
    };
    this.prolongs = function(s){
        if(epsEq(s.b.y, this.a.y) && epsEq(s.b.x, this.a.x)){
            if(epsEq(s.a.x, s.b.x))
                if(epsEq(this.a.x, this.b.x))
                        return true;
            if(epsEq(s.a.y, s.b.y))
                if(epsEq(this.a.y, this.b.y))
                        return true;    
        }
        return false;
    };
}
function round(x){
    return (x+.5)|0;
}
function inRange(ang1,ang2,range){
    return mod360(mod360(ang1)-mod360(ang2)) < range || mod360(mod360(ang2)-mod360(ang1)) < range;
}

function epsEq(a,b){
    return m.abs(a-b) < eps;
}
function distToSeg(source, seg){
    if(seg.vertical()){
        if(between(seg.a.y,source.y,seg.b.y)){
            return m.abs(source.x-seg.a.x);
        }
    }
    else{
        if(between(seg.a.x,source.x,seg.b.x))
            return m.abs(source.y-seg.a.y);
    }
    let sq = m.min(sqdist(source,seg.a), sqdist(source,seg.b));
    return m.sqrt(sq);
}
function notConsistsIn(arr,seg){ // works faster than array.some()
    for(let i of arr){
        if(i.a===seg.a&&i.b===seg.b) return false;
    }
    return true;
}
function getUniqueDots(segments){
    let dots = [];
    for(let i=0;i<segments.length;i++){
        if(!dots.some(o=>o.eq(segments[i].a)))dots.push(segments[i].a);
        if(!dots.some(o=>o.eq(segments[i].b)))dots.push(segments[i].b);
    }
    return dots;
}
function getVisibles(segments,source,lim=true){
    visibles = [];
    let dots = getUniqueDots(segments);
    dots = dots.filter(o=>sqdist(source,o)<=sqVision);
    let rays = [];
    for(let o of dots){
        let ray = new dot(o.x-source.x, o.y-source.y);
        let rayAng = m.atan2(ray.y,ray.x);
        if(lim && inRange(rayAng,dir.angle,quarterPi)){
            //rays.push(ray);
            rays.push(ray.rotate(0.01));
            rays.push(ray.rotate(-0.01));
        }
        if(!lim){
            rays.push(ray.rotate(0.01));
            rays.push(ray.rotate(-0.01));
        }
    }
    let aux = new dot(dir.x,dir.y);
    rays.push(aux.rotate(quarterPi));
    rays.push(aux.rotate(-quarterPi));
    let intersects = [];
    for(let ray of rays){ 
        intersects = [];
        for(let seg of segments){
            let doT = newSegRay(seg,ray,source);
            if(doT && sqdist(source,doT)<=sqVision){ 
                intersects.push({dot:doT,seg:seg});
            }
        }
        if(intersects.length){
            intersects.sort((a,b)=>sqdist(a.dot,source)-sqdist(b.dot,source));
            if(notConsistsIn(visibles,intersects[0].seg)){
                visibles.push(intersects[0].seg);
            }
        }
    }
}
function between(a,x,b){
    if(x>=a&&x<=b || x>=b&&x<=a)return true;
    return false;
}
function newSegRay(seg,ray,s){
    if(seg.vertical()){
        let t = (seg.a.x-s.x)/ray.x;
        if(t > 0){
            let y = s.y+ray.y*t;
            if(between(seg.a.y,y,seg.b.y)){
                return {x:seg.a.x, y:y};
            }
        }
    }
    else{
        let t = (seg.a.y-s.y)/ray.y;
        if(t > 0){
            let x = s.x+ray.x*t;
            if(between(seg.a.x,x,seg.b.x)){
                return {x:x, y:seg.a.y};
            }
        }
    }
    return null;
}
function mod360(x){
    if(x<0) return x+=pi*2;
    if(x>=pi*2)x%=pi*2;
    return x;
}

function sqdist(a,b){
    return m.pow(a.x-b.x, 2) + m.pow(a.y-b.y, 2);
}
function sqmod(a){
    return a.x*a.x + a.y*a.y;
}
function shadow(a,b,source=player,context=ctx){
    let tmp = new dot(a.x-b.x, a.y-b.y);
    let tmpLen = m.sqrt(sqmod(tmp));
    tmp.x/=tmpLen;
    tmp.y/=tmpLen;
    let A = new dot(a.x+tmp.x,a.y+tmp.y),
    B = new dot(b.x-tmp.x,b.y-tmp.y);

    let l1=m.sqrt(sqdist(A,source));
    let l2=m.sqrt(sqdist(B,source));
    let newL1 = m.abs(l1-vision);
    let newL2 = m.abs(l2-vision);

    let v1 = {x:(A.x-source.x)*(newL1/l1),y:(A.y-source.y)*(newL1/l1)};
    let v2 = {x:(B.x-source.x)*(newL2/l2),y:(B.y-source.y)*(newL2/l2)};

    let vx=0,vy=0;
    if(epsEq(A.x,B.x)){
        vx = m.sign(v1.x)*vision;
    }
    else
        vy = m.sign(v1.y)*vision;

    // context.fillStyle = col;
    // context.strokeStyle = col;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(A.x,A.y);
    context.lineTo(A.x+v1.x,A.y+v1.y);

    context.lineTo(A.x+v1.x+vx,A.y+v1.y+vy);
    context.lineTo(B.x+v2.x+vx,B.y+v2.y+vy);

    context.lineTo(B.x+v2.x,B.y+v2.y);
    context.lineTo(B.x,B.y);
    context.lineTo(A.x,A.y);
    //context.stroke();
    context.fill();
    context.closePath();
}

function merge(set1,set2,row){
    for(let s of sets[set1]){
        row[s].s = set2;
        sets[set2].push(s);
    }
    sets[set1] = []; //delete set1
}
function jx(j){
    return j*tab+itab+tab/2;
}
function drawMsg(msg){
    let cntnr = document.getElementById('msg');
    let c_w = cntnr.style.width = window.innerWidth/5;
    let c_h = cntnr.style.height = window.innerHeight/5;
    corns = [{x:jx(0),y:jx(0)}, 
    {x:jx(width-1)-c_w,y:jx(0)},
    {x:jx(width-1)-c_w,y:jx(height-1)-c_h},
    {x:jx(0),y:jx(height-1)-c_h} ];
    
    let max = sqdist(player,corns[0]);
    let far = corns[0];
    for(let c of corns){
        let tmp = sqdist(player,c);
        if(tmp > max){
            max = tmp;
            far = c;
        }
    }
    cntnr.style.left = far.x + 'px';
    cntnr.style.top = far.y + 'px';
    cntnr.style.color = '#1dfc81';
    cntnr.style.font = '20px monospace';
    cntnr.style.textShadow = '1px 1px 20px #fff'


    cntnr.innerHTML = msg;
    return far;
    
}

//generates vector field (dynamic matrix for bots' moves)
function Vfield(source){
    let field = [];
    for(let i=0;i<height;i++)
        field.push(new Array());
    let i = parseInt(source.i);
    let j = parseInt(source.j);
    let stack=["last"]; // stop item
    field[i][j]= new tile(0,0);
    
    do{
        if(maze[i][j].r!=1 && (!field[i][j+1] || j+1<width&&field[i][j+1] && field[i][j+1].dist > field[i][j].dist+1)){
            field[i][j+1] = new tile(field[i][j].dist+1, 1);
            stack.push({a:i,b:j});
            j=j+1;
        }
        else if(maze[i][j].l!=1 && (!field[i+1][j] || i+1<height&&field[i+1][j] && field[i+1][j].dist > field[i][j].dist+1)){
            field[i+1][j] = new tile(field[i][j].dist+1, 2);
            stack.push({a:i,b:j});
            i=i+1;
        }
        else if(j>0&&maze[i][j-1].r!=1 && (!field[i][j-1] || j>0&&field[i][j-1] && field[i][j-1].dist > field[i][j].dist+1)){
            field[i][j-1] = new tile(field[i][j].dist+1, 3);
            stack.push({a:i,b:j});
            j=j-1;
        }
        else if(i>0&&maze[i-1][j].l!=1 && (!field[i-1][j] || i>0&&field[i-1][j] && field[i-1][j].dist > field[i][j].dist+1)){
            field[i-1][j]=new tile(field[i][j].dist+1, 4);
            stack.push({a:i,b:j});
            i=i-1;
        }
        else if(stack.length){
            temp = stack.pop();
            i=temp.a; j=temp.b;
        }
    }while(stack.length > 0);
    return field;
}
function drawElectro(source,target){
    let vec = new dot(target.x-source.x,target.y-source.y);
    let len = m.sqrt(sqmod(vec));
    vec.x/=len; 
    vec.y/=len;
    let vec2 = vec.rotate(halfPi);
    ctx4.strokeStyle = 'white';

    ctx4.beginPath();
    ctx4.lineWidth = 1;
    ctx4.moveTo(source.x,source.y);
    let parts = len/15;
    for(let i=1;i<parts;i++){
        let r = m.random()*20-10;
        ctx4.lineTo(source.x+vec.x*(i/parts)*len+vec2.x*r,source.y+vec.y*(i/parts)*len+vec2.y*r);
    }
    ctx4.lineTo(target.x,target.y);
    ctx4.stroke();
    ctx4.closePath();
    ctx4.beginPath();
    ctx4.lineWidth = 2;
    ctx4.moveTo(source.x,source.y);
    for(let i=1;i<parts;i++){
        let r = m.random()*10-5;
        ctx4.lineTo(source.x+vec.x*(i/parts)*len+vec2.x*r,source.y+vec.y*(i/parts)*len+vec2.y*r);
    }
    ctx4.lineTo(target.x,target.y);
    ctx4.stroke();
    ctx4.closePath();
}
function countWire(){
    let len = wireLength-wireStack.length+1;
    if(len==0){
        if(player.j==bug.j && player.i==bug.i){
            fixTip = {x: jx(0), y: 40+redSquare.width/2};
            tipWire = 0;
            fix = true;
        }
        else {
            msgPos = drawMsg('> you ran short of cable. <br>> find another way. <br>>');
        }
        let lst = wireStack[wireStack.length-2];
        if(lst.j < player.j)
            player.stop = 1;
        else if(lst.i < player.i)
            player.stop = 2;
        else if(lst.j > player.j)
            player.stop = 3;
        else if(lst.i > player.i)
            player.stop = 4;
    }
    else player.stop = false;
    ctx3.shadowColor = 'red';
    ctx3.shadowBlur = 14;
    ctx3.beginPath();
    ctx3.clearRect(420,0,70,50);
    ctx3.font = 'bold 20px monospace';
    ctx3.fillStyle = '#bc0010';
    ctx3.fillText(len+'',440,20);
    ctx3.closePath();
    ctx3.shadowBlur = 0;
}
function countCannons(){
    ctx3.clearRect(700,0,100,tab);
    let j = 0;
    for(let i in cannons)
        if(!cannons[i].active)
            ctx3.drawImage(redSquare,round(700+(j++)*33), 6, 22, 22);
    
    cannonsChanged = false;
}
function drawWire(){
    ctx3.clearRect(itab,40,tab*width,tab*(height+1));
    ctx3.clearRect(itab,0,itab,itab);
    ctx3.drawImage(redSquare,round(jx(0)-redSquare.width/2), 40);
    
    ctx3.beginPath();
    ctx3.moveTo(jx(0), 40+redSquare.width);
    let i=0; jam=null;
    for(;i<wireStack.length-1;i++){
        ctx3.lineTo(jx(wireStack[i].j), jx(wireStack[i].i));
        for(let b of bots)
            if(b.i==wireStack[i].i && b.j==wireStack[i].j){
                jam = i; break;
            }
        if(jam!==null) break;
    }
    ctx3.shadowColor = '#f00';
    ctx3.shadowBlur = tab/5;
    ctx3.lineWidth = 4;
    ctx3.strokeStyle = '#680002';
    ctx3.stroke();
    ctx3.lineWidth = 1;
    ctx3.strokeStyle = '#bc0010';
    ctx3.stroke();
    ctx3.closePath();
    ctx3.shadowBlur = 0;
    if(i<wireStack.length-1){
        ctx3.beginPath();
        ctx3.moveTo(jx(wireStack[i].j), jx(wireStack[i].i));
        i++;
        for(;i<wireStack.length-1;i++){
            ctx3.lineTo(jx(wireStack[i].j), jx(wireStack[i].i));
        }
        
        ctx3.lineWidth = 4;
        ctx3.strokeStyle = '#330000';
        ctx3.stroke();
        ctx3.lineWidth = 1;
        ctx3.strokeStyle = '#4d0000';
        ctx3.stroke();
        ctx3.closePath();
    }
    for(let i in cannons){
        if(cannons[i].active)
            ctx3.drawImage(redSquare,m.round(cannons[i].x-redSquare.width/2), m.round(cannons[i].y-redSquare.width/2));
    }

}

function findBug(){
    let f = Vfield(player);
    let max = new tile(0,0);
    for(let i in f)
        for(let j in f[i])
            if(f[i][j].dist > max.dist){
                max = f[i][j];
                max.i = i; max.j = j;
            }
    return max;
}
function bugField(bot){
    if(!wireStack.length){
        bot.field = Vfield(player);
        return player;
    }
    else{
        bot.field = Vfield(bot);
        let min =  new tile(Infinity,0);
        for(let wire of wireStack){
            if(bot.field[wire.i][wire.j].dist < min.dist){
                min.dir = bot.field[wire.i][wire.j].dir;
                min.dist = bot.field[wire.i][wire.j].dist;
                min.i = wire.i; min.j = wire.j;
            }
        }
        let i=min.i, j=min.j;
        let curDir = min.dir;
        bot.field[i][j].dir = 0;
        while(curDir!==0){
            switch(curDir){
                case 1: 
                    j--;
                    curDir = bot.field[i][j].dir;
                    bot.field[i][j].dir=3;
                    break;
                case 2: 
                    i--;
                    curDir = bot.field[i][j].dir;
                    bot.field[i][j].dir=4;
                    break;
                case 3: 
                    j++;
                    curDir = bot.field[i][j].dir;
                    bot.field[i][j].dir=1;
                    break;
                case 4: 
                    i++;
                    curDir = bot.field[i][j].dir;
                    bot.field[i][j].dir=2;
                    break;
            }
        }
        return min;
    }
}
function glitch(img){
    let gltch = document.createElement('canvas');
    gltch.width = img.width; gltch.height = img.height;
    glctx = gltch.getContext('2d');
    let offset = gltch.width/20;
    let randY = ()=>{
        return m.random()*img.height;
    }
    let randH = (y)=>{
        return m.random()*(img.height-y);
    }
    let rndoff = ()=>{
        return m.random()*offset-offset/2;
    }
    for(let i=0;i<2;i++){
        let y = randY(),rh = randH(y),off=rndoff();
        glctx.drawImage(img,0,y,img.width,rh,off,y,img.width,rh);
    }
    return gltch;
}
function gameInit(p1,p2,p3){
    width = p2;
    intrnlns = p1;
    N = p3;
    ctx.clearRect(0,0,w,h);
    ctx2.clearRect(0,0,w,h);
    ctx3.clearRect(0,0,w,h);
    ctx4.clearRect(0,0,w,h);
    PAUSE = false;

    tab = ~~((w-itab)/width);
    height = ~~((h-itab)/tab);

    eps = tab/18;
    halfTab = tab/2; 
    rootTab = m.sqrt(tab);
    ws = tab/128; // wall scale
    vision = tab*2.5; // sight radius
    sqVision = vision*vision;
    cannonR = tab*2;
    cannonsChanged = true;
    segments = []; // for shadow casting
    wireStack = [];
    visibles = [];
    jam = null;
    fix = false;
    dieStep = 30;

    go = {
        Dn : tab,
        Rt : tab,
        Lt : tab,
        Up : tab,
    };

    cannons = [], bots = [];
    for(let i=0; i<N; i++)
        cannons.push(new cannon());
    botStep = 2;
    
    //============================================== prerendering
    radar = document.createElement('canvas');
    radar.width = radar.height = cannonR;
    r_ctx = radar.getContext('2d');
    r_ctx.beginPath();
    grdVec = new dot(m.cos(quarterPi), m.sin(quarterPi));
    grdVec = grdVec.rotate(halfPi);
    grd2=r_ctx.createLinearGradient(0-grdVec.x*cannonR,0-grdVec.y*cannonR,0+grdVec.x*cannonR,0+grdVec.y*cannonR);
    grd2.addColorStop(0,"red");
    grd2.addColorStop(1,"transparent");
    r_ctx.fillStyle=grd2;
    r_ctx.moveTo(0,0);
    r_ctx.lineTo(cannonR, 0);
    r_ctx.lineWidth = 4;
    r_ctx.strokeStyle = 'red';
    r_ctx.stroke();
    r_ctx.arc(0,0,cannonR,0,halfPi);
    r_ctx.fill();
    r_ctx.closePath();

    redSquare = document.createElement('canvas');
    redSquare.width = redSquare.height = round(tab/5);
    sq_ctx = redSquare.getContext('2d');
    sq_ctx.beginPath();
    /*sq_ctx.shadowColor = '#bc0010';
    sq_ctx.shadowBlur = round(tab/8);*/
    sq_ctx.fillStyle = '#680002';
    sq_ctx.fillRect(round(redSquare.width/2-tab/10),round(redSquare.width/2-tab/10),round(tab/5),round(tab/5));
    sq_ctx.fillStyle = '#bc0010';
    sq_ctx.shadowBlur = 0;
    sq_ctx.fillRect(redSquare.width/2-tab/14,redSquare.width/2-tab/14,tab/7,tab/7);
    sq_ctx.closePath();

    blackSquare = document.createElement('canvas');
    blackSquare.style.background = 'rgba(0,0,0,0)';
    blackSquare.width = blackSquare.height = round(tab/3);
    bsq_ctx = blackSquare.getContext('2d');
    bsq_ctx.beginPath();
    bsq_ctx.shadowColor = shadowCol;
    bsq_ctx.shadowBlur = round(tab/5);
    bsq_ctx.fillStyle = shadowCol;
    bsq_ctx.fillRect(round(blackSquare.width/2-tab/10),round(blackSquare.width/2-tab/10),round(tab/5),round(tab/5));
    bsq_ctx.shadowBlur = 0;
    bsq_ctx.closePath();
    //=================================================
    player = {
        i: 0,
        j: 0,
        x: itab+halfTab,
        y: itab+halfTab,
        step: 3,
        stop: false,
        shoots: false,
        HIT: null,
        updateStep(diff){
            this.step = round((diff/5)*(rootTab/10));
        },
        hit(){
            this.HIT = null;
            let minDist = Infinity;
            for(let i in bots){
                let botDist = sqdist(bots[i],this);
                if(bots[i].i===this.i && bots[i].j===this.j){
                    this.HIT = i;
                    return;
                }
                let target = m.atan2(bots[i].y-this.y,bots[i].x-this.x);
                if(inRange(target,dir.angle,pi/16)){
                    let intersects = [];
                    let ray = new dot(cursor.trueX-this.x, cursor.trueY-this.y);
                    for (let seg of segments){
                        let dot = newSegRay(seg,ray,this);
                        if(dot) intersects.push({dot:dot,seg:seg});
                    }
                    if(intersects.length){
                        intersects.sort((a,b)=>sqdist(a.dot,this)-sqdist(b.dot,this));
                        if(sqdist(intersects[0].dot,this) > botDist && botDist < minDist){
                            this.HIT = i; 
                            minDist = botDist;
                        }
                    }
                    else if(botDist < minDist){
                        this.HIT = i;
                        minDist = botDist;
                    }
                }
            }
        }
    };
    maze = []; // for storing rows
    row = [];  // for storing cells
    sets = new Array(width); //each set has 1 initial cell
    cursor={
      x: player.x,
      y: player.y,
    };
    dir = {
        update() {
            for (let i in this){
                if(typeof(this[i])!='function')
                    this[i] = null;
            }
            this.y = cursor.y - player.y;
            this.x = cursor.x - player.x;
            this.angle = m.atan2(this.y,this.x);
            
            if(this.angle < quarterPi && this.angle > -quarterPi)
                this.right = true;
            else if(this.angle < 3*quarterPi && this.angle > quarterPi)
                this.down = true;
            else if(this.angle < -quarterPi && this.angle > -3*quarterPi)
                this.up = true;
            else if(this.angle < -3*quarterPi || this.angle > 3*quarterPi)
                this.left = true;
        }
    };
    //----------------------------------------------------------------------------------------------------------------------maze generation
    for(let j=0; j<width; j++){
        row.push(new cell(0,0,j)); //initialize cells to different sets
        let set = [j]; // init sets with initial cells
        sets[j] = JSON.parse(JSON.stringify(set)); // because js... 

    }
    for(let i=0; i<height; i++){

        for(let j=0; j<width; j++){ // need to edit previous row to use it as a new one
            row[j].r=0;
            if(row[j].l){
                let index = sets[row[j].s].indexOf(j);
                sets[row[j].s].splice(index,1); // delete cell from set
                row[j].s = -1; // delete cells that have lower walls
            }
            row[j].l=0;
        }

        for(let j=0; j<width; j++)
            if(row[j].s == -1){     // assign unique # to cells 
                row[j].s = 0;       // that belong to no sets                       
                
                for(let k=0; k<width; k++)
                    if(k!=j && row[k].s===row[j].s){ 
                        row[j].s++;
                        k=-1;
                    }
                sets[row[j].s].push(j);
            }                               
        
        /* create right walls */
        for(let j=0; j<width-1; j++){ 
            if(m.round(m.random())) row[j].r = 1; // random wall
            else if(row[j+1].s!=row[j].s) merge(row[j+1].s,row[j].s,row);
        }
        row[width-1].r = 1;
        /* create lower walls */
        let exits = new Array(width).fill(0);
        for(let j=0; j<width; j++) exits[row[j].s]++; // yet each sell has no lower wall
        for(let j=0; j<width; j++){ 
            if(m.round(m.random())){ // if decided to create wall
                if(exits[row[j].s]>1){ // have to check for exit from set
                    row[j].l = 1;
                    exits[row[j].s]--;
                }
            }
        }
        if(i===height-1){
            for(let j=0; j<width; j++){ // last row
                row[j].l = 1; // lower walls to all
                if(j+1<width && row[j].s != row[j+1].s){ // unite cells from different sets
                    row[j].r = 0;
                    merge(row[j+1].s,row[j].s,row);
                }
            }
            row[width-1].r = 1;
        }
        maze.push(JSON.parse(JSON.stringify(row))); // because js
    }
    KEY={
        key38:false, // up
        key40:false, // down
        key39:false, // right
        key37:false, // left
        
        key87:false, // w
        key83:false, // s
        key68:false, // d
        key65:false, // a
    };
    //---------------------------------------------------------------------------------------draw maze
    lw_w = 64*ws;
    pad1 = 0; pad2 = 0; pad3 = 0; pad4 = 0;
    pad5 = 0; pad6 = 0; pad7 = 0; pad8 = 0;
    let x,y;
    for(let n=0;n<2;n++)
        for(let i=0;i<height;i++){
            for(let j=0;j<width;j++){
                if(i===0&&n===0){
                    x = itab+j*tab;
                    y = itab-lw_w/2;
                }
                if(j===0&&n===1){
                    x = itab-lw_w/2;
                    y = itab+i*tab-lw_w/2;
                }
                if(maze[i][j].r===1&&n===1){
                    x = itab+(j+1)*tab-lw_w/2;
                    y = itab+i*tab-lw_w/2;
                    if(j<width-1){
                        pad3 = pad4 = pad5 = pad6 = pad7 = pad8 = 0;
                        if(i===0||maze[i-1][j].r===1){
                            pad3 = lw_w;
                        }
                        if(i===height-1){
                            pad4 = lw_w;
                        }
                        if(!pad3&&i>0&&maze[i-1][j].l){
                            pad5 = lw_w;
                        }
                        if(i+1<height&&maze[i][j].l){
                            pad6 = lw_w;
                        }
                        if(!pad3&&i>0&&maze[i-1][j+1].l){
                            pad7 = lw_w;
                        }
                        if(i+1<height&&maze[i][j+1].l){
                            pad8 = lw_w;
                        } 
                        segments.push(new segment(new dot(x,y+pad3+pad5), new dot(x,y+lw_w*3-pad4-pad6)));
                        segments.push(new segment(new dot(x+lw_w,y+pad3+pad7), new dot(x+lw_w,y+lw_w*3-pad4-pad8)));
                        if(i>0&&!maze[i-1][j].r){
                            segments.push(new segment(new dot(x,y), new dot(x+lw_w,y)));
                        }
                        if(i+1<height&&!maze[i+1][j].r){
                            segments.push(new segment(new dot(x,y+lw_w*3), new dot(x+lw_w,y+lw_w*3)));
                        }
                    }
                }
                if(maze[i][j].l===1&&n===0){
                    x = itab+j*tab;
                    y = itab+(i+1)*tab-lw_w/2;
                    if(i<height-1){
                        pad1 = pad2 = 0;
                        if(maze[i][j].r===1||i+1<height&&maze[i+1][j].r===1){
                            pad1 = lw_w/2;
                        } 
                        if(j===0||(maze[i][j-1].r===1||i+1<height&&maze[i+1][j-1].r===1)){
                            pad2 = lw_w/2;
                        } 
                        segments.push(new segment(new dot(x+pad2,y), new dot(x-pad1+lw_w*2,y)));
                        segments.push(new segment(new dot(x+pad2,y+lw_w), new dot(x-pad1+lw_w*2,y+lw_w)));
                        if(!pad1&&j+1<width&&!maze[i][j+1].l)
                            segments.push(new segment(new dot(x+lw_w*2,y), new dot(x+lw_w*2,y+lw_w)));
                        if(!pad2&&j>0&&!maze[i][j-1].l)
                            segments.push(new segment(new dot(x,y), new dot(x,y+lw_w)));
                    }
                }
            }
        }

    for(let i=0; i<segments.length; i++){
        if(segments[i]){
            for(let j=0; j<segments.length; j++){
                if(segments[j] && segments[j].prolongs(segments[i])){
                    segments[i].concat(segments[j]);
                    segments[j] = null;
                    j = -1;
                }
            }
        }
    }
    segments = segments.filter(I => I);

    function drawMaze(){
        //floor fill
        ctx2.beginPath();
        /*ctx.fillStyle = '#125425';
        ctx.fillRect(itab,itab,width*tab,height*tab);*/
        floorPat = ctx.createPattern(floor, 'repeat');
        ctx2.fillStyle = floorPat;
        ctx2.fillRect(itab,itab,width*tab,height*tab);
        ctx2.closePath();
        
        ctx2.shadowColor = '#fff';
        ctx2.shadowBlur = tab/2;
        ctx2.strokeStyle = '#1dfc81';
        ctx2.fillStyle = '#1dfc81';
        ctx2.lineWidth = tab/20;
        segments.map(I => {
            ctx2.beginPath();
            ctx2.moveTo(I.a.x,I.a.y);
            ctx2.lineTo(I.b.x,I.b.y);
            ctx2.stroke();
            ctx2.closePath();
        });

        segments.map(I => {
            ctx2.beginPath();
            ctx2.fillRect(I.a.x-tab/40,I.a.y-tab/40,tab/20,tab/20);
            ctx2.fillRect(I.b.x-tab/40,I.b.y-tab/40,tab/20,tab/20);
            ctx2.closePath();
        });
        ctx2.shadowBlur = 0;
        // draw some text on top
        ctx3.shadowColor = 'white';
        ctx3.shadowBlur = 20;
        ctx3.beginPath();
        ctx3.font = '20px monospace';
        ctx3.fillStyle = '#1dfc81';
        ctx3.fillText('wire_left: ',300,20);
        ctx3.fillText('defenders_left: ',500,20);
        ctx3.fillText('internalness: '+intrnlns,810,20);
        ctx3.closePath();
        ctx3.shadowBlur = 0;
    };
    if(floor.complete) drawMaze();
    else floor.onload = drawMaze;

    bug = findBug();
    spawnBots(N);
    wireLength = bug.dist;
    blinkRad = 0; blinkStep = 2;
    
    wireChanged=true;
    ctx.fillStyle = shadowCol;
    ctx.fillRect(0,0,w,h);

    if(!initMsg){
        msgPos = drawMsg('> reached internals.<br>> internal error detected.<br>> viewing range limited due to power loss. <br>> provide fix supply.<br>> W to move.<br>> mouse to look around.<br>> ');
        initMsg = true;
    }
    else{
        mgsPos = drawMsg('> looks more internal. <br>> defenders++ <br>> bugs++? <br>>');
    }
    countWire();

}

//----------------------------------------------------------------------------------------------------------------------------------game loop
function draw(dT){
if(!PAUSE){
        if(!lastdT){ 
            lastdT = dT;
            trans = dT;
        }
        else {
        	let diff = dT-lastdT;
            player.updateStep(diff);
            botsNewStep(diff);
            cannonsNewStep(diff);
            lastdT = dT;
        }

        // window.scrollTo(0, player.y-winHalfH);
        // ctx.fillStyle = shadowCol;
        ctx.fillRect(player.x-vision,player.y-vision,vision*2,vision*2);
        ctx4.clearRect(0,0,w,h);

    //--------------------------------------------------------------------------------------------------------move player & bots
        
        if(KEY.key87){
            if(dir.right && maze[player.i][player.j].r!=1 && go.Rt>=tab && go.Dn>=tab && go.Up>=tab && (!player.stop || player.stop == 3)) go.Rt-=tab;
            if(dir.up && player.i>0 && maze[player.i-1][player.j].l!=1 && go.Up>=tab && go.Rt>=tab && go.Lt>=tab && (!player.stop || player.stop == 2)) go.Up-=tab;
            if(dir.down && maze[player.i][player.j].l!=1 && go.Dn>=tab && go.Rt>=tab && go.Lt>=tab && (!player.stop || player.stop == 4)) go.Dn-=tab;
            if(dir.left && player.j>0 && maze[player.i][player.j-1].r!=1 && go.Lt>=tab && go.Dn>=tab && go.Up>=tab && (!player.stop || player.stop == 1)) go.Lt-=tab;

            if(sqdist(player,msgPos)<sqVision)drawMsg('');
        }
        if(go.Rt < tab){
            player.x+=player.step;
            go.Rt+=player.step;
            if(go.Rt >= tab) player.j++;
        }
        else if(go.Lt < tab){
            player.x-=player.step;
            go.Lt+=player.step;
            if(go.Lt >= tab) player.j--;
        }
        else if(go.Up < tab){
            player.y-=player.step;
            go.Up+=player.step;
            if(go.Up >= tab) player.i--;
        }
        else if(go.Dn < tab){
            player.y+=player.step;
            go.Dn+=player.step;
            if(go.Dn >= tab) player.i++;
        }
        for (let i in bots){
            if(!bugMsg && sqdist(player,bots[i])<tab*tab-5){
                msgPos = drawMsg('> LMB to exterminate minor bug. <br>> bugs block cable.<br>> cause signal glitches. <br>> SPACE to install defender.<br>>');
                bugMsg = true;
            }
            if(wireChanged || !bots[i].field){
                bugField(bots[i]);
            }
            if(bots[i].field[bots[i].i][bots[i].j].dir===1 ){bots[i].dir=1;} 
            else if(bots[i].field[bots[i].i][bots[i].j].dir===2){bots[i].dir=2;} 
            else if(bots[i].field[bots[i].i][bots[i].j].dir===3){bots[i].dir=3;} 
            else if(bots[i].field[bots[i].i][bots[i].j].dir===4){bots[i].dir=4;} 
            else if(bots[i].field[bots[i].i][bots[i].j].dir===0){
                bots[i].dir=0;
                if(!bots[i].jam){
                    trans = dT;
                    drawWire();
                    bots[i].jam=true;
                }
            }
            if(!bots[i].dying){                    
                if(bots[i].dir===1){
                   bots[i].x-=botStep;
                    if(halfTab+itab+(bots[i].j)*tab - bots[i].x>=tab){ bots[i].j--; }
                }
                else if(bots[i].dir===2){
                    bots[i].y-=botStep;
                    if(halfTab+itab+(bots[i].i)*tab - bots[i].y>=tab){ bots[i].i--; }
                }
                else if(bots[i].dir===3){
                    bots[i].x+=botStep;
                    if(bots[i].x - itab-bots[i].j*tab-halfTab>=tab){bots[i].j++; }
                }
                else if(bots[i].dir===4){
                    bots[i].y+=botStep;
                    if(bots[i].y - itab-bots[i].i*tab-halfTab>=tab) { bots[i].i++; }
                }
            }
        }
        
        //--------------------------------------------------------------------draw player

        // cast shadows underneath player
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(player.x,player.y);
        ctx.arc(player.x,player.y,vision,dir.angle-quarterPi,dir.angle+quarterPi);
        ctx.fill();
        ctx.closePath();
        ctx.globalCompositeOperation = 'source-over';

        getVisibles(segments.filter(I=>distToSeg(player,I)<vision),player);
        for (let i of visibles){
                shadow(i.a,i.b);
        }

        /*eye1 = new dot(player.x+m.cos(dir.angle-quarterPi)*tab/9,player.y+m.sin(dir.angle-quarterPi)*tab/9);
        eye2 = new dot(player.x+m.cos(dir.angle+quarterPi)*tab/9,player.y+m.sin(dir.angle+quarterPi)*tab/9);
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        for (let i of visibles){
                shadow(i.a,i.b,eye1);
        }
        for (let i of visibles){
                shadow(i.a,i.b,eye2);
        }*/
        
        dir.update();

        // red square character
        ctx.drawImage(redSquare,round(player.x-redSquare.width/2), round(player.y-redSquare.width/2));

        //-------------------------------------------------------------------------------build wire
        wireChanged=false;
        if(wireStack.length === 0)
            wireStack.push({j:0, i:0});
        else if(player.j!=wireStack[wireStack.length-1].j || player.i!=wireStack[wireStack.length-1].i){
            if(wireStack.length>1 && player.j===wireStack[wireStack.length-2].j && player.i===wireStack[wireStack.length-2].i){
                wireStack.pop();
                wireChanged = true;
                countWire();
                drawWire();
            }
            else{
                wireStack.push({j:player.j, i:player.i});
                wireChanged = true;
                countWire();
                drawWire();
            }
        }
        
        if(!wireChanged && cannonsChanged){
            drawWire();
            countCannons();
        }

        ctx.beginPath();
        if(wireStack.length > 1){
            ctx.moveTo(jx(wireStack[wireStack.length-2].j), jx(wireStack[wireStack.length-2].i));
            let vec = new dot(player.x-jx(wireStack[wireStack.length-2].j),player.y-jx(wireStack[wireStack.length-2].i));
            vec.x*=0.9; 
            vec.y*=0.9;
            ctx.lineTo(jx(wireStack[wireStack.length-2].j)+vec.x, jx(wireStack[wireStack.length-2].i)+vec.y);
        }
        else{
            ctx.moveTo(jx(0),40);
            ctx.lineTo(player.x,player.y-redSquare.width/2);
        }
        if(jam===null){
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#680002';
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#bc0010';
            ctx.stroke();
            ctx.closePath();
        }
        else{
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#330000';
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#4d0000';
            ctx.stroke();
            ctx.closePath();
        }

        // bug blink
        ctx4.beginPath();
        ctx4.arc(jx(bug.j),jx(bug.i),blinkRad,0,pi*2);
        blinkRad += blinkStep;
        if(blinkRad > tab/2 || blinkRad < 2)
            blinkStep = -blinkStep;
        let grd=ctx4.createRadialGradient(jx(bug.j),jx(bug.i),tab/16,jx(bug.j),jx(bug.i),tab/3);
        grd.addColorStop(0,"#bc0010");
        grd.addColorStop(1,"transparent");
        ctx4.fillStyle = grd;
        ctx4.fill();
        ctx4.fillRect(jx(bug.j)-tab/16,jx(bug.i)-tab/16,tab/8,tab/8);
        ctx4.closePath();

        

        //draw cannons (radars)
        
        for(let i in cannons){
            if(cannons[i].active){
                ctx4.save();
                ctx4.translate(round(cannons[i].x),round(cannons[i].y));
                ctx4.rotate(cannons[i].arc);
                ctx4.drawImage(radar,0,0);
                cannons[i].arc-=cannonStep; cannons[i].arc%=pi*2;
                ctx4.restore();
            }
        }
        //----------------------------------------------------------------------------draw bots
        for(let i in bots){
            let cannonHIT = null;
            let cannonJ = null;
            for(let j in cannons){
                if(cannons[j].active){
                    if(cannons[j].HIT===i){
                        cannonHIT=i;
                        cannonJ = j;
                        break;
                    }
                    if(!cannons[j].HIT && sqdist(cannons[j],{x:jx(bots[i].j),y:jx(bots[i].i)}) <= cannonR*cannonR+1){
                        cannons[j].hit(i);
                        if(cannons[j].HIT===i){
                            cannonHIT = i;
                            cannonJ = j;
                            break;
                        }
                    }
                }
            }
            if(!bots[i].dying && player.HIT!=i && cannonHIT!=i){
                ctx4.drawImage(blackSquare,round(bots[i].x-blackSquare.width/2),round(bots[i].y-blackSquare.width/2));
            }
            else if(!bots[i].dying){
                bots[i].dying=dieStep;
            }
            else{
                ctx4.beginPath();
                ctx4.fillStyle = shadowCol;
                let n = bots[i].dying*(tab/5)/dieStep;
                ctx4.fillRect(bots[i].x-n/2,bots[i].y-n/2,n,n);
                ctx4.closePath();

                bots[i].dying--;
                if(bots[i].dying===1){
                    bots[i].dying=false;
                    if(player.HIT===i)player.HIT=null;
                    if(cannonJ&&cannons[cannonJ].HIT===i)
                        cannons[cannonJ].HIT=null;
                    bots[i].respawn();
                    drawWire();
                }
            }
        }


        //draw electric shots
        if(player.shoots){
            let x,y;
            if(player.HIT){
                x = bots[player.HIT].x;
                y = bots[player.HIT].y;
            }
            else{
                x = cursor.trueX;
                y = cursor.trueY;
            }
            drawElectro(player,{x:x,y:y});
        }
        for(let j in cannons){
            let i = cannons[j].HIT;
            if(i && cannons[j].active){
                drawElectro(cannons[j],bots[i]);
            }
        }
        //fix animation && level toggle
        if(fix){
            let tip = new dot( jx(wireStack[tipWire].j), jx(wireStack[tipWire].i));
            let vec1 = new dot(tip.x-fixTip.x,tip.y-fixTip.y);
            let l = m.sqrt(sqmod(vec1));
            fixTip.x+=(vec1.x/l)*(tab/8);
            fixTip.y+=(vec1.y/l)*(tab/8);
            ctx4.beginPath();
            ctx4.lineWidth = 2;
            ctx4.strokeStyle = '#1dfc81';
            ctx4.moveTo(jx(0),40+redSquare.width/2);
            for(let i=0; i<tipWire;i++){
                ctx4.lineTo(jx(wireStack[i].j), jx(wireStack[i].i));
            }
            ctx4.lineTo(fixTip.x,fixTip.y);
            ctx4.stroke();
            ctx4.closePath();
            if(sqdist(fixTip,tip)<(tab*tab/16)){
                if(tipWire===jam){
                    msgPos=drawMsg('> smth blocks fix supply.<br>>')
                    fix=false;
                }
                else if(tipWire==wireStack.length-1){
                    fix = false;
                    if(N==3){
                        PAUSE = true;
                        drawMsg('> good job. <br>> internal error fixed.<br>> ')
                        setTimeout(function(){location.reload();},3000);
                    }
                    else
                        gameInit(intrnlns+1,width+3,N+1);
                }
                else{
	                fixTip.x = tip.x; fixTip.y = tip.y;
	                tipWire++;
	            }
            }
        }
}
if(dT-trans < 500){
    ctx.drawImage(glitch(canvas),0,0);
}
requestAnimationFrame(draw);
}

floor.onload = function(){
floorPat = ctx.createPattern(floor, 'repeat');
let internals = document.createElement('canvas');
internals.width = w*4; internals.height = 600;
ictx = internals.getContext('2d');
ictx.beginPath();
ictx.beginPath();
ictx.fillStyle = '#000';
ictx.fillRect(0,0,internals.widht,internals.height);
ictx.font = '500px monospace';
ictx.strokeStyle = '#1dfc81';
ictx.lineWidth = 4;
ictx.fillStyle = floorPat;
ictx.fillText('Internal error', 0,500);
ictx.strokeText('Internal error', 0,500);
ictx.closePath();

let lst,fst,t=3;
let on = false, dive = false;
let rndIntrvl = m.random()*1500;
let rndIntrvl2 = m.random()*500+500;
let glgo = false;

function intro(dt){
    ctx.clearRect(0,0,w,h);
    if(!lst){
        lst = dt;
        fst = dt
    }
    
    else if(!dive){
        if(dt-lst > 500){
            on = !on;
            lst = dt;
        }
        if(dt-fst > 3000){
            fst = dt;
            dive = true;
            glgo = true;
            on = false;
        }
    }
    
    if(on){
        ctx.beginPath();
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.font = '15px monospace';
        ctx.fillStyle = '#1dfc81';
        ctx.fillText('> Internal error', 10,30);
        ctx.closePath();
    }
    else if(dive){
        ctx.shadowBlur = 0;
        if(dt-fst > 2000){
            t-=0.005;
            if(t < 0.5){
                gameInit(1,10,2);
                //-------------------------------------------------------------------------------------------------------controls block
                document.addEventListener("mousemove",function(e){
                    let b = canvas.getBoundingClientRect();
                    cursor.trueX = e.pageX-b.left;
                    cursor.trueY = e.pageY-b.top;
                    let v = new dot(e.pageX-b.left-player.x, e.pageY-b.top-player.y);
                    let l = sqmod(v);
                    if(l < sqVision/4){
                        l = m.sqrt(l);
                        cursor.x = player.x + v.x*(0.5*vision/l); 
                        cursor.y = player.y + v.y*(0.5*vision/l);
                    }
                    else {
                        cursor.x = e.pageX-b.left;
                        cursor.y = e.pageY-b.top;
                    }
                });
                document.addEventListener("keydown",function(e){
                    KEY["key"+e.keyCode]=true;
                    /*if(e.keyCode===118)
                        PAUSE=!PAUSE;*/
                    if(e.keyCode===32){
                        e.preventDefault();
                        if(!defMsg){
                            msgPos = drawMsg('> defender exterminates bugs in its viewing range. <br>> bugs spawn randomly but keep distance from cable. <br>> install near crossroads or long dark dead-ends. <br>> try covering bigger cable areas. <br>> SPACE to pick up. <br>>');
                            defMsg = true;
                        }
                        let trig = false;
                        cannonsChanged = true;
                        for(let i in cannons){
                            if(cannons[i].active && cannons[i].i===player.i && cannons[i].j===player.j){
                                cannons[i].deactivate();
                                trig = true;
                                break;
                            }
                        }
                        if(!trig)
                            for(let i in cannons){
                                if(cannons[i].activate(player.i,player.j)) break;
                            }
                    }
                    
                });
                document.addEventListener("mousedown",function(e){
                    e.preventDefault();
                    player.shoots=true; 
                    player.hit();
                });
                document.addEventListener("mouseup",function(e){
                    player.shoots=false;
                });
                document.addEventListener("keyup",function(e){KEY["key"+e.keyCode]=false;});
                draw();
                return;
            }
        }
        if(!glgo && dt-lst > rndIntrvl){
            glgo = true;
            rndIntrvl = m.random()*2000;
            lst = dt;
        }
        if(glgo){
            ctx.drawImage(glitch(internals), 0,h/2-(1/t)*300,(w*4)/t,600/t);
            if(dt-lst>rndIntrvl2){
                glgo = false;
                lst = dt;
                rndIntrvl2 = m.random()*250
            }
        }
        else{
            ctx.drawImage(internals, 0,h/2-(1/t)*300,(w*4)/t,600/t);
        }
    }
    requestAnimationFrame(intro);
}
intro();
}