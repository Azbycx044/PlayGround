import * as THREE from 'three';
import './style.css';
const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9d8d1'); scene.fog = new THREE.FogExp2('#a9d8d1', .00225);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, .1, 520);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.16;
$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#e7ffef', '#718747', 2.05));
const sun = new THREE.DirectionalLight('#fff2d5', 2.5); sun.position.set(-55, 90, 45); scene.add(sun);
const fill = new THREE.DirectionalLight('#a3d8e8', .7); fill.position.set(65, 35, -90); scene.add(fill);
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(8, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff2bf' })); sunBall.position.set(-95, 98, -125); scene.add(sunBall);
const mat = (color, roughness=.85, extra={}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const mats = {
 bark:mat('#77543d'), barkLight:mat('#9e704c'), leaf1:mat('#589769'),leaf2:mat('#77ae72'),leaf3:mat('#8aba70'),
 flowerPink:mat('#f08ca4'),flowerYellow:mat('#f4d276'),flowerBlue:mat('#9bb5ea'),flowerWhite:mat('#f6edce'),
 stone:mat('#a69a82'), crystal:mat('#83d7dc',.25,{metalness:.15,emissive:'#286a71',emissiveIntensity:.28}),
 playerCloth:mat('#3c7880'),playerCape:mat('#d66e58'),playerSkin:mat('#efc7a0'),playerHair:mat('#574332'),leather:mat('#654a37'),gold:mat('#dfc36e',.42,{metalness:.35}),
 enemy:mat('#856bb0'),enemyDark:mat('#4e425f'),enemySkin:mat('#a5bd76'),enemyEye:mat('#e9b65c',.3,{emissive:'#9e5e25',emissiveIntensity:.4}),
 npcCloth:mat('#bc8a55'),npcCape:mat('#66815a'),white:mat('#fff4df')
};
const groundY=(x,z)=> .42*Math.sin(x*.047)*Math.cos(z*.035)+.32*Math.sin((x+z)*.026)+.18*Math.cos(z*.09);
function terrain(){
 const size=330, seg=140, geo=new THREE.BufferGeometry(), v=[], c=[], idx=[];
 const color=new THREE.Color();
 for(let iz=0;iz<=seg;iz++)for(let ix=0;ix<=seg;ix++){
  const x=(ix/seg-.5)*size,z=(iz/seg-.5)*size,y=groundY(x,z);v.push(x,y,z);
  let h=.48+.055*Math.sin(x*.13+z*.09)+.035*Math.cos(z*.22);
  color.setRGB(.22+h*.27,.42+h*.25,.20+h*.11);c.push(color.r,color.g,color.b);
  if(ix<seg&&iz<seg){const a=iz*(seg+1)+ix,b=a+1,d=a+seg+1,e=d+1;idx.push(a,d,b,b,d,e)}
 }
 geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setIndex(idx);geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));scene.add(mesh);
}
terrain();
const world=new THREE.Group();scene.add(world);
const boxGeo=new THREE.BoxGeometry(1,1,1), sphereGeo=new THREE.SphereGeometry(1,12,10), icoGeo=new THREE.IcosahedronGeometry(1,1);
function addMesh(parent,geo,material,pos,scale,rotY=0){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.scale.set(...scale);m.rotation.y=rotY;parent.add(m);return m;}
function makeRoad(){
  const pts=[[0,69],[3,47],[-4,27],[-7,8],[4,-9],[17,-27],[13,-50],[6,-77]];
  const curve=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z)));
  const steps=120,halfWidth=1.25,positions=[],indices=[];
  for(let i=0;i<=steps;i++){
   const t=i/steps,center=curve.getPointAt(t),tangent=curve.getTangentAt(t),nx=tangent.z,nz=-tangent.x;
   for(const side of [-1,1]){const x=center.x+nx*side*halfWidth,z=center.z+nz*side*halfWidth;positions.push(x,groundY(x,z)+.035,z)}
   if(i<steps){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3)}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();scene.add(new THREE.Mesh(g,mat('#a88d61')));
 }
