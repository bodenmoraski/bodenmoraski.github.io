(() => {
  const W=960,H=640;
  const ground=document.createElement('canvas');ground.width=W;ground.height=H;
  const g=ground.getContext('2d');g.imageSmoothingEnabled=false;
  const rect = (x,y,w,h,c) => { g.fillStyle = c; g.fillRect(x,y,w,h); };
  const poly = (points,c) => { g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill(); };
  let seed = 721;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed-1)/2147483646; };
  const pixel = (x,y,c,s=2) => rect(Math.round(x),Math.round(y),s,s,c);
  function tree(x,y,s=1) {
    rect(x-14*s,y+21*s,32*s,5*s,'#96ad78');
    rect(x-3*s,y+3*s,6*s,20*s,'#795e43');rect(x+1*s,y+8*s,3*s,15*s,'#a07d50');
    const a=[[-13,-15,26,25],[-19,-7,36,18],[-9,-23,19,30],[-21,0,41,12],[-14,9,27,7]];
    a.forEach(([dx,dy,w,h])=>rect(x+dx*s,y+dy*s,w*s,h*s,'#5e7950'));
    [[-13,-13,20,18],[-16,-5,26,17],[-6,-20,11,26],[-9,4,26,6]].forEach(([dx,dy,w,h])=>rect(x+dx*s,y+dy*s,w*s,h*s,'#78935c'));
    rect(x-8*s,y-14*s,8*s,5*s,'#94a86b');rect(x-14*s,y-3*s,6*s,6*s,'#94a86b');rect(x+6*s,y+9*s,8*s,4*s,'#526e48');
  }
  function bush(x,y) {rect(x-8,y,20,8,'#799057');rect(x-5,y-5,13,14,'#8fa465');rect(x-4,y-3,4,3,'#acb97b');}
  function flowers(x,y,c='#d4a15e') { for(let i=0;i<4;i++){const dx=i*5;rect(x+dx,y+(i%2)*3,2,7,'#758957');pixel(x+dx-1,y+(i%2)*3,c,3);} }
  function windowPane(x,y,w=12,h=17) {rect(x-2,y-2,w+4,h+4,'#bda985');rect(x,y,w,h,'#4c6866');rect(x+2,y+2,w-4,h-4,'#a8bdad');rect(x+w/2-1,y,2,h,'#f1dfb7');rect(x,y+h/2-1,w,2,'#f1dfb7');rect(x-3,y+h+2,w+6,3,'#f0dfbb');}
  function roof(x,y,w,h,c='#a65e45') {poly([[x-9,y+h],[x+7,y],[x+w-7,y],[x+w+9,y+h]],'#694b3c');poly([[x-5,y+h-4],[x+9,y+4],[x+w-9,y+4],[x+w+5,y+h-4]],c);for(let i=10;i<h-3;i+=7){const d=8-i*.25;rect(x+d,y+i,w-d*2,2,'#c17c53');for(let j=10;j<w-6;j+=15)pixel(x+j+(i%2)*3,y+i+3,'#91513f');}rect(x-9,y+h,w+18,5,'#774b39');rect(x-9,y+h-3,w+18,3,'#d49866');}
  function building(x,y,w,h,kind) {
    rect(x+6,y+h-7,w+10,13,'#93a371');
    if(kind==='state') {
      rect(x,y+35,w,h-35,'#c1b99a');rect(x+4,y+37,w-8,h-44,'#e8dfbb');
      poly([[x-8,y+39],[x+w/2,y+7],[x+w+8,y+39]],'#8f684c');poly([[x-3,y+35],[x+w/2,y+13],[x+w+3,y+35]],'#d4b484');rect(x+9,y+36,w-18,6,'#f3e5bd');
      rect(x+w/2-13,y+54,26,h-54,'#655e4a');rect(x+w/2-8,y+59,16,h-59,'#8e7755');
      for(const dx of [13,39,w-47,w-21]){rect(x+dx-3,y+46,15,5,'#c8b48e');rect(x+dx,y+51,9,h-59,'#f3e7c6');rect(x+dx+6,y+51,3,h-59,'#d5c6a2');rect(x+dx-3,y+h-9,15,4,'#c8b48e');}
      rect(x-7,y+h-5,w+14,5,'#c1b697');rect(x-12,y+h,w+24,5,'#e6d6b0');rect(x-17,y+h+5,w+34,5,'#c6bb9b');
      rect(x+w/2-2,y-12,3,27,'#77664d');rect(x+w/2+1,y-11,21,11,'#ae5e4c');rect(x+w/2+1,y-11,7,5,'#5d7072');for(let n=0;n<3;n++)rect(x+w/2+8,y-10+n*4,14,2,'#e6cda0');
    } else {
      rect(x,y+35,w,h-35,kind==='lab'?'#a4aea0':'#bca27b');rect(x+4,y+38,w-8,h-42,kind==='lab'?'#dddac1':'#ead3a0');
      for(let yy=y+44;yy<y+h-3;yy+=9)rect(x+4,yy,w-8,1,kind==='lab'?'#c6c8b1':'#d3b987');
      if(kind==='school'){roof(x,y,w,40,'#a65f49');rect(x+w/2-14,y-13,28,34,'#e6d7ad');roof(x+w/2-14,y-25,28,15,'#8a5948');rect(x+w/2-3,y-34,5,10,'#806d4c');rect(x+w/2-8,y-7,16,16,'#fbebc6');rect(x+w/2-1,y-5,2,7,'#6c654d');rect(x+w/2,y+1,5,2,'#6c654d');}
      else if(kind==='lab'){roof(x,y,w,35,'#687e73');rect(x+15,y-6,7,10,'#556b60');rect(x+20,y-9,34,3,'#a4b6a1');rect(x+38,y-13,3,20,'#5f7368');poly([[x+106,y+12],[x+139,y+12],[x+150,y+27],[x+117,y+27]],'#324e62');for(let xx=0;xx<3;xx++)rect(x+113+xx*10,y+15,2,11,'#7899a0');rect(x+110,y+20,36,1,'#7899a0');}
      else {roof(x,y,w,36,'#9a6d4a');rect(x+w-28,y-16,13,29,'#a37d60');rect(x+w-31,y-18,19,5,'#8a614a');rect(x+8,y+46,w-16,10,'#7e4d39');for(let xx=0;xx<w-16;xx+=13)rect(x+8+xx,y+46,7,10,'#d4a36c');}
      windowPane(x+16,y+54,16,19);windowPane(x+w-32,y+54,16,19);
      if(kind==='lab'){windowPane(x+43,y+54,16,19);windowPane(x+w-59,y+54,16,19);}
      rect(x+w/2-13,y+h-37,26,37,'#a08763');rect(x+w/2-9,y+h-33,18,33,'#5c6c5b');rect(x+w/2-7,y+h-30,14,14,'#a8b9a0');pixel(x+w/2+5,y+h-13,'#e2be6f',2);rect(x+w/2-18,y+h,36,4,'#d5c7a4');
      if(kind==='workshop'){rect(x+45,y+61,28,24,'#6f705b');rect(x+48,y+64,22,17,'#c8bc91');rect(x+50,y+67,14,2,'#7a8c70');rect(x+50,y+72,9,2,'#7a8c70');}
    }
  }
  function bench(x,y){rect(x,y,25,3,'#9e7048');rect(x,y+6,25,4,'#b68a58');rect(x+3,y+10,3,6,'#6b694e');rect(x+20,y+10,3,6,'#6b694e');}
  function lamp(x,y){rect(x-2,y,4,26,'#697157');rect(x-5,y-10,10,11,'#5a6651');rect(x-3,y-8,6,7,'#eadca1');rect(x-7,y-12,14,3,'#56654f');rect(x-4,y+25,8,3,'#56654f');}
  function path(points,width=26){
    g.lineCap='square';g.lineJoin='miter';
    g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle='#9daa75';g.lineWidth=width+8;g.stroke();g.strokeStyle='#dbc99d';g.lineWidth=width;g.stroke();
    for(let i=1;i<points.length;i++){const [a,b]=[points[i-1],points[i]];const n=Math.hypot(a[0]-b[0],a[1]-b[1])/12;for(let j=0;j<n;j++){const t=j/n;pixel(a[0]+(b[0]-a[0])*t-5+rand()*10,a[1]+(b[1]-a[1])*t-5+rand()*10,'#bfaf86',2);}}
  }
  function fence(x,y,w){rect(x,y,w,3,'#ac9667');rect(x,y+9,w,3,'#c1aa77');for(let n=0;n<w;n+=13){rect(x+n,y-4,4,21,'#e5d4a3');rect(x+n,y-6,4,2,'#f5e4b3');}}
  function world(){
    rect(0,0,W,H,'#b8c891');
    for(let i=0;i<6500;i++){pixel(Math.floor(rand()*W),Math.floor(rand()*H),['#aec187','#bdcd98','#a9bd80','#c1cd99'][i%4],i%9===0?3:1);}
    // Dark forest above a stepped ridge.
    rect(0,0,960,37,'#59754d');poly([[0,20],[320,20],[320,31],[520,31],[520,19],[960,19],[960,58],[725,58],[725,46],[420,46],[420,57],[170,57],[170,45],[0,45]],'#79905a');
    for(let i=0;i<30;i++)tree(i*35-8,15+rand()*24,.9+rand()*.4);
    path([[245,225],[245,278],[340,278],[340,310],[535,310],[535,240],[735,240],[735,204]],28);
    path([[420,310],[365,310],[365,490],[475,490],[475,475]],29);
    path([[535,310],[620,310],[620,512],[800,512],[800,492]],28);
    path([[620,512],[640,512],[640,607]],31);
    path([[340,310],[290,310],[290,437],[180,437]],18);
    path([[535,240],[535,140],[482,140],[482,91]],17);
    // Observatory clearing, a curiosity off the main route.
    rect(443,77,78,37,'#a8b880');rect(448,81,68,29,'#c8cda0');rect(478,75,6,23,'#756f51');rect(469,95,25,3,'#756f51');poly([[466,78],[487,64],[495,73],[474,87]],'#617b74');rect(485,64,7,5,'#b3c2a3');
    // School and playing field are offset from the central path.
    fence(141,121,194);building(175,130,140,95,'school');
    rect(64,170,74,94,'#a0b379');rect(69,175,64,84,'#b28764');rect(75,181,52,72,'#d8be8b');rect(79,185,44,64,'#b28764');rect(85,191,32,52,'#9fb57e');rect(100,190,2,54,'#dfcda1');
    // Lab tucked into the woods, with a small garden and solar roof.
    building(660,98,150,106,'lab');fence(641,93,31);fence(810,93,45);
    for(let i=0;i<4;i++){rect(841,143+i*12,48,8,'#9d875f');for(let j=0;j<6;j++)bush(844+j*8,141+i*12);}
    // Statehouse sits below a bend, with its own courtyard.
    rect(383,439,184,37,'#a3a67a');rect(389,444,172,27,'#d9c99f');building(398,360,155,100,'state');
    for(let i=0;i<5;i++)rect(404+i*29,467,25,3,'#e9d8b1');
    // Workshop by the water, not opposite another building.
    building(735,400,130,90,'workshop');for(let i=0;i<3;i++){rect(879+i*11,467,9,14,'#a38553');rect(880+i*11,469,7,2,'#c3a56d');}
    rect(704,440,15,25,'#726d53');rect(706,442,11,10,'#c1bc91');rect(706,456,11,3,'#566b5b');
    // A notebook nook along the west path.
    bench(160,424);bench(198,463);rect(150,467,26,18,'#a68452');rect(155,469,17,12,'#ecdcaf');rect(163,470,1,10,'#b9a278');rect(158,473,3,1,'#968b66');
    // A small pond with stepping stones.
    poly([[67,330],[129,330],[129,340],[154,340],[154,374],[140,374],[140,386],[65,386],[65,371],[49,371],[49,347],[67,347]],'#9bab7b');poly([[71,336],[125,336],[125,346],[147,346],[147,369],[135,369],[135,379],[70,379],[70,366],[56,366],[56,352],[71,352]],'#79a29a');
    for(const [x,y] of [[88,347],[126,359],[76,367]]){rect(x,y,10,3,'#a9b78b');rect(x+2,y-2,5,2,'#c5c99c');}
    // River flows around a stepped bank. Footbridge crosses it.
    const river=[[0,530],[150,530],[150,542],[330,542],[330,558],[510,558],[510,575],[720,575],[720,562],[960,562],[960,640],[0,640]];
    poly(river,'#8da98b');poly(river.map(([x,y])=>[x,y<640?y+7:y]),'#729d99');
    for(let i=0;i<150;i++){const x=Math.floor(rand()*960),y=575+Math.floor(rand()*60);rect(x,y,5+Math.floor(rand()*14),1,i%3===0?'#b0c6ae':'#85ada2');}
    rect(619,559,43,81,'#826b4d');for(let y=561;y<640;y+=7)rect(621,y,39,5,'#b69c6b');rect(616,556,5,84,'#cdb17b');rect(660,556,5,84,'#cdb17b');for(let y=557;y<640;y+=17){rect(614,y,8,8,'#ead09a');rect(659,y,8,8,'#ead09a');}
    // Trees sit in irregular groups; no four identical garden squares.
    const trees=[[25,111,1.3],[59,108,1],[105,86,1.1],[150,90,.9],[337,102,1.2],[362,136,1],[395,93,1.1],[565,77,1],[605,112,1.3],[633,136,.85],[850,85,1],[892,106,1.3],[935,93,1.2],[900,240,1],[937,266,1.2],[800,285,1],[835,317,1.2],[880,302,.85],[941,346,1.1],[700,343,1],[654,369,.85],[697,404,1],[570,394,.8],[577,446,1],[352,383,1],[320,415,.85],[319,477,1],[355,512,1.1],[262,494,.9],[34,292,1],[187,326,.8],[214,370,1],[33,420,1.2],[77,450,1],[110,491,1.2],[28,500,1],[925,500,1.1],[700,537,.9],[563,532,.8],[475,524,.9],[874,541,.8]];
    trees.forEach(([x,y,s])=>tree(x,y,s));
    for(const [x,y] of [[150,223],[324,218],[647,195],[824,214],[373,458],[566,473],[720,486],[873,488],[247,344],[561,275],[307,337],[683,290],[202,471]]){bush(x,y);flowers(x-7,y+11,['#d7a561','#e9d6a3','#c98471'][Math.floor(rand()*3)]);}
    bench(571,213);bench(365,328);lamp(333,285);lamp(600,476);lamp(572,318);lamp(365,438);
    // Direction sign and bicycle.
    rect(361,295,4,26,'#88714b');rect(344,290,36,11,'#e5d09b');rect(348,293,24,2,'#776e4a');rect(351,303,38,10,'#b69c6a');rect(355,306,25,2,'#f0ddb0');
  }
  world();
  function interior(canvas,key){
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
    const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const accent={school:'#617d68',research:'#617b7c',policy:'#9a7859',building:'#9d674a'}[key];
    r(0,0,900,160,'#d6bd8b');r(0,0,900,8,'#68563f');r(0,100,900,60,'#a4865f');r(0,97,900,5,'#76634b');
    for(let y=108;y<160;y+=12){r(0,y,900,1,'#8f7454');for(let x=y%24;x<900;x+=60)r(x,y,1,12,'#8f7454');}
    for(const x of [52,760]){r(x,20,85,62,'#796b50');r(x+5,25,75,52,'#adc5b0');r(x+40,25,4,52,'#eee0b5');r(x+5,49,75,4,'#eee0b5');r(x-5,80,95,5,'#ead8a7');}
    r(250,18,400,65,'#806b4b');r(256,24,388,53,accent);
    if(key==='school'){
      for(let i=0;i<5;i++){r(277+i*55,37,35,2,'#d7dfb2');r(277+i*55,45,25,2,'#d7dfb2');}r(280,62,140,2,'#c9d4a6');
      for(let x=175;x<720;x+=110){r(x,104,65,9,'#7e5b3e');r(x+4,113,5,21,'#6f5740');r(x+56,113,5,21,'#6f5740');}
    }else if(key==='research'){
      for(let x=277;x<630;x+=75){r(x,39,48,26,'#344951');r(x+4,43,40,18,'#8daaa2');for(let i=0;i<3;i++)r(x+8,47+i*4,13+i*5,1,'#cfdec0');}
      r(209,104,450,12,'#d7d1ae');r(216,116,9,23,'#746d59');r(640,116,9,23,'#746d59');
      for(let i=0;i<5;i++){r(297+i*40,85,5,22,'#dfded0');r(290+i*40,100,20,7,'#8fab8a');}
    }else if(key==='policy'){
      r(373,38,155,3,'#d9c494');r(397,47,110,3,'#d9c494');r(420,60,62,3,'#d9c494');
      r(292,102,310,13,'#896247');r(304,115,285,26,'#a67b51');for(let i=0;i<7;i++)r(317+i*38,119,2,18,'#bc925d');
      r(189,19,4,85,'#8e744e');r(193,21,32,50,'#b3745e');r(193,21,12,19,'#5b7270');
    }else{
      for(let x=275;x<630;x+=30){r(x,32,3,34,'#d3c392');r(x-6,38,15,4,'#b1bda1');}
      r(233,104,432,13,'#8e6546');r(242,117,8,24,'#6d563f');r(645,117,8,24,'#6d563f');r(449,77,48,31,'#455d61');r(454,82,38,20,'#adc3a3');
    }
    for(const x of [14,854]){r(x,59,30,42,'#806242');r(x+4,63,22,32,'#b39162');for(let i=0;i<4;i++){r(x+5+i*5,65,4,24,['#9c6150','#728a73','#d0b77f','#8f855d'][i]);}}
    // Small researcher at the back of the room.
    r(694,74,14,15,'#d8b080');r(692,70,18,7,'#6b5140');r(690,90,23,19,'#a26249');r(693,108,7,15,'#4e6056');r(704,108,7,15,'#4e6056');
  }
  function portrait(canvas){const c=canvas.getContext('2d');const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};r(0,0,64,64,'#cfba8d');r(7,48,50,16,'#9f5b43');r(17,20,31,31,'#d8b180');r(14,13,36,15,'#70513e');r(20,10,23,5,'#806047');r(17,20,6,16,'#70513e');r(25,32,3,4,'#433b32');r(40,32,3,4,'#433b32');r(31,44,8,2,'#a87055');r(32,48,5,7,'#c9976c');}
  window.GameArt={ground,interior,portrait};
})();
