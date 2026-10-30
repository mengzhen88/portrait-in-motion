(() => {
 const viewer=document.querySelector('.image-viewer'),image=viewer.querySelector('img'),caption=viewer.querySelector('.viewer-caption');
 let opener;
 document.querySelectorAll('.figure-open').forEach(button=>button.addEventListener('click',()=>{
  opener=button;const source=button.querySelector('img');image.src=source.getAttribute('src');image.alt=source.alt;caption.textContent=source.alt;viewer.showModal();viewer.querySelector('.viewer-scroll').scrollLeft=0;
 }));
 viewer.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();}});
 viewer.addEventListener('close',()=>{image.removeAttribute('src');opener?.focus({preventScroll:true});});
 const links=[...document.querySelectorAll('.case-toc a')];
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(link=>link.classList.toggle('active',link.hash==='#'+entry.target.id));});},{rootMargin:'-12% 0px -65% 0px'});
 document.querySelectorAll('section[id]').forEach(section=>observer.observe(section));
})();