makeRoad();
function makeTree(x,z,sc=1,hue=0){
 const g=new THREE.Group();g.position.set(x,groundY(x,z),z);g.scale.setScalar(sc);world.add(g);
 addMesh(g,new THREE.CylinderGeometry(.2,.37,3.8,7),mats.bark,[0,1.8,0],[1,1,1],Math.random()*.3);
 const leaves=[mats.leaf1,mats.leaf2,mats.leaf3];
 for(let i=0;i<4;i++){const a=i*1.72;addMesh(g,icoGeo,leaves[(i+Math.floor(hue*3))%3],[Math.sin(a)*.85,3.3+(i%2)*.7,Math.cos(a)*.72],[1.2+(i%2)*.1,1.15,1.2]);}
 addMesh(g,icoGeo,leaves[1],[0,4.35,0],[1.25,1.3,1.25]);
}
function random(seed){let s=seed|0;return()=>{s=(s*1664525+1013904223)|0;return(s>>>0)/4294967296}}
const rand=random(7419);
for(let i=0;i<66;i++){let x=(rand()-.5)*275,z=(rand()-.5)*270;if(Math.abs(x)<20&&z>-34&&z<63)continue;if(Math.hypot(x+45,z+30)<29)continue;makeTree(x,z,.72+rand()*.65,rand())}
// A little settlement tucked into the flower valley.
function cottage(x,z,scale=1){const g=new THREE.Group();g.position.set(x,groundY(x,z),z);g.scale.setScalar(scale);world.add(g);
 addMesh(g,new THREE.BoxGeometry(7,4.3,5.6),mat('#e8d5a5'),[0,2.1,0],[1,1,1]);
 addMesh(g,new THREE.ConeGeometry(5.1,3.1,4),mat('#bd7160'),[0,5.4,0],[1,1,1],Math.PI/4);
 addMesh(g,new THREE.BoxGeometry(1.25,2.5,.15),mat('#77513b'),[0,.95,2.86],[1,1,1]);
 for(const xw of [-2.25,2.25]){addMesh(g,new THREE.BoxGeometry(1.05,1,.13),mat('#8bcbd0'),[xw,2.65,2.88],[1,1,1]);addMesh(g,new THREE.BoxGeometry(1.2,.12,.19),mats.white,[xw,2.65,2.96],[1,1,1])}}
cottage(-11,1,.92);cottage(12,-7,1);cottage(-13,-12,.77);
// Curved pond and tiny islands.
const water=new THREE.Mesh(new THREE.CircleGeometry(18,48),new THREE.MeshStandardMaterial({color:'#69b8c2',roughness:.22,metalness:.12,transparent:true,opacity:.87}));water.rotation.x=-Math.PI/2;water.position.set(-47,groundY(-47,-31)+.16,-31);scene.add(water);
const rim=new THREE.Mesh(new THREE.TorusGeometry(18,.48,6,56),mat('#b8b476'));rim.rotation.x=Math.PI/2;rim.position.copy(water.position);rim.position.y+=.04;scene.add(rim);
for(let i=0;i<13;i++){const a=i*2.4,r=19+rand()*2,x=-47+Math.cos(a)*r,z=-31+Math.sin(a)*r;addMesh(world,icoGeo,mats.stone,[x,groundY(x,z)+.5,z],[.6+rand(),.5+rand()*.4,.65+rand()*.5]);}
// Wildflowers, lanterns and softly glowing harvestables.
const flowers=[];
for(let i=0;i<260;i++){let x=(rand()-.5)*245,z=(rand()-.5)*240;if(Math.abs(x)<20&&z>-34&&z<64)continue;if(Math.hypot(x+47,z+31)<21)continue;
 const fm=[mats.flowerPink,mats.flowerYellow,mats.flowerBlue,mats.flowerWhite][Math.floor(rand()*4)],y=groundY(x,z);
 addMesh(world,new THREE.CylinderGeometry(.025,.035,.28,5),mat('#548a59'),[x,y+.14,z],[1,1,1]);addMesh(world,icoGeo,fm,[x,y+.34,z],[.12,.1,.12]);flowers.push([x,z]);}
