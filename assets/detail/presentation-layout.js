// Viewport-aware presentation: reading and page selection are separate actions.
(() => {
  document.body.dataset.manualPresentation="true";
  const roomy = () => innerWidth >= 1050 && innerHeight >= 760;
  let scheduled = 0;
  function schedule() { if (!scheduled) scheduled=requestAnimationFrame(()=>{scheduled=0;layout();}); }
  function fitArt(slide, available) {
    const frame=slide.classList.contains('responsive-artwork-frame')?slide:slide.querySelector('.responsive-artwork-frame');
    if(!frame)return;
    const art=frame.firstElementChild;
    const original=Number(art.dataset.artHeight)||820;
    const scale=Math.min(frame.clientWidth/1440, available/original, 1);
    art.style.zoom=scale;art.style.margin='0 auto';
    frame.style.height=original*scale+'px';
    frame.style.display='flex';frame.style.justifyContent='center';
  }
  function layout() {
    const enabled=roomy();
    document.body.classList.toggle('viewport-presentation',enabled);
    const nav=document.querySelector('.detail-nav').getBoundingClientRect().height;
    const height=Math.max(0,innerHeight-nav-32);
    document.documentElement.style.setProperty('--presentation-height',height+'px');
    creationPinned=false;
    creationSection.classList.add('manual-presentation');
    creationSticky.style.position='relative';creationSticky.style.top='auto';
    creationSticky.style.maxHeight='none';creationSticky.style.removeProperty('--creation-top');
    creationTrack.style.height='auto';creationDemo.style.zoom=1;creationHeader.style.zoom=1;
    creationHeader.style.width='100%';creationDemo.style.width='100%';
    pptChapters.forEach(chapter=>{
      chapter.pinned=false;chapter.section.classList.remove('ppt-static');
      chapter.section.classList.add('manual-presentation');
      chapter.track.style.height='auto';chapter.sticky.style.position='relative';chapter.sticky.style.top='auto';
      chapter.stage.style.zoom=1;chapter.stage.style.width='100%';chapter.deck.style.height='auto';
      chapter.stage.firstElementChild.style.height='auto';
      chapter.slides.forEach((slide,i)=>{slide.hidden=i!==chapter.index;slide.style.transform='none';});
      const header=chapter.stage.firstElementChild;
      const available=enabled?chapter.deck.getBoundingClientRect().height:Infinity;
      chapter.deck.style.setProperty('--deck-height',available+'px');
      chapter.slides.forEach(slide=>{if(slide.hidden)return;fitArt(slide,available);});
      const counter=chapter.stage.querySelector('.presentation-page-count');
      if(counter)counter.textContent=(chapter.index+1)+' / '+chapter.slides.length;
      chapter.stage.querySelectorAll('.presentation-page-nav button').forEach(button=>{
        button.disabled=button.dataset.direction==='previous'?chapter.index===0:chapter.index===chapter.slides.length-1;
      });
    });
    syncReadableType();
  }
  // Remove scroll-distance paging and its artificial tall tracks.
  syncCreationScroll=()=>{creationFrame=0;};
  syncPptScroll=()=>{};
  layoutCreationScroll=schedule;
  layoutPptChapters=schedule;
  const originalSelect=selectPpt;
  selectPpt=(chapter,index)=>{originalSelect(chapter,index);schedule();requestAnimationFrame(()=>{if(roomy())window.scrollTo({top:window.scrollY+chapter.section.getBoundingClientRect().top-document.querySelector('.detail-nav').getBoundingClientRect().height-24,behavior:'instant'});});};
  pptChapters.forEach(chapter=>{
    const navigation=document.createElement('nav');navigation.className='presentation-page-nav';
    navigation.setAttribute('aria-label',chapter.section.id==='presentation-02'?'02内容翻页':'03内容翻页');
    const previous=document.createElement('button');previous.type='button';previous.dataset.direction='previous';previous.textContent='← 上一页';
    const count=document.createElement('span');count.className='presentation-page-count';
    const next=document.createElement('button');next.type='button';next.dataset.direction='next';next.textContent='下一页 →';
    previous.addEventListener('click',()=>selectPpt(chapter,Math.max(0,chapter.index-1)));
    next.addEventListener('click',()=>selectPpt(chapter,Math.min(chapter.slides.length-1,chapter.index+1)));
    navigation.append(previous,count,next);chapter.stage.append(navigation);
  });
  window.addEventListener('resize',schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
