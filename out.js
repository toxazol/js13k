!function(t,i){function e(){this.active=!1,this.g=function(t,i){return!this.active&&(this.active=!0,this.h=i,this.i=t,this.x=v(i),this.y=v(t),this.arc=0,!0)},this.j=function(){this.active=!1},this.k=null,this.l=function(t){this.k=null;let i=T.atan2(st[t].y-this.y,st[t].x-this.x);if(st[t].i===this.i&&st[t].h===this.h)return void(this.k=t);if(s(i,w(this.arc+R),R)){let i=[],e=new h(st[t].x-this.x,st[t].y-this.y);for(let n of V){let t=d(n,e,this);t&&i.push({m:t,o:n})}let r=g(st[t],this);i.length?(i.sort((t,i)=>g(t.m,this)-g(i.m,this)),g(i[0].m,this)>r&&(this.k=t)):this.k=t}}}function n(t,i,e,n,r=0,o=2){this.i=t,this.h=i,this.x=e,this.y=n,this.step=o,this.dir=r,this.u=!1}function r(t,i){this.v=t,this.dir=i}function o(t,i,e){this.A=t,this.r=i,this.B=e}function h(t=0,i=0){this.x=t,this.y=i,this.C=function(t){return a(this.x,t.x)&&a(this.y,t.y)},this.rotate=function(t){let i=this.x,e=this.y,n=T.cos(t)*i-T.sin(t)*e,r=T.sin(t)*i+T.cos(t)*e;return new h(n,r)}}function l(t,i){this.a=t,this.b=i,this.C=function(t){return this.a.C(t.a)&&this.b.C(t.b)},this.vertical=function(){return a(this.a.x,this.b.x)},this.D=function(){return a(this.a.y,this.b.y)},this.concat=function(t){this.b=t.b},this.F=function(t){if(a(t.b.y,this.a.y)&&a(t.b.x,this.a.x)){if(a(t.a.x,t.b.x)&&a(this.a.x,this.b.x))return!0;if(a(t.a.y,t.b.y)&&a(this.a.y,this.b.y))return!0}return!1}}function s(t,i,e){return w(w(t)-w(i))<e||w(w(i)-w(t))<e}function a(t,i){return T.abs(t-i)<Y}function f(t,i){if(i.vertical()){if(x(i.a.y,t.y,i.b.y))return T.abs(t.x-i.a.x)}else if(x(i.a.x,t.x,i.b.x))return T.abs(t.y-i.a.y);let e=T.min(g(t,i.a),g(t,i.b));return T.sqrt(e)}function y(t,i){for(let e of t)if(e.a===i.a&&e.b===i.b)return!1;return!0}function u(t){let i=[];for(let e=0;e<t.length;e++)i.some(i=>i.C(t[e].a))||i.push(t[e].a),i.some(i=>i.C(t[e].b))||i.push(t[e].b);return i}function c(t,i,e=true){dt=[];let n=u(t);n=n.filter(t=>g(i,t)<=_);let r=[];for(let o of n){let t=new h(o.x-i.x,o.y-i.y),n=T.atan2(t.y,t.x);e&&s(n,xt.angle,R)&&(r.push(t.rotate(.01)),r.push(t.rotate(-.01))),e||(r.push(t.rotate(.01)),r.push(t.rotate(-.01)))}let l=new h(xt.x,xt.y);r.push(l.rotate(R)),r.push(l.rotate(-R));let a=[];for(let f of r){a=[];for(let e of t){let t=d(e,f,i);t&&g(i,t)<=_&&a.push({m:t,o:e})}a.length&&(a.sort((t,e)=>g(t.m,i)-g(e.m,i)),y(dt,a[0].o)&&dt.push(a[0].o))}}function x(t,i,e){return i>=t&&i<=e||i>=e&&i<=t}function d(t,i,e){if(t.vertical()){let n=(t.a.x-e.x)/i.x;if(n>0){let r=e.y+i.y*n;if(x(t.a.y,r,t.b.y))return{x:t.a.x,y:r}}}else{let n=(t.a.y-e.y)/i.y;if(n>0){let r=e.x+i.x*n;if(x(t.a.x,r,t.b.x))return{x:r,y:t.a.y}}}return null}function w(t){return t<0?t+=2*M:(t>=2*M&&(t%=2*M),t)}function g(t,i){return T.pow(t.x-i.x,2)+T.pow(t.y-i.y,2)}function p(t){return t.x*t.x+t.y*t.y}function b(t,i,e=H,n=rt,r=J){let o=new h(t.x-i.x,t.y-i.y),l=T.sqrt(p(o));o.x/=l,o.y/=l;let s=new h(t.x+o.x,t.y+o.y),f=new h(i.x-o.x,i.y-o.y),y=T.sqrt(g(s,n)),u=T.sqrt(g(f,n)),c=T.abs(y-K),x=T.abs(u-K),d={x:(s.x-n.x)*(c/y),y:(s.y-n.y)*(c/y)},w={x:(f.x-n.x)*(x/u),y:(f.y-n.y)*(x/u)},b=0,k=0;a(s.x,f.x)?b=T.sign(d.x)*K:k=T.sign(d.y)*K,r.fillStyle=e,r.strokeStyle=e,r.lineWidth=1,r.beginPath(),r.moveTo(s.x,s.y),r.lineTo(s.x+d.x,s.y+d.y),r.lineTo(s.x+d.x+b,s.y+d.y+k),r.lineTo(f.x+w.x+b,f.y+w.y+k),r.lineTo(f.x+w.x,f.y+w.y),r.lineTo(f.x,f.y),r.lineTo(s.x,s.y),r.fill(),r.closePath()}function k(t,i,e){for(let n of yt[t])e[n].B=i,yt[i].push(n);yt[t]=[]}function v(t){return t*X+X+50}function m(t){let i=[];for(let e=0;e<it;e++)i.push(new Array);let e=t.i,n=t.h,o=["last"];i[e][n]=new r(0,0);do 1!=at[e][n].r&&(!i[e][n+1]||n+1<tt&&i[e][n+1]&&i[e][n+1].v>i[e][n].v+1)?(i[e][n+1]=new r(i[e][n].v+1,1),o.push({a:e,b:n}),n+=1):1!=at[e][n].A&&(!i[e+1][n]||e+1<it&&i[e+1][n]&&i[e+1][n].v>i[e][n].v+1)?(i[e+1][n]=new r(i[e][n].v+1,2),o.push({a:e,b:n}),e+=1):n>0&&1!=at[e][n-1].r&&(!i[e][n-1]||n>0&&i[e][n-1]&&i[e][n-1].v>i[e][n].v+1)?(i[e][n-1]=new r(i[e][n].v+1,3),o.push({a:e,b:n}),n-=1):e>0&&1!=at[e-1][n].A&&(!i[e-1][n]||e>0&&i[e-1][n]&&i[e-1][n].v>i[e][n].v+1)?(i[e-1][n]=new r(i[e][n].v+1,4),o.push({a:e,b:n}),e-=1):o.length&&(U=o.pop(),e=U.a,n=U.b);while(o.length>0);return i}function B(t,i){let e=new h(i.x-t.x,i.y-t.y),n=T.sqrt(p(e));e.x/=n,e.y/=n;let r=e.rotate(A);J.strokeStyle="white",J.shadowColor="#00ffff",J.shadowBlur=10,J.beginPath(),J.lineWidth=1,J.moveTo(t.x,t.y);let o=n/15;for(let l=1;l<o;l++){let i=20*T.random()-10;J.lineTo(t.x+e.x*(l/o)*n+r.x*i,t.y+e.y*(l/o)*n+r.y*i)}J.lineTo(i.x,i.y),J.stroke(),J.closePath(),J.beginPath(),J.lineWidth=2,J.moveTo(t.x,t.y);for(let l=1;l<o;l++){let i=10*T.random()-5;J.lineTo(t.x+e.x*(l/o)*n+r.x*i,t.y+e.y*(l/o)*n+r.y*i)}J.lineTo(i.x,i.y),J.stroke(),J.closePath(),J.shadowBlur=0}function P(){Z=m(rt);let t=new r(0,0);for(let i in Z)for(let e in Z[i])Z[i][e].v>t.v&&(t=Z[i][e],t.i=i,t.h=e);return t}function S(t){if($.length){t.M=m(t);let i=new r(1/0,0);for(let e of $)t.M[e.i][e.h].v<i.v&&(i.dir=t.M[e.i][e.h].dir,i.v=t.M[e.i][e.h].v,i.i=e.i,i.h=e.h);let n=i.i,o=i.h,h=i.dir;for(t.M[n][o].dir=0;0!==h;)switch(h){case 1:o--,h=t.M[n][o].dir,t.M[n][o].dir=3;break;case 2:n--,h=t.M[n][o].dir,t.M[n][o].dir=4;break;case 3:o++,h=t.M[n][o].dir,t.M[n][o].dir=1;break;case 4:n++,h=t.M[n][o].dir,t.M[n][o].dir=2}return i}return t.M=m(rt),rt}function C(t){if(!F){window.scrollTo(0,rt.y-N),J.clearRect(0,0,W,O),gt.key87&&xt.right&&1!=at[rt.i][rt.h].r&&ct.H>=X&&ct.G>=X&&ct.J>=X&&(ct.H-=X),gt.key87&&xt.L&&rt.i>0&&1!=at[rt.i-1][rt.h].A&&ct.J>=X&&ct.H>=X&&ct.I>=X&&(ct.J-=X),gt.key87&&xt.K&&1!=at[rt.i][rt.h].A&&ct.G>=X&&ct.H>=X&&ct.I>=X&&(ct.G-=X),gt.key87&&xt.left&&rt.h>0&&1!=at[rt.i][rt.h-1].r&&ct.I>=X&&ct.G>=X&&ct.J>=X&&(ct.I-=X),ct.H<X&&(rt.x+=rt.step,ct.H+=rt.step,ct.H>=X&&rt.h++),ct.I<X&&rt.h>0&&(rt.x-=rt.step,ct.I+=rt.step,ct.I>=X&&rt.h--),ct.J<X&&rt.i>0&&(rt.y-=rt.step,ct.J+=rt.step,ct.J>=X&&rt.i--),ct.G<X&&(rt.y+=rt.step,ct.G+=rt.step,ct.G>=X&&rt.i++);for(let t in st)!Et&&st[t].M||S(st[t]),1===st[t].M[st[t].i][st[t].h].dir?st[t].dir=1:2===st[t].M[st[t].i][st[t].h].dir?st[t].dir=2:3===st[t].M[st[t].i][st[t].h].dir?st[t].dir=3:4===st[t].M[st[t].i][st[t].h].dir?st[t].dir=4:0===st[t].M[st[t].i][st[t].h].dir&&(st[t].dir=0),st[t].u||(1===st[t].dir?(st[t].x-=st[t].step,150+st[t].h*X-st[t].x>=X&&st[t].h--):2===st[t].dir?(st[t].y-=st[t].step,150+st[t].i*X-st[t].y>=X&&st[t].i--):3===st[t].dir?(st[t].x+=st[t].step,st[t].x-X-st[t].h*X-j>=X&&st[t].h++):4===st[t].dir&&(st[t].y+=st[t].step,st[t].y-X-st[t].i*X-j>=X&&st[t].i++));c(V.filter(t=>f(rt,t)<K),rt),z=new h(rt.x+T.cos(xt.angle-R)*X/9,rt.y+T.sin(xt.angle-R)*X/9),Q=new h(rt.x+T.cos(xt.angle+R)*X/9,rt.y+T.sin(xt.angle+R)*X/9);for(let t of dt)b(t.a,t.b);for(let t of dt)b(t.a,t.b,"rgba(0,0,0,0.5)",z);for(let t of dt)b(t.a,t.b,"rgba(0,0,0,0.5)",Q);J.beginPath(),J.arc(rt.x,rt.y,299,0,2*M),J.rect(W,0,-W,O),J.fillStyle=H,J.fill(),J.closePath(),J.save(),J.translate(rt.x,rt.y),J.rotate(xt.angle-R),J.beginPath(),J.rect(-300,-300,600,600),J.rect(K,0,-300,K),J.fill(),J.closePath(),J.rotate(R),J.rotate(R-M/32),J.beginPath(),J.rect(0,0,K,K),J.fillStyle="rgba(0,0,0,0.5)",J.fill(),J.closePath(),J.rotate(-R+M/32),J.rotate(-R+M/32),J.beginPath(),J.rect(0,0,K,-300),J.fill(),J.closePath(),J.rotate(R-M/32),J.restore(),xt.update(),J.beginPath(),J.shadowColor="#f00",J.shadowBlur=30,J.fillStyle="#680002",J.fillRect(rt.x-10,rt.y-10,20,20),J.fillStyle="#bc0010",J.fillRect(rt.x-6,rt.y-6,12,12),J.closePath(),J.shadowBlur=0,Et=!1,J.shadowBlur=40,J.shadowColor="#f00",J.beginPath(),J.fillStyle="#680002",J.fillRect(v(0)-10,0,20,20),J.fillStyle="#bc0010",J.fillRect(v(0)-6,4,12,12),J.closePath(),J.beginPath(),J.lineWidth=4,J.strokeStyle="#680002",J.moveTo(v(0),20),0===$.length?$.push({h:0,i:0}):rt.h==$[$.length-1].h&&rt.i==$[$.length-1].i||($.length>1&&rt.h===$[$.length-2].h&&rt.i===$[$.length-2].i?($.pop(),Et=!0):($.push({h:rt.h,i:rt.i}),Et=!0));for(let t=0;t<$.length-1;t++)J.lineTo(v($[t].h),v($[t].i));if($.length>1){let t=new h(rt.x-v($[$.length-2].h),rt.y-v($[$.length-2].i));t.x*=.9,t.y*=.9,J.lineTo(v($[$.length-2].h)+t.x,v($[$.length-2].i)+t.y)}else J.lineTo(rt.x,rt.y-10);J.stroke(),J.lineWidth=1,J.strokeStyle="#bc0010",J.stroke(),J.font="15px monospace",J.fillStyle="#02e769",J.fillText("wire_left: ",300,20),J.fillText("defenders_left: ",450,20),J.fillStyle="red",J.fillText(Gt-$.length+1+"",400,20),J.closePath(),J.shadowBlur=0,J.beginPath(),J.arc(v(qt.h),v(qt.i),Ht,0,2*M),Ht+=Lt,(Ht>50||Ht<2)&&(Lt=-Lt);let i=J.createRadialGradient(v(qt.h),v(qt.i),6.25,v(qt.h),v(qt.i),X/3);i.addColorStop(0,"#bc0010"),i.addColorStop(1,"transparent"),J.fillStyle=i,J.fill(),J.fillStyle="#bc0010",J.fillRect(v(qt.h)-6.25,v(qt.i)-6.25,12.5,12.5),J.closePath();for(let t in et)if(et[t].active){J.beginPath(),J.shadowColor="#f00",J.shadowBlur=30,J.fillStyle="#680002",J.fillRect(et[t].x-10,et[t].y-10,20,20),J.fillStyle="#bc0010",J.fillRect(et[t].x-6,et[t].y-6,12,12),J.closePath(),J.shadowBlur=0,J.beginPath();let i=new h(T.cos(et[t].arc+R),T.sin(et[t].arc+R));i=i.rotate(A);let e=J.createLinearGradient(et[t].x-i.x*D,et[t].y-i.y*D,et[t].x+i.x*D,et[t].y+i.y*D);e.addColorStop(0,"red"),e.addColorStop(1,"transparent"),J.fillStyle=e,J.moveTo(et[t].x,et[t].y),J.lineTo(et[t].x+T.cos(et[t].arc)*D,et[t].y+T.sin(et[t].arc)*D),J.strokeStyle="red",J.stroke(),J.arc(et[t].x,et[t].y,D,et[t].arc,et[t].arc+A),et[t].arc-=M/90,et[t].arc%=2*M,J.fill(),J.closePath()}else J.beginPath(),J.shadowColor="#f00",J.shadowBlur=30,J.fillStyle="#680002",J.fillRect(610+40*t,5,20,20),J.fillStyle="#bc0010",J.fillRect(614+40*t,9,12,12),J.closePath(),J.shadowBlur=0;for(let t in st){let i=null,e=null;for(let r in et)if(et[r].active){if(et[r].k===t){i=t,e=r;break}if(!et[r].k&&g(et[r],st[t])<=4e4&&(et[r].l(t),et[r].k===t)){i=t,e=r;break}}if(st[t].u||rt.k==t||i==t)if(st[t].u){J.shadowBlur=30,J.shadowColor=H,J.beginPath(),J.fillStyle=H;let i=st[t].u/3;if(J.fillRect(st[t].x-i/2,st[t].y-i/2,i,i),J.closePath(),J.shadowBlur=0,st[t].u--,1===st[t].u){st[t].u=!1,rt.k===t&&(rt.k=null),e&&et[e].k===t&&(et[e].k=null);let i,r={};do r.i=~~(T.random()*it),r.h=~~(T.random()*tt),st[t]=new n(r.i,r.h,v(r.h),v(r.i)),i=S(st[t]);while(i.v<3)}}else st[t].u=60;else J.shadowBlur=30,J.shadowColor=H,J.beginPath(),J.fillStyle=H,J.fillRect(st[t].x-10,st[t].y-10,20,20),J.closePath(),J.shadowBlur=0}if(rt.q){let t,i;rt.k?(t=st[rt.k].x,i=st[rt.k].y):(t=ut.s,i=ut.t),B(rt,{x:t,y:i})}for(let e in et){let t=et[e].k;t&&et[e].active&&B(et[e],st[t])}}requestAnimationFrame(C)}const T=Math,M=T.PI,A=M/2,R=M/4,I=document.getElementById("c"),J=I.getContext("2d"),q=document.getElementById("c2"),G=q.getContext("2d");q.style.backgroundColor="#000";const H="#000";let L=new Image;L.src="floor4.png";let E,W=I.width=q.width=window.innerWidth,N=window.innerHeight/2,O=I.height=q.height=window.innerHeight,F=!1;const X=100,Y=X/18,j=50,K=300,_=9e4,D=200;let z,Q,U,V=[],Z=[],$=[],tt=~~((W-200)/X),it=~~((O-200)/X),et=[];for(let nt=0;nt<3;nt++)et.push(new e);let rt={i:0,h:0,x:150,y:150,step:3,p:3,q:!1,k:null,l(){this.k=null;let t=1/0;for(let i in st){let e=g(st[i],this);if(st[i].i===this.i&&st[i].h===this.h)return void(this.k=i);let n=T.atan2(st[i].y-this.y,st[i].x-this.x);if(s(n,xt.angle,M/16)){let n=[],r=new h(ut.s-this.x,ut.t-this.y);for(let o of V){let t=d(o,r,this);t&&n.push({m:t,o:o})}n.length?(n.sort((t,i)=>g(t.m,this)-g(i.m,this)),g(n[0].m,this)>e&&e<t&&(this.k=i,t=e)):e<t&&(this.k=i,t=e)}}}},ot=new n(0,tt-1,X+(tt-1)*X+j,150),ht=new n(it-1,0,150,X+(it-1)*X+j),lt=new n(it-1,tt-1,X+(tt-1)*X+j,X+(it-1)*X+j),st=[ot,ht,lt],at=[],ft=[],yt=new Array(tt),ut={x:rt.x,y:rt.y},ct={G:X,H:X,I:X,J:X},xt={update(){for(let t in this)"function"!=typeof this[t]&&(this[t]=null);this.y=ut.y-rt.y,this.x=ut.x-rt.x,this.angle=T.atan2(this.y,this.x),this.angle<R&&this.angle>-R?this.right=!0:this.angle<3*R&&this.angle>R?this.K=!0:this.angle<-R&&this.angle>-3*R?this.L=!0:(this.angle<-3*R||this.angle>3*R)&&(this.left=!0)}},dt=[];for(let wt=0;wt<tt;wt++){ft.push(new o(0,0,wt));let t=[wt];yt[wt]=JSON.parse(JSON.stringify(t))}for(let nt=0;nt<it;nt++){for(let t=0;t<tt;t++){if(ft[t].r=0,ft[t].A){let i=yt[ft[t].B].indexOf(t);yt[ft[t].B].splice(i,1),ft[t].B=-1}ft[t].A=0}for(let t=0;t<tt;t++)if(ft[t].B==-1){ft[t].B=0;for(let i=0;i<tt;i++)i!=t&&ft[i].B===ft[t].B&&(ft[t].B++,i=-1);yt[ft[t].B].push(t)}for(let t=0;t<tt-1;t++)T.round(T.random())?ft[t].r=1:ft[t+1].B!=ft[t].B&&k(ft[t+1].B,ft[t].B,ft);ft[tt-1].r=1;let i=new Array(tt).fill(0);for(let t=0;t<tt;t++)i[ft[t].B]++;for(let t=0;t<tt;t++)T.round(T.random())&&i[ft[t].B]>1&&(ft[t].A=1,i[ft[t].B]--);if(nt===it-1){for(let t=0;t<tt;t++)ft[t].A=1,t+1<tt&&ft[t].B!=ft[t+1].B&&(ft[t].r=0,k(ft[t+1].B,ft[t].B,ft));ft[tt-1].r=1}at.push(JSON.parse(JSON.stringify(ft)))}let gt={key38:!1,key40:!1,key39:!1,key37:!1,key87:!1,key83:!1,key68:!1,key65:!1};document.addEventListener("mousemove",function(t){ut.s=t.pageX,ut.t=t.pageY;let i=new h(t.pageX-rt.x,t.pageY-rt.y),e=p(i);e<22500?(e=T.sqrt(e),ut.x=rt.x+i.x*(150/e),ut.y=rt.y+i.y*(150/e)):(ut.x=t.pageX,ut.y=t.pageY)}),document.addEventListener("keydown",function(t){if(gt["key"+t.keyCode]=!0,118===t.keyCode&&(F=!F),32===t.keyCode){let t=!1;for(let i in et)if(et[i].active&&et[i].i===rt.i&&et[i].h===rt.h){et[i].j(),t=!0;break}if(!t)for(let i in et)if(et[i].g(rt.i,rt.h))break}}),document.addEventListener("mousedown",function(t){rt.q=!0,rt.l()}),document.addEventListener("mouseup",function(t){rt.q=!1}),document.addEventListener("keyup",function(t){gt["key"+t.keyCode]=!1});let pt,bt,kt=50,vt=50,mt=50,Bt=50,Pt=0,St=0,Ct=0,Tt=0,Mt=0,At=0,Rt=0,It=0;for(let Jt=0;Jt<2;Jt++)for(let nt=0;nt<it;nt++)for(let wt=0;wt<tt;wt++)0===nt&&0===Jt&&(pt=X+wt*X,bt=X-vt/2),0===wt&&1===Jt&&(pt=X-mt/2,bt=X+nt*X-Bt/2),1===at[nt][wt].r&&1===Jt&&(pt=X+(wt+1)*X-mt/2,bt=X+nt*X-Bt/2,wt<tt-1&&(Ct=Tt=Mt=At=Rt=It=0,0!==nt&&1!==at[nt-1][wt].r||(Ct=vt),nt===it-1&&(Tt=vt),!Ct&&nt>0&&at[nt-1][wt].A&&(Mt=vt),nt+1<it&&at[nt][wt].A&&(At=vt),!Ct&&nt>0&&at[nt-1][wt+1].A&&(Rt=vt),nt+1<it&&at[nt][wt+1].A&&(It=vt),V.push(new l(new h(pt,bt+Ct+Mt),new h(pt,bt+3*Bt-Tt-At))),V.push(new l(new h(pt+mt,bt+Ct+Rt),new h(pt+mt,bt+3*Bt-Tt-It))),nt>0&&!at[nt-1][wt].r&&V.push(new l(new h(pt,bt),new h(pt+mt,bt))),nt+1<it&&!at[nt+1][wt].r&&V.push(new l(new h(pt,bt+3*Bt),new h(pt+mt,bt+3*Bt))))),1===at[nt][wt].A&&0===Jt&&(pt=X+wt*X,bt=X+(nt+1)*X-vt/2,nt<it-1&&(Pt=St=0,(1===at[nt][wt].r||nt+1<it&&1===at[nt+1][wt].r)&&(Pt=mt/2),(0===wt||1===at[nt][wt-1].r||nt+1<it&&1===at[nt+1][wt-1].r)&&(St=mt/2),V.push(new l(new h(pt+St,bt),new h(pt-Pt+2*kt,bt))),V.push(new l(new h(pt+St,bt+vt),new h(pt-Pt+2*kt,bt+vt))),!Pt&&wt+1<tt&&!at[nt][wt+1].A&&V.push(new l(new h(pt+2*kt,bt),new h(pt+2*kt,bt+vt))),!St&&wt>0&&!at[nt][wt-1].A&&V.push(new l(new h(pt,bt),new h(pt,bt+vt)))));for(let nt=0;nt<V.length;nt++)if(V[nt])for(let wt=0;wt<V.length;wt++)V[wt]&&V[wt].F(V[nt])&&(V[nt].concat(V[wt]),V[wt]=null,wt=-1);V=V.filter(t=>t),L.onload=function(){G.beginPath(),E=J.createPattern(L,"repeat"),G.fillStyle=E,G.fillRect(X,X,tt*X,it*X),G.closePath(),G.shadowColor="#fff",G.shadowBlur=40,G.strokeStyle="#1dfc81",G.fillStyle="#1dfc81",G.lineWidth=6,V.map(t=>{G.beginPath(),G.moveTo(t.a.x,t.a.y),G.lineTo(t.b.x,t.b.y),G.stroke(),G.closePath()}),V.map(t=>{G.beginPath(),G.fillRect(t.a.x-3,t.a.y-4,6,6),G.fillRect(t.b.x-3,t.b.y-4,6,6),G.closePath()}),G.shadowBlur=0};let qt=P(),Gt=qt.v,Ht=0,Lt=2,Et=!0;C(),i.N=t}({},function(){return this}());