for(const [x,z] of [[-8,16],[7,19],[-20,8],[20,-17],[-31,-8],[27,18]]){
 addMesh(world,new THREE.CylinderGeometry(.07,.1,3.8,7),mats.bark,[x,groundY(x,z)+1.9,z],[1,1,1]);
 const lamp=addMesh(world,new THREE.SphereGeometry(.35,12,10),mat('#ffe7a2',.3,{emissive:'#ffbc58',emissiveIntensity:1.2}),[x,groundY(x,z)+3.95,z],[1,1,1]);
}
function makeCrystal(x,z,color='#77e0d4'){
 const group=new THREE.Group();group.position.set(x,groundY(x,z),z);world.add(group);
 for(let i=0;i<3;i++){const crystal=addMesh(group,new THREE.ConeGeometry(.38+rand()*.15,1.3+rand()*.7,5),mat(color,.25,{emissive:color,emissiveIntensity:.42}),[(i-1)*.43,.7,0],[1,1,1],rand()*1.5);crystal.rotation.z=(rand()-.5)*.24;}
 const node={group,x,z,alive:true};resources.push(node);return node;
}
const resources=[];
for(const p of [[-25,35],[-31,18],[27,28],[35,-8],[-59,2],[-68,-24],[42,55],[60,8],[18,-58]])makeCrystal(...p);
// Gentle cloud puffs drifting over the mountain horizon.
const clouds=[];const cloudMat=new THREE.MeshBasicMaterial({color:'#fff8e4',transparent:true,opacity:.66,depthWrite:false});
for(let i=0;i<12;i++){const g=new THREE.Group();g.position.set(-145+rand()*290,40+rand()*32,-145+rand()*70);for(let n=0;n<4;n++)addMesh(g,sphereGeo,cloudMat,[(n-1.5)*3,rand()*1.4,0],[3+rand()*2,1.2+rand(),2,]);scene.add(g);clouds.push(g)}
// Player character, with a bright little cape and an ironbloom blade.
const player=new THREE.Group();scene.add(player);player.position.set(0,groundY(0,53),53);
const avatar=new THREE.Group();player.add(avatar);
addMesh(avatar,new THREE.ConeGeometry(.56,1.15,5),mats.playerCape,[-.28,1.3,.28],[1,1,1],.2);
addMesh(avatar,new THREE.CylinderGeometry(.39,.48,.95,8),mats.playerCloth,[0,1.28,0],[1,1,1]);
addMesh(avatar,sphereGeo,mats.playerSkin,[0,2.1,0],[.34,.4,.32]);addMesh(avatar,sphereGeo,mats.playerHair,[0,2.35,-.04],[.37,.22,.35]);
addMesh(avatar,new THREE.BoxGeometry(.13,.12,.08),mats.gold,[.12,2.06,-.28],[1,1,1]);
for(const side of [-1,1]){
 addMesh(avatar,new THREE.CylinderGeometry(.13,.15,.68,7),mats.playerCloth,[side*.47,1.32,0],[1,1,1],side*.1);
 addMesh(avatar,new THREE.CylinderGeometry(.16,.18,.72,7),mats.leather,[side*.22,.43,0],[1,1,1]);
}
const swordGroup=new THREE.Group();avatar.add(swordGroup);swordGroup.position.set(.56,1.32,-.05);swordGroup.rotation.z=-.42;
addMesh(swordGroup,new THREE.CylinderGeometry(.045,.07,.85,6),mats.white,[0,.48,0],[1,1,1]);addMesh(swordGroup,new THREE.BoxGeometry(.38,.09,.11),mats.gold,[0,.09,0],[1,1,1]);addMesh(swordGroup,new THREE.CylinderGeometry(.07,.07,.3,7),mats.leather,[0,-.12,0],[1,1,1]);
// Elder Rowan waits by the village gate.
function makePerson({x,z,elder=false}){const g=new THREE.Group();g.position.set(x,groundY(x,z),z);scene.add(g);
 addMesh(g,new THREE.CylinderGeometry(.38,.48,1.05,8),elder?mats.npcCloth:mats.playerCloth,[0,1.23,0],[1,1,1]);addMesh(g,sphereGeo,mats.playerSkin,[0,2.05,0],[.33,.38,.32]);
 addMesh(g,sphereGeo,elder?mats.white:mats.playerHair,[0,2.31,0],[.37,.22,.36]);
 if(elder){addMesh(g,new THREE.ConeGeometry(.11,.95,5),mats.gold,[0,3.08,0],[1,1,1]);addMesh(g,new THREE.ConeGeometry(.56,.45,5),mats.npcCape,[0,.42,.12],[1,1,1]);}
 const marker=new THREE.Group();marker.position.y=3.55;g.add(marker);addMesh(marker,icoGeo,mats.gold,[0,0,0],[.22,.22,.22]);
 const person={group:g,x,z,elder,marker};return person;
}
const elder=makePerson({x:0,z:8,elder:true});
const villagers=[makePerson({x:-16,z:9}),makePerson({x:17,z:5}),makePerson({x:10,z:-19})];
function makeGoblin(x,z,index){const g=new THREE.Group();scene.add(g);g.position.set(x,groundY(x,z),z);
 addMesh(g,new THREE.CylinderGeometry(.34,.44,.92,7),mats.enemy,[0,.82,0],[1,1,1]);addMesh(g,sphereGeo,mats.enemySkin,[0,1.52,0],[.38,.35,.34]);
 for(const side of [-1,1]){const ear=addMesh(g,new THREE.ConeGeometry(.15,.55,4),mats.enemySkin,[side*.38,1.65,-.04],[1,1,1]);ear.rotation.z=-side*.7;addMesh(g,sphereGeo,mats.enemyEye,[side*.14,1.55,-.31],[.045,.055,.025]);addMesh(g,new THREE.CylinderGeometry(.12,.14,.53,6),mats.enemy,[side*.46,.82,0],[1,1,1],side*.1);addMesh(g,new THREE.CylinderGeometry(.16,.18,.55,6),mats.enemyDark,[side*.2,.27,0],[1,1,1]);}
 const club=addMesh(g,new THREE.CylinderGeometry(.08,.14,.83,6),mats.barkLight,[.62,.65,0],[1,1,1],.2);club.rotation.z=-.42;
 const hpBg=addMesh(g,new THREE.PlaneGeometry(1.05,.1),mat('#372e43'),[0,2.1,0],[1,1,1]);hpBg.rotation.y=Math.PI;
 const hp=addMesh(g,new THREE.PlaneGeometry(.98,.055),mat('#e67976'),[0,2.1,.008],[1,1,1]);hp.rotation.y=Math.PI;
 const marker=new THREE.Group();marker.position.y=2.55;g.add(marker);addMesh(marker,icoGeo,mat('#edb879',.4,{emissive:'#c37651',emissiveIntensity:.3}),[0,0,0],[.11,.11,.11]);marker.visible=false;
 return {group:g,x,z,index,hp:70,maxHp:70,hpbar:hp,marker,alive:true,attackAt:0,respawnAt:0,phase:Math.random()*6};
}
const enemies=[];for(const p of [[34,10],[45,-4],[29,-18],[57,27],[70,-16],[-68,-57],[-86,4]])enemies.push(makeGoblin(...p,enemies.length));
const playerState={health:100,maxHealth:100,mana:60,maxMana:60,xp:0,level:1,gold:12,potions:2,herbs:0,crystals:0,kills:0,quest:'new',questKills:0,active:true,attackAt:0,dodgeUntil:0,invulnerable:0,stamina:100};
const inventory={Moonpetal:0,Sunstone:0,'Healing tea':2};let muted=true,audioCtx=null,lastToast=0;
function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(lastToast);lastToast=setTimeout(()=>el.classList.remove('show'),2350)}
function tone(freq=440,duration=.11){if(muted)return;try{audioCtx??=new AudioContext();const o=audioCtx.createOscillator(),gain=audioCtx.createGain();o.type='sine';o.frequency.value=freq;gain.gain.setValueAtTime(.035,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(gain);gain.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch{}}
function setQuest(){const title=$('quest-title'),copy=$('quest-copy'),count=$('quest-count'),progress=$('quest-progress');
 if(playerState.quest==='new'){title.textContent='A valley awakens';copy.textContent='Find Elder Rowan in the village.';count.textContent='FOLLOW THE GOLDEN MARKER';progress.style.width='8%'}
 else if(playerState.quest==='active'){title.textContent='Mischief in the Moonpetal Meadow';copy.textContent='Thin out the cheeky meadow goblins.';count.textContent=`GOBLINS DEFEATED  ·  ${Math.min(3,playerState.questKills)} / 3`;progress.style.width=`${Math.min(100,playerState.questKills/3*100)}%`}
 else if(playerState.quest==='return'){title.textContent='A quieter meadow';copy.textContent='Return to Elder Rowan for your reward.';count.textContent='RETURN TO THE VILLAGE';progress.style.width='100%'}
 else{title.textContent='The Verdant Oath';copy.textContent='Bloomvale is a little safer because of you.';count.textContent='QUEST COMPLETE  ·  ✦  120 XP';progress.style.width='100%'}
}
setQuest();
function updateHUD(){const s=playerState;$('health-fill').style.width=`${s.health/s.maxHealth*100}%`;$('health-label').textContent=`${Math.ceil(s.health)} / ${s.maxHealth}`;$('mana-fill').style.width=`${s.mana/s.maxMana*100}%`;$('mana-label').textContent=`${Math.floor(s.mana)} / ${s.maxMana}`;$('level').textContent=String(s.level).padStart(2,'0');$('xp-fill').style.width=`${s.xp/100*100}%`;$('xp-label').textContent=`${s.xp} / 100`;$('potion-count').textContent=s.potions;}
updateHUD();
function gainXP(n){playerState.xp+=n;if(playerState.xp>=100){playerState.xp-=100;playerState.level++;playerState.maxHealth+=12;playerState.maxMana+=8;playerState.health=playerState.maxHealth;playerState.mana=playerState.maxMana;toast(`LEVEL UP  ·  LEVEL ${playerState.level}`);tone(720,.28)}updateHUD()}
const keys=new Set(), touchMove=new Set(), effects=[], projectiles=[];
let modalOpen=false,started=false,worldTime=0,interactTarget=null;
const effectMat=new THREE.MeshBasicMaterial({color:'#fff3ae',transparent:true,opacity:.8});
function burst(x,y,z,color='#ffe6a3',n=9){for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.09+Math.random()*.09,0),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}));m.position.set(x,y,z);scene.add(m);effects.push({mesh:m,v:new THREE.Vector3((Math.random()-.5)*3,1+Math.random()*3,(Math.random()-.5)*3),life:.55+Math.random()*.55})}}
function slash(){const now=performance.now()/1000;if(now<playerState.attackAt||modalOpen||!started)return;playerState.attackAt=now+.48;avatar.rotation.y=.35;setTimeout(()=>{if(avatar)avatar.rotation.y=0},160);tone(220,.08);
 const slashFx=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,5,20,Math.PI*1.1),new THREE.MeshBasicMaterial({color:'#f8e6a8',transparent:true,opacity:.85}));slashFx.position.set(player.position.x,player.position.y+1.25,player.position.z-1);slashFx.rotation.set(Math.PI/2,0,-.8);scene.add(slashFx);effects.push({mesh:slashFx,v:new THREE.Vector3(0,0,0),life:.26,ring:true});
 for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.group.position.x-player.position.x,e.group.position.z-player.position.z);if(d<2.8){e.hp-=35;updateEnemyBar(e);burst(e.group.position.x,e.group.position.y+1,e.group.position.z,'#f3d37d',7);if(e.hp<=0)killEnemy(e)}}}
