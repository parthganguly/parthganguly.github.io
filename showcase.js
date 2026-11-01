(()=>{'use strict';
const root=document.documentElement,panels=[...document.querySelectorAll('.stage')],choices=[...document.querySelectorAll('[data-project]')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
let entrance=null,lastHash=null,scrollTimer=null,viewTransition=null,navigationToken=0;
const namedSurfaces=new Map();
function invalidateNavigation(){navigationToken++;viewTransition?.skipTransition();namedSurfaces.forEach((token,el)=>{el.style.viewTransitionName="";});namedSurfaces.clear();return navigationToken;}
function nameSurface(el,token){el.style.viewTransitionName="project-surface";namedSurfaces.set(el,token);}
function clearSurface(el,token){if(el&&namedSurfaces.get(el)===token){el.style.viewTransitionName="";namedSurfaces.delete(el);}}
const motionAnimations=new Set();
function play(el,frames,options){if(reduce.matches)return null;const a=el.animate(frames,options);motionAnimations.add(a);a.finished.catch(()=>{}).finally(()=>motionAnimations.delete(a));return a;}
function changeView(action,{source=null,target=null,animate=false}={}){
 const token=invalidateNavigation();
 if(!animate||reduce.matches||!document.startViewTransition){action();return;}
 const shared=source&&target&&(source.classList.contains("cover")||source.classList.contains("stage"))&&(target.classList.contains("cover")||target.classList.contains("stage"));
 if(shared)nameSurface(source,token);
 const created=document.startViewTransition(()=>{if(token!==navigationToken)return;clearSurface(source,token);action();if(shared)nameSurface(target,token);});
 viewTransition=created;created.ready.catch(()=>{});created.finished.catch(()=>{}).finally(()=>{clearSurface(source,token);clearSurface(target,token);});
}
if("scrollRestoration" in history)history.scrollRestoration="manual";
choices.forEach((a,i)=>{if(!a.id)a.id='project-link-'+i;});
const ordinary=e=>e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.defaultPrevented;
const currentPanel=()=>panels.find(p=>p.id===location.hash.slice(1));
function remember(){history.replaceState({...history.state,y:scrollY},'',location.href);}
function render({focus=false,animate=false,restore=false}={}){
 if(entrance)entrance.cancel(); lastHash=location.hash; const panel=currentPanel();
 root.classList.toggle('case-open',!!panel);
 panels.forEach(p=>{const active=p===panel;p.classList.toggle('active',active);p.inert=!active;});
 choices.forEach(a=>{if(panel&&a.dataset.project===panel.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
 if(panel){if(focus)panel.focus({preventScroll:true});scrollTo({top:restore?(history.state?.y||0):0,behavior:'instant'});if(animate&&!reduce.matches)entrance=panel.animate([{opacity:.7,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)'});}
 else if(restore){const state=history.state||{};const target=document.getElementById(state.focusId)||document.getElementById(location.hash.slice(1))||document.querySelector('.identity h1');if(target){if(!target.hasAttribute('tabindex')&&!target.matches('a,button'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}scrollTo({top:state.y||0,behavior:'instant'});}
 else {const target=document.getElementById(location.hash.slice(1));if(focus){const destination=location.hash==='#projects'?document.getElementById('cover-insight'):location.hash==='#about'?(target?.querySelector('h2')||target):document.querySelector('.identity h1');if(destination){if(!destination.hasAttribute('tabindex')&&!destination.matches('a,button'))destination.setAttribute('tabindex','-1');destination.focus({preventScroll:true});}}if(target)target.scrollIntoView({behavior:'instant',block:'start'});else scrollTo({top:0,behavior:'instant'});}
}
function open(a,e){
 remember(); const existing=currentPanel();
 const origin=existing?(history.state?.origin||null):{hash:location.hash,y:scrollY,focusId:a.id};
 if(!existing)history.replaceState({kind:'overview',...origin},'',location.href);
 const target=panels.find(p=>p.id===a.dataset.project);changeView(()=>{history.pushState({kind:'case',origin,y:0},'',a.hash);render({focus:true,animate:e.detail!==0&&!document.startViewTransition});},{source:existing||a,target,animate:e.detail!==0});
}
choices.forEach(a=>a.addEventListener('click',e=>{if(!ordinary(e))return;e.preventDefault();open(a,e);}));
document.querySelectorAll('[data-back]').forEach(a=>a.addEventListener('click',e=>{if(!ordinary(e))return;e.preventDefault();remember();const origin=history.state?.origin;const source=currentPanel(),target=document.getElementById(origin?.focusId)||document.getElementById('cover-'+a.dataset.back);changeView(()=>{history.pushState(origin?{kind:'overview',...origin}:{kind:'overview'},'',origin?.hash||'#projects');render({restore:!!origin});if(!origin)target?.focus({preventScroll:true});},{source,target,animate:e.detail!==0});}));
document.querySelectorAll('a[href="#"],a[href="#projects"]:not([data-back]),a[href="#about"]').forEach(a=>a.addEventListener('click',e=>{if(!ordinary(e))return;e.preventDefault();invalidateNavigation();remember();history.pushState({kind:'overview'},'',a.hash||location.pathname);render({focus:true});}));
addEventListener('popstate',()=>{invalidateNavigation();render({restore:true,focus:true});});addEventListener('hashchange',()=>{if(lastHash!==location.hash){invalidateNavigation();render({focus:true});}});
addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(remember,100);},{passive:true});addEventListener('pagehide',remember);
root.classList.add('enhanced');history.replaceState({...history.state,kind:currentPanel()?'case':'overview'},'',location.href);render();
const views=[...document.querySelectorAll('[data-view]')],crops=[...document.querySelectorAll('[data-crop]')];
views.forEach(b=>b.addEventListener('click',e=>{const quiet=reduce.matches||e.detail===0;if(quiet)root.classList.add('no-motion');views.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));crops.forEach(img=>{const on=img.dataset.crop===b.dataset.view;img.classList.toggle('active',on);img.setAttribute('aria-hidden',String(!on));});if(quiet)requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('no-motion')));}));
crops.forEach((img,i)=>img.setAttribute('aria-hidden',String(i!==0)));
reduce.addEventListener('change',()=>{entrance?.cancel();viewTransition?.skipTransition();motionAnimations.forEach(a=>a.cancel());});document.addEventListener('visibilitychange',()=>{if(document.hidden){entrance?.cancel();viewTransition?.skipTransition();motionAnimations.forEach(a=>a.cancel());}});

// Finite, viewport-led choreography. Default markup stays visible without JS.
root.classList.add('motion-ready');root.dataset.motionEngine=document.startViewTransition?'shared-surface':'fallback';
const observed=new WeakSet();
function reveal(el,index=0){if(observed.has(el))return;observed.add(el);if(el===document.activeElement||el.contains?.(document.activeElement))return;if(!reduce.matches){const frames=el.classList.contains('method-image')?[{opacity:.5,clipPath:'inset(8% 0 8% 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}]:[{opacity:.25,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}];play(el,frames,{duration:320,delay:Math.min(index*55,110),easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});}}
if(!currentPanel()&&!reduce.matches){document.querySelectorAll('.identity .role,.identity h1,.identity>p').forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:i*65,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));}
const graphics=new Map();
function graphic(card){if(reduce.matches||card===document.activeElement||card.contains?.(document.activeElement))return;const previous=graphics.get(card)||[];if(previous.some(a=>a&&(a.playState==='running'||a.pending)))return;previous.forEach(a=>a?.cancel());const runs=[];
 if(card.classList.contains('cover-potato')){card.querySelectorAll('.file-lines i').forEach((el,i)=>runs.push(play(el,[{opacity:.25,transform:'scaleX(.25)'},{opacity:1,transform:'scaleX(1)'}],{duration:280,delay:i*60,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})));const source=card.querySelector('.screen b');if(source)runs.push(play(source,[{opacity:0,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,delay:180,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));}
 if(card.classList.contains('cover-chat')){card.querySelectorAll('.chat-turn').forEach((el,i)=>{const end=i?'translateY(12px)':'translateY(0)';runs.push(play(el,[{opacity:.1,transform:'translateY(20px) scale(.95)'},{opacity:1,transform:end}],{duration:280,delay:i*110,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'}));});}
 graphics.set(card,runs);
}
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach((e,i)=>{reveal(e.target,i);if(e.target.classList.contains('cover'))graphic(e.target);io.unobserve(e.target);});},{threshold:.12});document.querySelectorAll('.cover,.method-image').forEach(el=>io.observe(el));}
document.addEventListener('focusin',()=>{motionAnimations.forEach(a=>a.finish());const card=document.activeElement?.closest?.('.cover');if(card)observed.add(card);});
const fine=matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.cover').forEach(card=>{let frame=0,lastTime=0,boundsDirty=false,box=null,current=[0,0,0,1],velocity=[0,0,0,0],target=[0,0,0,1];const image=card.querySelector(':scope>img');
 function reset(){cancelAnimationFrame(frame);frame=0;lastTime=0;box=null;current=[0,0,0,1];velocity=[0,0,0,0];target=[0,0,0,1];card.style.transform='';card.style.willChange='';card.classList.remove('pointer-active');if(image)image.style.transform='';}
 function tick(now){const dt=Math.min(lastTime?now-lastTime:1000/60,50)/(1000/60);lastTime=now;const steps=Math.max(1,Math.ceil(dt*2)),step=dt/steps;for(let n=0;n<steps;n++)for(let i=0;i<4;i++){velocity[i]=(velocity[i]+(target[i]-current[i])*.13*step)*Math.pow(.72,step);current[i]+=velocity[i]*step;}let moving=current.some((v,i)=>Math.abs(target[i]-v)>.002||Math.abs(velocity[i])>.002);card.style.transform=`perspective(900px) rotateX(${current[0]}deg) rotateY(${current[1]}deg) translateY(${current[2]}px) scale(${current[3]})`;if(image)image.style.transform=`scale(${1+Math.abs(current[2])*.005}) translate(${current[1]*1.5}px,${-current[0]*1.5}px)`;frame=moving?requestAnimationFrame(tick):0;if(!moving)lastTime=0;if(!moving&&!box){card.style.willChange='';card.classList.remove('pointer-active');card.style.transform='';if(image)image.style.transform='';}}
 function update(values){target=values;if(!frame)frame=requestAnimationFrame(tick);}
 card.addEventListener('pointerenter',()=>{if(!fine.matches||reduce.matches)return;box=card.getBoundingClientRect();boundsDirty=false;card.style.willChange='transform';card.classList.add('pointer-active');update([0,0,-5,1]);graphic(card);});
 card.addEventListener('pointermove',e=>{if(!box||!fine.matches||reduce.matches)return;if(boundsDirty){box=card.getBoundingClientRect();boundsDirty=false;}const x=Math.max(-.5,Math.min(.5,(e.clientX-box.left)/box.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-box.top)/box.height-.5));update([-y*5,x*5,-5,1]);});
 card.addEventListener('pointerleave',()=>{if(!box)return;box=null;update([0,0,0,1]);});
 card.addEventListener('pointerdown',()=>{if(box&&!reduce.matches)update([target[0],target[1],-2,.985]);});card.addEventListener('pointerup',()=>{if(box&&!reduce.matches)update([target[0],target[1],-5,1]);});
 addEventListener('scroll',()=>{boundsDirty=true;},{passive:true});addEventListener('resize',()=>{boundsDirty=true;});card.addEventListener('pointercancel',reset);card.addEventListener('blur',reset);reduce.addEventListener('change',reset);fine.addEventListener('change',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
});
})();
