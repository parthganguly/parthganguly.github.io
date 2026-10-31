(()=>{'use strict';
const root=document.documentElement,choices=[...document.querySelectorAll('[data-project]')],panels=[...document.querySelectorAll('.stage')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
let active=-1,entry=null,entrance=null,lastCover=null;
function select(id,{animate=false,focus=false}={}){const i=panels.findIndex(p=>p.id===id);if(entry)entry.cancel();active=i;choices.forEach(a=>{const on=a.dataset.project===id;if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});panels.forEach((p,n)=>{p.classList.toggle('active',n===i);p.inert=n!==i});if(i>=0){if(animate&&!reduce.matches)entry=panels[i].animate([{opacity:.65},{opacity:1}],{duration:180,easing:'cubic-bezier(.23,1,.32,1)'});if(focus){panels[i].focus({preventScroll:true});panels[i].scrollIntoView({behavior:'instant',block:'start'});}}}
function fromURL(){const id=location.hash.slice(1);if(panels.some(p=>p.id===id))select(id);else select(null);}
root.classList.add('enhanced');fromURL();
choices.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();lastCover=a;if(location.hash!==a.hash)history.pushState(null,'',a.hash);select(a.dataset.project,{animate:e.detail!==0,focus:true});}));
document.querySelectorAll('[data-back]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const cover=document.getElementById('cover-'+a.dataset.back)||lastCover;history.pushState(null,'','#projects');select(null);if(cover){cover.focus({preventScroll:true});cover.scrollIntoView({behavior:'instant',block:'center'});}}));
addEventListener('hashchange',fromURL);addEventListener('popstate',fromURL);
const views=[...document.querySelectorAll('[data-view]')],crops=[...document.querySelectorAll('[data-crop]')];
views.forEach(b=>b.addEventListener('click',e=>{const quiet=reduce.matches||e.detail===0;if(quiet)root.classList.add('no-motion');views.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));crops.forEach(img=>{const on=img.dataset.crop===b.dataset.view;img.classList.toggle('active',on);img.setAttribute('aria-hidden',String(!on))});if(quiet)requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('no-motion')));}));
crops.forEach((img,i)=>img.setAttribute('aria-hidden',String(i!==0)));
reduce.addEventListener('change',()=>{if(entry)entry.cancel();if(entrance)entrance.cancel()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&entry)entry.cancel()});
if(!reduce.matches)entrance=document.querySelector('h1').animate([{opacity:.6,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.23,1,.32,1)'});
})();