function updateEnemyBar(e){e.hpbar.scale.x=Math.max(.01,e.hp/e.maxHp);e.hpbar.position.x=-(1-e.hp/e.maxHp)*.49}
function killEnemy(e){e.alive=false;e.group.visible=false;e.respawnAt=worldTime+35;playerState.kills++;playerState.gold+=3;inventory.Sunstone++;gainXP(28);if(playerState.quest==='active'){playerState.questKills++;if(playerState.questKills>=3)playerState.quest='return';setQuest()}toast('Goblin routed  ·  +28 XP  ·  +3 gold');tone(350,.15)}
function castSpell(){if(!started||modalOpen)return;if(playerState.mana<12){toast('Not enough mana');return}playerState.mana-=12;updateHUD();tone(620,.16);
 let target=enemies.filter(e=>e.alive&&Math.hypot(e.group.position.x-player.position.x,e.group.position.z-player.position.z)<23).sort((a,b)=>Math.hypot(a.group.position.x-player.position.x,a.group.position.z-player.position.z)-Math.hypot(b.group.position.x-player.position.x,b.group.position.z-player.position.z))[0];
 const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.27,2),new THREE.MeshBasicMaterial({color:'#a7efff'}));orb.position.set(player.position.x,player.position.y+1.65,player.position.z-.55);scene.add(orb);
 const dest=target?new THREE.Vector3(target.group.position.x,target.group.position.y+1,target.group.position.z):new THREE.Vector3(player.position.x+Math.sin(avatar.rotation.y)*10,player.position.y+1,player.position.z-10);
 projectiles.push({mesh:orb,target,dest,speed:target?25:16});}
