(() => {
  'use strict';
  const $=s=>document.querySelector(s), data=window.PORTFOLIO, keys=Object.keys(data);
  const world=$('#world'),viewport=$('#viewport'),room=$('#room'),journal=$('#journal'),help=$('#help'),prop=$('#prop-dialog');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const W=960,H=640,canvas=$('#scene'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
  const doors={school:[245,240],research:[735,220],policy:[475,479],building:[800,510]};
  const solid=[[165,120,160,110],[650,89,170,120],[380,350,190,118],[725,390,150,105],[49,330,105,57]];
  let x=400,y=310,dir='down',step=0,moving=false,scale=1,near='',route='',entry=0,walkPath=[],transitionTimer=null;
  const keyState=new Set(),visited=new Set();
  let riding=false,bikeX=335,bikeY=246,propKind='',selectedStar=0,toastTimer=null,rippleStart=-Infinity,pendingEntry=-1;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motion=!reduced.matches;
  function modalOpen(){return room.open||journal.open||help.open||prop.open;}
  function updateMotion(){$('#motion').textContent=motion?'MOTION ON':'MOTION OFF';$('#motion').setAttribute('aria-pressed',String(!motion));}
  updateMotion();$('#motion').addEventListener('click',()=>{motion=!motion;updateMotion();if(room.open)finishSpeech();});
  reduced.addEventListener('change',e=>{motion=!e.matches;updateMotion();if(!motion)finishSpeech();});
  function dismissWelcome(){$('#welcome').hidden=true;$('#player-marker').hidden=true;}
  $('#dismiss-welcome').addEventListener('click',()=>{dismissWelcome();world.focus({preventScroll:true});});
  function camera(){
    const vw=viewport.clientWidth,vh=viewport.clientHeight,mobile=vw<=650;
    scale=mobile?Math.max(.9,Math.min(1.3,vh/H)):Math.min(vw/W,vh/H);
    const ww=W*scale,hh=H*scale;
    world.style.width=ww+'px';world.style.height=hh+'px';
    const ox=ww<=vw?(vw-ww)/2:Math.max(vw-ww,Math.min(0,vw/2-x*scale));
    const oy=hh<=vh?(vh-hh)/2:Math.max(vh-hh,Math.min(0,vh/2-y*scale));
    world.style.transform=`translate(${Math.round(ox)}px,${Math.round(oy)}px)`;
    $('#player-marker').style.left=x/W*100+'%';$('#player-marker').style.top=(y-34)/H*100+'%';
  }
  new ResizeObserver(camera).observe(viewport);camera();
  function updateJournal(){
    $('#visited-count').textContent=visited.size+'/4';
    $('#journal-progress').textContent=visited.size+' / 4 PLACES EXPLORED';
    $('#journal-places').innerHTML=keys.map((k,i)=>`<a href="#${k}"><span class="place-num">0${i+1}</span><span><strong>${esc(data[k].name)}</strong><small>${esc(data[k].subtitle)}</small></span><span class="visited-mark">${visited.has(k)?'VISITED':'ENTER >'}</span></a>`).join('');
    document.querySelectorAll('.destination').forEach(a=>a.classList.toggle('visited',visited.has(a.dataset.place)));
  }
  updateJournal();
  function openUtility(d){keyState.clear();walkPath=[];d.showModal();}
  $('#journal-button').addEventListener('click',()=>openUtility(journal));$('#close-journal').addEventListener('click',()=>journal.close());
  $('#help-button').addEventListener('click',()=>openUtility(help));$('#close-help').addEventListener('click',()=>help.close());$('#start-exploring').addEventListener('click',()=>{help.close();dismissWelcome();});
  for(const d of [journal,help])d.addEventListener('close',()=>world.focus({preventScroll:true}));
  let tourTimer=null,tourRemaining=0,tourDuration=0,tourLast=0;
  function stopTour(){clearInterval(tourTimer);tourTimer=null;$('#tour-toggle').textContent='▶ GUIDED TOUR';$('#tour-toggle').setAttribute('aria-pressed','false');$('#tour-track').hidden=true;}
  function markerHTML(p){return (p.markers?.length?`<div class="institution-markers">${p.markers.map(m=>`<span>${esc(m)}</span>`).join('')}</div>`:'')+(p.context?`<p class="institution-context">${esc(p.context)}</p>`:'');}
  function proofLinks(p,firstOnly=false){const links=firstOnly?p.links.slice(0,1):p.links;return links.map(([label,url])=>`<a target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(label)}</a>`).join('');}
  function showEntry(n,manual=true){
    const focusWasMenu=$('#project-menu').contains(document.activeElement);
    if(manual)stopTour();
    const c=data[route];if(!c)return;entry=Math.max(-1,Math.min(c.projects.length-1,n));
    $('#project-menu').innerHTML=`<button data-entry="-1" aria-current="${entry===-1}">Room overview</button>`+c.projects.map((p,i)=>`<button data-entry="${i}" aria-current="${i===entry}">${esc(p.title)}</button>`).join('');
    if(entry===-1){
      $('#project-detail').innerHTML=`<p class="entry-kicker">ROOM NOTES / AT A GLANCE</p><h2 class="overview-title">${esc(c.name)}</h2><div class="room-overview">${c.projects.map((p,i)=>`<article class="overview-item"><span class="overview-number">0${i+1}</span><div><button class="overview-heading" data-inspect="${i}">${esc(p.title)}</button><p>${esc(p.hook)}</p>${markerHTML(p)}<div class="overview-links"><button data-inspect="${i}">INSPECT > </button>${proofLinks(p,true)}</div></div></article>`).join('')}</div>`;
      $('#page-count').textContent='ALL 4 ENTRIES';
    }else{
      const p=c.projects[entry];
      $('#project-detail').innerHTML=`<p class="entry-kicker">${esc(c.subtitle)}</p><h2 class="entry-title">${esc(p.title)}</h2><p class="entry-hook">${esc(p.hook)}</p><p class="entry-role">${esc(p.role)}</p><span class="entry-status">${esc(p.status)}</span>${markerHTML(p)}<ul class="actions">${p.actions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>${p.links.length?`<div class="evidence-links">${proofLinks(p)}${p.contextLinks?.length?`<span class="context-evidence-label">BENCHMARK USAGE:</span>${proofLinks({links:p.contextLinks})}`:''}</div>`:''}<button class="back-overview" data-inspect="-1">&lt; ROOM OVERVIEW</button>`;
      $('#page-count').textContent=`ENTRY ${String(entry+1).padStart(2,'0')} / ${String(c.projects.length).padStart(2,'0')}`;
    }
    $('#project-detail').scrollTop=0;
    $('#previous-project').disabled=entry===-1;$('#next-project').disabled=entry===c.projects.length-1;
    const selected=$('#project-menu button[aria-current="true"]');
    const menu=$('#project-menu');
    if(getComputedStyle(menu).display!=='none'){
      menu.scrollLeft=Math.max(0,selected.offsetLeft-menu.offsetLeft-10);
      menu.scrollTop=Math.max(0,selected.offsetTop-menu.offsetTop-10);
    }
    room.scrollTop=0;
    if(focusWasMenu&&manual)selected.focus({preventScroll:true});
  }
  function setTourDuration(){const p=data[route].projects[entry];const words=(p.hook+' '+p.actions.join(' ')).split(/\s+/).length;tourDuration=Math.max(12000,Math.min(22000,2000+words/3.3*1000));tourRemaining=tourDuration;tourLast=Date.now();$('#tour-progress').style.width='0%';}
  function startTour(){
    stopTour();finishSpeech();showEntry(0,false);setTourDuration();$('#tour-toggle').textContent='■ STOP TOUR';$('#tour-toggle').setAttribute('aria-pressed','true');$('#tour-track').hidden=false;
    tourTimer=setInterval(()=>{const now=Date.now();if(!document.hidden)tourRemaining-=now-tourLast;tourLast=now;$('#tour-progress').style.width=Math.min(100,100*(1-tourRemaining/tourDuration))+'%';if(tourRemaining<=0){if(entry>=data[route].projects.length-1){stopTour();showEntry(-1,false);}else{showEntry(entry+1,false);setTourDuration();}}},200);
  }
  $('#tour-toggle').addEventListener('click',()=>tourTimer?stopTour():startTour());
  $('#project-menu').addEventListener('click',e=>{const b=e.target.closest('[data-entry]');if(b)showEntry(Number(b.dataset.entry));});
  $('#project-detail').addEventListener('click',e=>{stopTour();const b=e.target.closest('[data-inspect]');if(b)showEntry(Number(b.dataset.inspect));});
  $('#project-detail').addEventListener('wheel',stopTour,{passive:true});$('#project-detail').addEventListener('touchstart',stopTour,{passive:true});
  $('#project-detail').addEventListener('keydown',stopTour);
  $('#previous-project').addEventListener('click',()=>showEntry(entry-1));$('#next-project').addEventListener('click',()=>showEntry(entry+1));
  function finishSpeech(){if(data[route])$('#speech').textContent=data[route].speech;}
  function renderRoute(){
    const k=location.hash.slice(1);
    if(!data[k]){stopTour();route='';if(room.open)room.close();document.title='Boden’s World';return;}
    dismissWelcome();keyState.clear();walkPath=[];route=k;[x,y]=doors[k];camera();
    if(journal.open)journal.close();if(help.open)help.close();if(prop.open)prop.close();
    visited.add(k);updateJournal();$('#room-title').textContent=data[k].name.toUpperCase();
    window.GameArt.interior($('#interior'),k);window.GameArt.portrait($('#portrait'));
    if(!room.open)room.showModal();
    showEntry(pendingEntry);pendingEntry=-1;finishSpeech();$('#leave-room').focus({preventScroll:true});document.title=data[k].name+' — Boden’s World';
  }
  function enter(k,detail=-1){if(!data[k])return;pendingEntry=detail;dismissWelcome();keyState.clear();walkPath=[];[x,y]=doors[k];camera();clearTimeout(transitionTimer);const t=$('#transition');t.classList.remove('active');void t.offsetWidth;if(motion)t.classList.add('active');transitionTimer=setTimeout(()=>{if(location.hash==='#'+k)renderRoute();else location.hash=k;t.classList.remove('active');},motion?190:0);}
  function leave(){stopTour();history.replaceState(null,'',location.pathname+location.search);route='';room.close();document.title='Boden’s World';}
  $('#leave-room').addEventListener('click',leave);room.addEventListener('cancel',e=>{e.preventDefault();leave();});room.addEventListener('close',()=>world.focus({preventScroll:true}));
  room.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&e.target.tagName!=='A'){e.preventDefault();showEntry(entry+1);}if(e.key==='ArrowLeft'&&e.target.tagName!=='A'){e.preventDefault();showEntry(entry-1);}});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&data[a.hash.slice(1)]){e.preventDefault();enter(a.hash.slice(1));}});
  window.addEventListener('hashchange',renderRoute);
  function canMove(nx,ny){
    if(nx<17||nx>W-17||ny<64||ny>H-10)return false;
    if(solid.some(([sx,sy,sw,sh])=>nx>sx-5&&nx<sx+sw+5&&ny>sy-2&&ny<sy+sh+4))return false;
    if(nx>615&&nx<665)return true;
    const bank=nx<150?530:nx<330?542:nx<510?558:nx<720?575:562;
    return ny<bank-3;
  }
  // Grid search keeps point-and-click walking out of buildings and water.
  function findPath(tx,ty){
    const size=16,cols=W/size,rows=H/size,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const sx=clamp(Math.round(x/size),1,cols-2),sy=clamp(Math.round(y/size),4,rows-2),gx=clamp(Math.round(tx/size),1,cols-2),gy=clamp(Math.round(ty/size),4,rows-2);
    if(!canMove(gx*size,gy*size))return;
    const start=sy*cols+sx,goal=gy*cols+gx,queue=[start],came=new Map([[start,-1]]);let head=0;
    while(head<queue.length){const cur=queue[head++];if(cur===goal)break;const cx=cur%cols,cy=Math.floor(cur/cols);for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){const nx=cx+dx,ny=cy+dy,ni=ny*cols+nx;if(nx<1||nx>=cols-1||ny<4||ny>=rows-1||came.has(ni)||!canMove(nx*size,ny*size))continue;came.set(ni,cur);queue.push(ni);}}
    if(!came.has(goal))return;let cur=goal;const path=[];while(cur!==start){path.push([cur%cols*size,Math.floor(cur/cols)*size]);cur=came.get(cur);}walkPath=path.reverse();dismissWelcome();
  }
  world.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;world.focus({preventScroll:true});const r=world.getBoundingClientRect();findPath((e.clientX-r.left)/scale,(e.clientY-r.top)/scale);});
  const movementKeys=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'];
  window.addEventListener('keydown',e=>{if(modalOpen())return;const k=e.key.toLowerCase();if(movementKeys.includes(k)){e.preventDefault();keyState.add(k);walkPath=[];dismissWelcome();}if((k==='enter'||k===' ')&&near&&e.target===world){e.preventDefault();if(near.startsWith('prop:'))interactProp(near.slice(5));else enter(near);}if(k==='b'&&(riding||Math.hypot(x-bikeX,y-bikeY)<55)){e.preventDefault();toggleBike();}if(k==='j'){e.preventDefault();openUtility(journal);}});
  window.addEventListener('keyup',e=>keyState.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keyState.clear());document.addEventListener('visibilitychange',()=>{keyState.clear();tourLast=Date.now();});
  document.querySelectorAll('[data-dir]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keyState.add(b.dataset.dir);walkPath=[];dismissWelcome();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keyState.delete(b.dataset.dir));});
  function avatar(){
    const px=Math.round(x),py=Math.round(y),r=(dx,dy,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(px+dx,py+dy,w,h);};
    r(-8,0,17,4,'#8a9f70');const swing=moving&&motion?Math.round(Math.sin(step)*2):0;
    r(-5,-7,4,8+swing,'#43554d');r(2,-7,4,8-swing,'#43554d');r(-6,-17,13,12,'#a65d46');r(-8,-15,3,9,'#d8b080');r(7,-15,3,9,'#d8b080');r(-5,-27,11,12,'#dfb98a');r(-6,-29,13,7,'#654d3e');r(-4,-31,9,3,'#806048');
    if(dir==='up')r(-6,-25,13,8,'#654d3e');else if(dir==='down'){r(-3,-21,2,2,'#3e382f');r(3,-21,2,2,'#3e382f');}else r(dir==='left'?-5:5,-21,1,2,'#3e382f');
  }
  const stars=[
    {x:124,y:80,label:'BEHAVIOR',question:'What changes when an AI’s choices have real consequences?',note:'The question behind my independent character evaluations.',entry:0},
    {x:270,y:54,label:'MEASUREMENT',question:'Is the agent failing—or is the test broken?',note:'The question behind my Terminal-Bench research.',entry:1},
    {x:367,y:155,label:'PEOPLE',question:'When do people start treating software like a person?',note:'The question behind my AI companion research.',entry:2}
  ];
  function toast(text){clearTimeout(toastTimer);$('#game-toast').textContent=text;$('#game-toast').hidden=false;toastTimer=setTimeout(()=>$('#game-toast').hidden=true,3000);}
  function toggleBike(){
    dismissWelcome();keyState.clear();walkPath=[];
    riding=!riding;
    if(riding){x=bikeX;y=bikeY+13;toast('BICYCLE EQUIPPED / A LITTLE FASTER NOW.');}
    else{bikeX=Math.round(x);bikeY=Math.round(y-13);const b=$('#bicycle-prop');b.style.setProperty('--x',bikeX/W*100);b.style.setProperty('--y',bikeY/H*100);toast('BICYCLE PARKED.');}
    $('#bicycle-prop').hidden=riding;$('#park-bike').hidden=!riding;camera();world.focus({preventScroll:true});
  }
  $('#park-bike').addEventListener('click',toggleBike);
  function drawBicycle(bx,by){
    ctx.save();ctx.lineWidth=2;ctx.strokeStyle='#526d63';
    ctx.beginPath();ctx.arc(Math.round(bx-10),Math.round(by+1),6,0,Math.PI*2);ctx.moveTo(bx+16,by+1);ctx.arc(Math.round(bx+10),Math.round(by+1),6,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#a36345';ctx.beginPath();ctx.moveTo(bx-10,by+1);ctx.lineTo(bx-2,by-10);ctx.lineTo(bx+5,by+1);ctx.closePath();ctx.moveTo(bx-2,by-10);ctx.lineTo(bx+7,by-10);ctx.lineTo(bx+10,by+1);ctx.stroke();
    ctx.fillStyle='#5b6050';ctx.fillRect(bx-5,by-13,8,2);ctx.fillRect(bx+6,by-14,7,2);ctx.restore();
  }
  function drawRipples(t){
    const elapsed=t-rippleStart;if(elapsed>1500||elapsed<0)return;
    ctx.save();ctx.strokeStyle='#c5d2b6';ctx.lineWidth=1;
    for(let i=0;i<3;i++){const r=motion?Math.max(0,(elapsed-i*150)/65):5+i*4;if(r>0&&r<24){ctx.beginPath();ctx.ellipse(101,357,r,r/2,0,0,Math.PI*2);ctx.stroke();}}
    ctx.restore();
  }
  function drawSky(){
    const c=$('#starfield').getContext('2d');c.fillStyle='#222b45';c.fillRect(0,0,500,240);
    let n=410;for(let i=0;i<100;i++){n=n*16807%2147483647;const sx=n%500;n=n*16807%2147483647;const sy=n%240;c.fillStyle=i%4===0?'#939ab4':'#515f80';c.fillRect(sx,sy,i%9===0?2:1,i%9===0?2:1);}
    c.fillStyle='#eadca6';for(const [dx,dy,w,h]of [[0,4,17,10],[4,0,10,18],[-3,7,23,5]])c.fillRect(420+dx,27+dy,w,h);c.fillStyle='#222b45';c.fillRect(425,24,14,13);
    c.strokeStyle='#586985';c.lineWidth=1;c.setLineDash([2,5]);c.beginPath();stars.forEach((s,i)=>i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y));c.stroke();c.setLineDash([]);
    stars.forEach((s,i)=>{c.fillStyle=i===selectedStar?'#f4dda3':'#b2c4cf';c.fillRect(s.x-2,s.y-7,4,14);c.fillRect(s.x-7,s.y-2,14,4);if(i===selectedStar){c.fillStyle='#fff3c9';c.fillRect(s.x-1,s.y-1,2,2);}});
  }
  function selectStar(i){selectedStar=i;drawSky();const s=stars[i];$('#star-question').textContent=s.question;$('#star-note').textContent=s.note;$('#star-project').dataset.propProject='research:'+s.entry;document.querySelectorAll('[data-star]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.star)===i)));}
  function interactProp(kind){
    if(kind==='bicycle'){toggleBike();return;}
    dismissWelcome();keyState.clear();walkPath=[];
    if(kind==='pond'){rippleStart=performance.now();toast('ONE STONE. THREE SKIPS.');return;}
    propKind=kind;$('#prop-dialog').classList.toggle('sky-dialog',kind==='telescope');
    if(kind==='telescope'){
      $('#prop-title').textContent='A FEW QUESTIONS IN ORBIT';
      $('#prop-content').innerHTML=`<p class="discovery-hint">Pick a star.</p><div class="sky-lens"><canvas id="starfield" width="500" height="240" aria-hidden="true"></canvas>${stars.map((s,i)=>`<button class="focus-star" style="left:${s.x/5}%;top:${s.y/2.4}%" data-star="${i}" aria-pressed="false" aria-label="Explore ${s.label.toLowerCase()}"><span>${s.label}</span></button>`).join('')}</div><div class="star-story"><h3 id="star-question"></h3><p id="star-note"></p><button id="star-project" class="pixel-button" data-prop-project="research:0">FOLLOW THE QUESTION ></button></div>`;
      prop.showModal();selectStar(0);
    }else{
      $('#prop-title').textContent='FIELD NOTES';
      $('#prop-content').innerHTML='<div class="notebook-page"><span class="entry-kicker">FROM THE OPEN NOTEBOOK</span><h3>Things I’m trying to understand.</h3><p>AI, moral philosophy, technological progress—and the occasional argument that changes my mind.</p><p>I once started researching an essay against patriotism. I ended up writing in favor of it.</p><div class="evidence-links"><a href="https://bodenmoraski.substack.com/" target="_blank" rel="noopener noreferrer">READ MY WRITING</a><button class="pixel-button" data-prop-project="building:3">WORKSHOP NOTES ></button></div></div>';
      prop.showModal();
    }
    $('#close-prop').focus({preventScroll:true});
  }
  $('#close-prop').addEventListener('click',()=>prop.close());prop.addEventListener('close',()=>world.focus({preventScroll:true}));
  $('#prop-content').addEventListener('click',e=>{const star=e.target.closest('[data-star]');if(star)selectStar(Number(star.dataset.star));const project=e.target.closest('[data-prop-project]');if(project){const [k,i]=project.dataset.propProject.split(':');prop.close();enter(k,Number(i));}});
  document.querySelectorAll('[data-prop]').forEach(b=>b.addEventListener('click',()=>interactProp(b.dataset.prop)));

  function nearby(){
    let best='',d=Infinity;
    for(const [k,[dx,dy]]of Object.entries(doors)){const n=Math.hypot(dx-x,dy-y);if(n<d){d=n;best=k;}}
    if(d>70)best='';
    const props={telescope:[482,98],notebook:[163,475],pond:[100,357],...(!riding?{bicycle:[bikeX,bikeY]}:{})};
    for(const [k,[px,py]]of Object.entries(props)){const n=Math.hypot(px-x,py-y);if(n<46&&n<d){d=n;best='prop:'+k;}}
    if(best!==near){near=best;const labels={telescope:'LOOK THROUGH TELESCOPE',notebook:'READ FIELD NOTES',pond:'SKIP A STONE',bicycle:'RIDE BICYCLE'};$('#interaction-hint').textContent=near?(near.startsWith('prop:')?'ENTER / '+labels[near.slice(5)]:'ENTER / '+data[near].name.toUpperCase()):'CLICK A BUILDING OR AN OBJECT';document.querySelectorAll('.destination').forEach(a=>a.classList.toggle('near',a.dataset.place===near));document.querySelectorAll('.prop-button').forEach(b=>b.classList.toggle('near',near==='prop:'+b.dataset.prop));}
  }
  let last=0;
  function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;moving=false;
    if(!modalOpen()){
      let dx=0,dy=0;if(keyState.has('arrowleft')||keyState.has('a'))dx--;if(keyState.has('arrowright')||keyState.has('d'))dx++;if(keyState.has('arrowup')||keyState.has('w'))dy--;if(keyState.has('arrowdown')||keyState.has('s'))dy++;
      let followingPath=false;
      if(!dx&&!dy){
        while(walkPath.length&&Math.hypot(walkPath[0][0]-x,walkPath[0][1]-y)<.1)walkPath.shift();
        if(walkPath.length){const [tx,ty]=walkPath[0];dx=tx-x;dy=ty-y;followingPath=true;}
      }
      if(dx||dy){
        const length=Math.hypot(dx,dy),speed=(followingPath?180:210)*(riding?1.5:1);
        // Keyboard vectors express direction; only path vectors express a distance to cap.
        const v=followingPath?Math.min(speed*dt,length):speed*dt;
        const nx=x+dx/length*v,ny=y+dy/length*v;
        if(canMove(nx,y))x=nx;if(canMove(x,ny))y=ny;
        moving=true;step+=dt*12;dir=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
      }
    }
    ctx.drawImage(window.GameArt.ground,0,0);drawBicycle(riding?x:bikeX,riding?y:bikeY);avatar();drawRipples(t);
    if(motion){const b=Math.round(Math.sin(t/1300)*2);ctx.fillStyle='#dfc081';ctx.fillRect(739,600+b,10,4);ctx.fillStyle='#687c57';ctx.fillRect(745,596+b,4,4);ctx.fillStyle='#d09a54';ctx.fillRect(749,598+b,2,2);}
    nearby();camera();requestAnimationFrame(frame);
  }
  renderRoute();if(!room.open)world.focus({preventScroll:true});requestAnimationFrame(frame);
})();
