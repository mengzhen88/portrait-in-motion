/* Native reading layout; only diagram artwork uses an intrinsic coordinate system. */
(()=>{
 'use strict';
 const nav=document.querySelector('.detail-nav');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stage=document.querySelector('.compare-stage'),range=stage.querySelector('input');
 range.addEventListener('input',()=>stage.style.setProperty('--split',range.value+'%'));
 stage.addEventListener('pointermove',event=>{const r=stage.getBoundingClientRect(),x=r.left+r.width*Number(range.value)/100,y=r.top+r.height/2;stage.classList.toggle('handle-hover',Math.hypot(event.clientX-x,event.clientY-y)<=24);});
 stage.addEventListener('pointerleave',()=>stage.classList.remove('handle-hover'));
 const gallery=document.getElementById('feedback-gallery');
 gallery.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight')target=gallery.scrollLeft+338;else if(event.key==='ArrowLeft')target=gallery.scrollLeft-338;else if(event.key==='Home')target=0;else if(event.key==='End')target=gallery.scrollWidth;else return;event.preventDefault();gallery.scrollTo({left:target,behavior:reduced.matches?'instant':'smooth'});});
 gallery.addEventListener('wheel',event=>{if(!event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;const max=gallery.scrollWidth-gallery.clientWidth,target=Math.max(0,Math.min(max,gallery.scrollLeft+event.deltaY));if(target!==gallery.scrollLeft){event.preventDefault();gallery.scrollLeft=target;}},{passive:false});
 const galleryBar=document.createElement('input');galleryBar.type='range';galleryBar.min='0';galleryBar.max='1000';galleryBar.value='0';galleryBar.className='gallery-scrollbar';galleryBar.setAttribute('aria-label','拖动横向查看完整截图');galleryBar.setAttribute('aria-controls','feedback-gallery');gallery.parentElement.append(galleryBar);
 galleryBar.addEventListener('input',()=>{gallery.scrollLeft=Number(galleryBar.value)/1000*(gallery.scrollWidth-gallery.clientWidth);});gallery.addEventListener('scroll',()=>{const max=gallery.scrollWidth-gallery.clientWidth;galleryBar.value=max>0?String(Math.round(gallery.scrollLeft/max*1000)):'0';},{passive:true});
 const artwork=[...document.querySelectorAll('.intrinsic-art')];
 const scaleArtwork=()=>artwork.forEach(art=>art.style.setProperty('--art-scale',art.parentElement.clientWidth/1080));
 const creation=document.getElementById('presentation-01'),track=creation.querySelector('.creation-track'),sticky=creation.querySelector('.creation-sticky');
 const comparison=document.getElementById('creation-comparison'),tabs=[...creation.querySelectorAll('.creation-tab')],panels=[...creation.querySelectorAll('.creation-pair')];
 let creationIndex=0,creationStep=600,creationPinned=false,frame=0;
 const clearTurns=()=>{document.querySelectorAll('.creation-turning-page,.creation-window-return').forEach(el=>el.remove());panels.forEach(el=>el.style.visibility='');};
 function selectCreation(index,focus=false,animate=true){
  index=Math.max(0,Math.min(panels.length-1,index));if(index===creationIndex){if(focus)tabs[index].focus({preventScroll:true});return;}
  const previous=creationIndex;clearTurns();const outgoing=panels[previous].cloneNode(true);outgoing.removeAttribute('id');outgoing.inert=true;outgoing.setAttribute('aria-hidden','true');outgoing.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));outgoing.classList.add('creation-turning-page');
  creationIndex=index;comparison.dataset.page=String(index);tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
  if(animate&&!reduced.matches){
   if(index>previous){
    comparison.append(outgoing);panels[index].animate([{transform:'translateY(-20px) scale(.96)'},{transform:'translateY(0) scale(1)'}],{duration:720,easing:'cubic-bezier(.22,1,.36,1)'});
    const a=outgoing.animate([{transform:'translateX(0) rotate(0)',opacity:1},{transform:'translateX(125%) translateY(-34px) rotate(9deg)',opacity:0}],{duration:720,easing:'cubic-bezier(.45,0,.15,1)',fill:'forwards'});a.finished.then(()=>outgoing.remove()).catch(()=>outgoing.remove());
   }else{
    const incoming=panels[index],rect=incoming.getBoundingClientRect(),overlay=document.createElement('div');overlay.className='creation-window-return';overlay.inert=true;overlay.setAttribute('aria-hidden','true');Object.assign(overlay.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px'});const clone=incoming.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));overlay.append(clone);document.body.append(overlay);incoming.style.visibility='hidden';
    const a=overlay.animate([{transform:`translateX(${innerWidth-rect.left+40}px) translateY(-34px) rotate(9deg)`},{transform:'translateX(-6px) translateY(2px) rotate(-.6deg)',offset:.76},{transform:'translateX(0) translateY(0) rotate(0)'}],{duration:900,easing:'cubic-bezier(.22,1,.36,1)'});const finish=()=>{overlay.remove();incoming.style.visibility='';};a.finished.then(finish).catch(finish);
   }
  }
  if(focus)tabs[index].focus({preventScroll:true});
 }
 function creationTop(index){return scrollY+track.getBoundingClientRect().top-parseFloat(getComputedStyle(sticky).top)+index*creationStep;}
 function navigateCreation(index,focus=false){selectCreation(index,focus);if(creationPinned)scrollTo({top:creationTop(index),behavior:'instant'});}
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>navigateCreation(index));tab.addEventListener('keydown',event=>{let next;if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();navigateCreation(next,true);});});
 const chapters=[...document.querySelectorAll('.ppt-chapter')].map(section=>({section,track:section.querySelector('.ppt-track'),sticky:section.querySelector('.ppt-sticky'),header:section.querySelector('.chapter-header'),deck:section.querySelector('.ppt-deck'),slides:[...section.querySelectorAll('.ppt-slide')],dots:[...section.querySelectorAll('.chapter-dots button')],subtitles:section.dataset.subtitles.split('|'),index:0,pinned:false,starts:[],overflows:[]}));
 function selectChapter(chapter,index,animate=false){
  if(index===chapter.index)return;
  chapter.index=index;chapter.section.querySelector('.chapter-subtitle').textContent=chapter.subtitles[index];
  chapter.slides.forEach((slide,i)=>{slide.hidden=i!==index;});chapter.dots.forEach((dot,i)=>{dot.setAttribute('aria-selected',String(i===index));dot.tabIndex=i===index?0:-1;});
  if(animate&&!reduced.matches)chapter.slides[index].animate([{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:350,easing:'ease-out'});
 }
 chapters.forEach(chapter=>chapter.dots.forEach((dot,index)=>{dot.addEventListener('click',()=>{selectChapter(chapter,index,true);if(chapter.pinned){const top=scrollY+chapter.track.getBoundingClientRect().top-parseFloat(getComputedStyle(chapter.sticky).top)+chapter.starts[index];scrollTo({top,behavior:'instant'});}else chapter.deck.style.height='';});dot.addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?chapter.dots.length-1:(index+(event.key==='ArrowRight'?1:chapter.dots.length-1))%chapter.dots.length;chapter.dots[next].click();chapter.dots[next].focus({preventScroll:true});});}));
 function layout(){
  document.documentElement.style.setProperty('--nav-height',nav.getBoundingClientRect().height+'px');scaleArtwork();clearTurns();
  creationPinned=innerWidth>=1000&&innerHeight>=650;creation.classList.toggle('is-pinned',creationPinned);creationStep=Math.max(400,innerHeight*.8);track.style.height=creationPinned?(sticky.offsetHeight+creationStep*3)+'px':'';
  chapters.forEach(chapter=>{
   chapter.pinned=innerWidth>=760&&innerHeight>=600;chapter.section.classList.toggle('is-pinned',chapter.pinned);chapter.deck.style.height='';chapter.track.style.height='';chapter.slides.forEach(slide=>{slide.hidden=false;slide.style.transform='';});
   if(chapter.pinned){
    const titleHeight=chapter.header.getBoundingClientRect().height;const heights=chapter.slides.map(slide=>slide.scrollHeight);const available=Math.max(260,innerHeight-nav.offsetHeight-24-titleHeight-32-32);const deckHeight=Math.min(Math.max(...heights),available);chapter.deck.style.height=deckHeight+'px';
    chapter.overflows=heights.map(height=>Math.max(0,height-deckHeight));let elapsed=0;chapter.starts=chapter.overflows.map(overflow=>{const start=elapsed;elapsed+=overflow+Math.max(440,innerHeight*.65);return start;});chapter.track.style.height=(chapter.sticky.offsetHeight+elapsed)+'px';
   }
   chapter.slides.forEach((slide,i)=>slide.hidden=i!==chapter.index);
  });
  syncScroll();
 }
 function syncScroll(){
  frame=0;
  if(creationPinned){const passed=parseFloat(getComputedStyle(sticky).top)-track.getBoundingClientRect().top;selectCreation(Math.max(0,Math.min(2,Math.floor(passed/creationStep+.15))));}
  chapters.forEach(chapter=>{if(!chapter.pinned)return;const passed=parseFloat(getComputedStyle(chapter.sticky).top)-chapter.track.getBoundingClientRect().top;let index=0;chapter.starts.forEach((start,i)=>{if(passed>=start-1)index=i;});selectChapter(chapter,index);const shift=Math.max(0,Math.min(chapter.overflows[index],passed-chapter.starts[index]));chapter.slides[index].style.transform=`translateY(${-shift}px)`;});
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(syncScroll);},{passive:true});let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(layout,100);});
 document.querySelectorAll('img').forEach(image=>image.addEventListener('load',()=>{clearTimeout(resize);resize=setTimeout(layout,50);},{once:true}));
 function alignFragment(){
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!target)return;
  const panel=target.closest('.creation-pair');if(panel)selectCreation(panels.indexOf(panel),false,false);
  const chapter=chapters.find(chapter=>chapter.section.contains(target));if(chapter){const slide=target.closest('.ppt-slide');if(slide)selectChapter(chapter,chapter.slides.indexOf(slide));}
  const chapterTarget=chapter&&target===chapter.section?chapter.track:target;
  const top=scrollY+chapterTarget.getBoundingClientRect().top-nav.offsetHeight-24;scrollTo({top,behavior:'instant'});
 }
 document.fonts.ready.then(()=>{layout();requestAnimationFrame(alignFragment);});addEventListener('hashchange',()=>requestAnimationFrame(alignFragment));addEventListener('pageshow',()=>requestAnimationFrame(()=>requestAnimationFrame(alignFragment)));layout();
})();