function drinkPotion(){if(playerState.potions<=0){toast('No healing tea left');return}if(playerState.health>=playerState.maxHealth){toast('You are already feeling sprightly');return}playerState.potions--;inventory['Healing tea']=playerState.potions;playerState.health=Math.min(playerState.maxHealth,playerState.health+45);updateHUD();toast('Healing tea  ·  restored 45 health');burst(player.position.x,player.position.y+1,player.position.z,'#b4e9a1',12);tone(520,.2)}
function nearestTarget(){let best=null,dBest=4.2;for(const p of [elder,...villagers]){const d=Math.hypot(p.group.position.x-player.position.x,p.group.position.z-player.position.z);if(d<dBest){best={type:'person',data:p,d};dBest=d}}
 for(const r of resources){if(!r.alive)continue;const d=Math.hypot(r.x-player.position.x,r.z-player.position.z);if(d<dBest){best={type:'resource',data:r,d};dBest=d}}
 return best}
function interact(){if(!started||modalOpen)return;const t=nearestTarget();if(!t){toast('Nothing nearby to interact with');return}
 if(t.type==='resource'){const r=t.data;r.alive=false;r.group.visible=false;inventory.Sunstone++;playerState.crystals++;playerState.gold+=2;gainXP(5);toast('Gathered a sunstone  ·  +2 gold');burst(r.x,groundY(r.x,r.z)+1,r.z,'#81e7d2',12);return}
 const p=t.data;if(p.elder){if(playerState.quest==='new'){playerState.quest='active';setQuest();toast('Quest accepted  ·  Mischief in the Moonpetal Meadow');tone(520,.2)}else if(playerState.quest==='return'){playerState.quest='done';playerState.gold+=45;inventory['Healing tea']+=2;playerState.potions+=2;gainXP(120);setQuest();updateHUD();toast('Quest complete  ·  +45 gold  ·  2 healing teas');tone(760,.3)}else if(playerState.quest==='done')toast('The valley is in your debt, Wayfarer.');else toast('The goblins are making a mess of the east meadow.');}}
function setInteraction(){const t=nearestTarget(),box=$('interaction');interactTarget=t;if(!started||modalOpen||!t){box.classList.remove('show');return}box.classList.add('show');$('interaction-label').textContent=t.type==='resource'?'Gather sunstone':t.data.elder?(playerState.quest==='new'?'Speak with Elder Rowan':playerState.quest==='return'?'Claim your reward':'Speak with Elder Rowan'):'Say hello';}
function toggleModal(type){modalOpen=!modalOpen;$('modal-backdrop').classList.toggle('open',modalOpen);$('modal-backdrop').setAttribute('aria-hidden',String(!modalOpen));if(!modalOpen)return;
 $('modal-title').textContent=type==='journal'?'Journal':'Inventory';const content=$('modal-content');
 if(type==='journal'){content.innerHTML=`<div class="journal-entry"><b>${playerState.quest==='new'?'A valley awakens':playerState.quest==='done'?'The Verdant Oath':'Mischief in the Moonpetal Meadow'}</b><small>${playerState.quest==='done'?'COMPLETE':'ACTIVE QUEST'}</small><div>${playerState.quest==='new'?'Elder Rowan has asked to see you at the village gate.':playerState.quest==='active'?`The meadow goblins are unsettling the valley. Defeat three of them. (${playerState.questKills}/3)`:playerState.quest==='return'?'The meadow is safe for now. Return to Elder Rowan in the village.':'Bloomvale is safer, and the Elder has promised the valley will remember your kindness.'}</div></div><div class="journal-entry"><b>Wayfarer’s notes</b><div>Explore the paths and hills. Glowing sunstones can be gathered, goblins leave a little gold, and healing tea restores 45 health.</div></div><div class="journal-entry"><b>Field guide</b><div>Ironbloom blade · close range<br/>Starfire · 12 mana, seeks nearby foes<br/>Dodge · brief invulnerability</div></div>`;}
 else{content.innerHTML=`<div class="inventory-grid"><div class="item-card"><span class="item-emoji">⚔</span><b>Ironbloom blade</b><small>Equipped · 35 damage</small></div><div class="item-card"><span class="item-emoji">✧</span><b>Starfire</b><small>Spell · 12 mana</small></div><div class="item-card"><span class="item-emoji">⚗</span><b>Healing tea × ${playerState.potions}</b><small>Restores 45 health</small></div><div class="item-card"><span class="item-emoji">❋</span><b>Sunstone × ${playerState.crystals+playerState.kills}</b><small>Glowing valley crystal</small></div><div class="item-card"><span class="item-emoji">✿</span><b>Moonpetal × ${inventory.Moonpetal}</b><small>Found in the wilds</small></div><div class="item-card"><span class="item-emoji">◉</span><b>${playerState.gold} gold</b><small>Light in your purse</small></div></div>`;}}
$('inventory-open').onclick=()=>toggleModal('inventory');$('journal-open').onclick=()=>toggleModal('journal');$('modal-close').onclick=()=>{modalOpen=false;$('modal-backdrop').classList.remove('open')};$('modal-backdrop').addEventListener('click',e=>{if(e.target===$('modal-backdrop')){$('modal-backdrop').classList.remove('open');modalOpen=false}});
$('begin-btn').onclick=()=>{started=true;$('intro').classList.add('dismissed');$('mobile-controls').classList.add('active');tone(490,.2)};
$('sound-btn').onclick=()=>{muted=!muted;$('sound-btn').textContent=muted?'♫':'♪';toast(muted?'Sound off':'Sound on');if(!muted)tone(540)};
function onKey(e,down){const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(down)keys.add(k);else keys.delete(k);if(!down)return;
 if(k==='e')interact();if(k==='i')toggleModal('inventory');if(k==='j')toggleModal('journal');if(k==='escape'&&modalOpen){modalOpen=false;$('modal-backdrop').classList.remove('open')}
 if(k==='1')slash();if(k==='2')castSpell();if(k==='3')drinkPotion();if(k==='4')interact();if(k===' '||k==='shift'&&e.repeat===false)dodge();}
window.addEventListener('keydown',e=>onKey(e,true));window.addEventListener('keyup',e=>onKey(e,false));
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0&&started&&!modalOpen)slash()});
function dodge(){if(!started||modalOpen||worldTime<playerState.dodgeUntil)return;playerState.dodgeUntil=worldTime+.85;playerState.invulnerable=worldTime+.62;let dx=(keys.has('d')?1:0)-(keys.has('a')?1:0),dz=(keys.has('s')?1:0)-(keys.has('w')?1:0);if(!dx&&!dz)dz=1;const l=Math.hypot(dx,dz)||1;player.position.x+=dx/l*3.1;player.position.z+=dz/l*3.1;burst(player.position.x,player.position.y+.7,player.position.z,'#c6e5c1',8);}
for(const btn of document.querySelectorAll('[data-move]')){const dir=btn.dataset.move;const press=e=>{e.preventDefault();touchMove.add(dir)};const release=e=>{e.preventDefault();touchMove.delete(dir)};btn.addEventListener('pointerdown',press);btn.addEventListener('pointerup',release);btn.addEventListener('pointerleave',release);btn.addEventListener('pointercancel',release)}
for(const btn of document.querySelectorAll('[data-action]'))btn.addEventListener('pointerdown',e=>{e.preventDefault();const a=btn.dataset.action;if(a==='interact')interact();if(a==='attack')slash();if(a==='spell')castSpell();if(a==='dodge')dodge()});
function damagePlayer(amount){if(worldTime<playerState.invulnerable)return;playerState.health=Math.max(0,playerState.health-amount);playerState.invulnerable=worldTime+.55;updateHUD();$('game').classList.add('hit');setTimeout(()=>$('game').classList.remove('hit'),120);tone(120,.12);if(playerState.health<=0){toast('The meadow has you on the ropes — catching your breath…');playerState.health=playerState.maxHealth;playerState.mana=playerState.maxMana;player.position.set(0,groundY(0,53),53);playerState.gold=Math.max(0,playerState.gold-5);updateHUD()}}
function tickEnemies(dt){for(const e of enemies){if(!e.alive){if(worldTime>e.respawnAt){e.alive=true;e.hp=e.maxHp;e.group.visible=true;e.group.position.set(e.x,groundY(e.x,e.z),e.z);updateEnemyBar(e)}continue}
 const dx=player.position.x-e.group.position.x,dz=player.position.z-e.group.position.z,d=Math.hypot(dx,dz);e.group.position.y=groundY(e.group.position.x,e.group.position.z)+Math.abs(Math.sin(worldTime*3+e.phase))*.07;
 if(d<18){e.group.rotation.y=Math.atan2(-dx,-dz);if(d>1.55){const speed=d<3.2?1.4:2.5;e.group.position.x+=dx/d*speed*dt;e.group.position.z+=dz/d*speed*dt}else if(worldTime>e.attackAt){e.attackAt=worldTime+1.35;damagePlayer(8);burst(player.position.x,player.position.y+1,player.position.z,'#e58e7a',5)}}
 }}
function tickProjectiles(dt){for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i],m=p.mesh;if(p.target&&(!p.target.alive))p.dest.set(p.target.group.position.x,p.target.group.position.y+1,p.target.group.position.z);const delta=p.dest.clone().sub(m.position),dist=delta.length();if(dist<p.speed*dt+.45){if(p.target&&p.target.alive){p.target.hp-=48;updateEnemyBar(p.target);burst(p.target.group.position.x,p.target.group.position.y+1,p.target.group.position.z,'#9be9ff',12);if(p.target.hp<=0)killEnemy(p.target)}else burst(m.position.x,m.position.y,m.position.z,'#9be9ff',5);scene.remove(m);projectiles.splice(i,1);continue}m.position.addScaledVector(delta.normalize(),p.speed*dt);m.rotation.x+=dt*4;m.rotation.y+=dt*5}}
function drawMap(){const c=$('minimap'),ctx=c.getContext('2d'),w=c.width,h=c.height,cx=w/2,cy=h/2,scale=.82;ctx.clearRect(0,0,w,h);ctx.fillStyle='#92bb83';ctx.fillRect(0,0,w,h);
 // Soft terrain patches.
 for(let i=0;i<34;i++){const x=((i*73+19)%w),y=((i*119+41)%h);ctx.fillStyle=i%2?'rgba(75,132,88,.19)':'rgba(197,207,132,.2)';ctx.beginPath();ctx.ellipse(x,y,13+(i%5)*3,8+(i%4)*2,i*.7,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle='#66b7c3';ctx.beginPath();ctx.ellipse(cx+(-47-player.position.x)*scale,cy+(-31-player.position.z)*scale,18*scale,18*scale,.2,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#c9ad7b';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();for(let z=-75;z<=65;z+=2){const x=10*Math.sin(z*.045)+cx+(xOffset(z)-player.position.x)*scale,y=cy+(z-player.position.z)*scale;if(z===-75)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
 function xOffset(z){return z>25?0:z>5?-4:z>-18?(-7+(z+18)*.5):17+4*Math.sin(z*.12)}
 // World icons remain legible as the map follows the player.
 const dot=(x,z,color,r)=>{const px=cx+(x-player.position.x)*scale,py=cy+(z-player.position.z)*scale;if(px<-5||px>w+5||py<-5||py>h+5)return;ctx.fillStyle=color;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill()};
 for(const p of [elder,...villagers])dot(p.x,p.z,p===elder?'#f0c974':'#e7e0c3',p===elder?3.5:2.2);for(const e of enemies)if(e.alive)dot(e.x,e.z,'#d9877d',2.4);for(const r of resources)if(r.alive)dot(r.x,r.z,'#7be0dc',2.4);
 ctx.fillStyle='#f9edbd';ctx.strokeStyle='#445545';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff0c1';ctx.beginPath();ctx.moveTo(cx,cy-11);ctx.lineTo(cx-4,cy-4);ctx.lineTo(cx+4,cy-4);ctx.closePath();ctx.fill();
}
function update(dt){worldTime+=dt;
 for(const cloud of clouds)cloud.position.x+=dt*.32;
 resources.forEach((r,i)=>{if(r.alive){r.group.children.forEach((m,j)=>{if(m.geometry.type==='ConeGeometry')m.rotation.y=worldTime*.35+j});r.group.position.y=groundY(r.x,r.z)+Math.sin(worldTime*1.5+i)*.08}});
 elder.marker.rotation.y=worldTime;elder.marker.position.y=3.55+Math.sin(worldTime*2)*.12;enemies.forEach(e=>{e.marker.visible=e.alive&&playerState.quest==='active';e.marker.rotation.y=worldTime});
 if(started&&!modalOpen){let dx=(keys.has('d')||touchMove.has('right')?1:0)-(keys.has('a')||touchMove.has('left')?1:0),dz=(keys.has('s')||touchMove.has('back')?1:0)-(keys.has('w')||touchMove.has('forward')?1:0);const length=Math.hypot(dx,dz);if(length){dx/=length;dz/=length;const sprint=keys.has('shift')&&playerState.stamina>2,speed=sprint?8.8:5.1;if(sprint)playerState.stamina=Math.max(0,playerState.stamina-dt*25);else playerState.stamina=Math.min(100,playerState.stamina+dt*13);player.position.x+=dx*speed*dt;player.position.z+=dz*speed*dt;avatar.rotation.y=Math.atan2(-dx,-dz)}else playerState.stamina=Math.min(100,playerState.stamina+dt*17);
 player.position.x=THREE.MathUtils.clamp(player.position.x,-151,151);player.position.z=THREE.MathUtils.clamp(player.position.z,-151,151);player.position.y=groundY(player.position.x,player.position.z);playerState.mana=Math.min(playerState.maxMana,playerState.mana+dt*1.5);tickEnemies(dt);setInteraction();}
 else if(!started){player.position.y=groundY(player.position.x,player.position.z)}
 tickProjectiles(dt);
 for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;if(e.life<=0){scene.remove(e.mesh);e.mesh.geometry.dispose();if(e.mesh.material!==effectMat)e.mesh.material.dispose();effects.splice(i,1)}else{e.mesh.position.addScaledVector(e.v,dt);e.v.y-=dt*4;e.mesh.material.opacity=Math.min(1,e.life*1.8);if(e.ring){e.mesh.scale.multiplyScalar(1+dt*1.3)}}}
 const target=new THREE.Vector3(player.position.x,player.position.y+1.2,player.position.z-1.6);const camPos=new THREE.Vector3(player.position.x,player.position.y+7.6,player.position.z+10.5);camera.position.lerp(camPos,.09);camera.lookAt(target);
 const minute=Math.floor(worldTime*1.4)%60,hour=8+Math.floor(worldTime*.023)%12;$('clock').innerHTML=`DAY 01&nbsp; · &nbsp;${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
 drawMap();updateHUD();}
let previous=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.2,(now-previous)/1000);previous=now;update(dt);renderer.render(scene,camera)}
// Opening vista follows the same trail while the welcome panel is up.
camera.position.set(0,10.2,67);camera.lookAt(0,2,43);requestAnimationFrame(frame);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
