// Targets are final on-screen CSS pixels, independent of the illustration canvas scale.
(() => {
 const records=[];
 // Read the library scale once. Canvas compensation below keeps these sizes visible.
 const foundation=getComputedStyle(document.documentElement);
 const libraryScale=['xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl','7xl','8xl','9xl'].map(name=>({
  name,
  size:parseFloat(foundation.getPropertyValue('--md-text-'+name+'-size')),
  line:parseFloat(foundation.getPropertyValue('--md-text-'+name+'-line-height'))
 })).filter(type=>Number.isFinite(type.size)&&Number.isFinite(type.line));
 function libraryType(size,line){
  return libraryScale.reduce((best,type)=>Math.abs(type.size-size)<=Math.abs(best.size-size)?type:best,libraryScale[0])||{size,line};
 }
 function scaleOf(element){
  let scale=1;
  for(let parent=element;parent&&parent!==document.body;parent=parent.parentElement){
   const style=getComputedStyle(parent);scale*=Number(style.zoom)||1;
   if(style.transform.startsWith('matrix(')){
    const matrix=style.transform.slice(7,-1).split(',').map(Number);
    scale*=Math.hypot(matrix[0],matrix[1]);
   }
  }
  return scale;
 }
 function targetFor(e,fallback){
  const id=e.dataset.nodeId||'';
  if(e.closest('.detail-nav'))return 14;
  if(e.closest('.case-intro h1'))return 48;
  if(e.matches('.case-intro-facts dt'))return 12;
  if(e.matches('.case-intro-facts dd'))return 15;
  if(e.closest('[data-section="1058:22204"]')){
   if(id.endsWith('128597'))return 18;
   if(e.classList.contains('persona-emoji')||id==='919:18048')return fallback;
   return 15;
  }
  if(e.closest('.discover-mapping'))return e.classList.contains('discover-problem-number')?22:e.closest('.discover-response ul')?18:20;
  if(e.closest('[data-section="1058:22205"]'))return e.classList.contains('discover-reasoning-label')?20:18;
  if(e.classList.contains('presentation-title-text'))return 28;
  if(e.matches('p[data-node-id*="63293"],p[data-node-id="1056:22154"]'))return 64;
  if(e.closest('.creation-tabs'))return 15;
  if(e.closest('.creation-card'))return e.matches('h3')?16:15;
  if(e.closest('#presentation-02')){
   if(e.closest('#configuration-confusion')||['1058:23318','1058:23321','1058:23324'].includes(id))return 15;
   return 16;
  }
  if(e.closest('.usability-testing')){
   if(e.closest('.testing-metrics strong'))return 56;
   if(e.closest('h2,h3'))return 28;
   if(e.matches('small')||e.closest('.testing-feedback small'))return 12;
   if(e.closest('.testing-flow-canvas')&&/^[A-Za-z ·–.-]+$/.test(e.textContent.trim()))return 12;
   return 15;
  }
  return fallback;
 }
 document.body.querySelectorAll('*').forEach(element=>{
  if(element.closest('script,style,svg,.creation-window-return'))return;
  if(![...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim()))return;
  const style=getComputedStyle(element),scale=scaleOf(element);
  const target=targetFor(element,Math.max(12,Math.round(parseFloat(style.fontSize)*scale)));
  let line=parseFloat(style.lineHeight)*scale;
  if(element.closest('.discover-mapping'))line=28;
  else if(element.closest('.discover-module')&&(element.dataset.nodeId==='981:44282'||element.classList.contains('discover-reasoning-label')))line=32;
  else if(element.classList.contains('presentation-title-text'))line=40;
  else if(element.matches('p[data-node-id*="63293"],p[data-node-id="1056:22154"]'))line=90;
  else if(element.closest('.detail-nav'))line=24;
  else if(element.closest('.case-intro h1'))line=67.2;
  else if(element.closest('#configuration-confusion'))line=element.closest('header')?24:26;
  else if(element.closest('.testing-metrics strong'))line=67.2;
  else if(element.closest('.usability-testing h2,.usability-testing h3'))line=40;
  else if(element.closest('.creation-card'))line=element.matches('h3')?28:26;
  const type=libraryType(target,line);
  if(style.fontFamily.toLowerCase().includes('pingfang'))element.style.setProperty('font-family','var(--md-font-sans)');
  const decorative=element.classList.contains('persona-emoji');
  records.push({element,target:decorative?target:type.size,line:decorative?line:type.line});
  element.dataset.typeSize=decorative?target:type.size;
  if(!decorative)element.dataset.typeToken='text/'+type.name;
 });
 function apply(){
  document.querySelectorAll('[data-node-id="988:128625"],[data-node-id="988:128626"]>div,[data-node-id="988:128633"]>div').forEach(card=>card.style.setProperty('padding',24/scaleOf(card)+'px','important'));

  // Keep illustration insets at 24 visible CSS pixels even on scaled canvases.
  document.querySelectorAll('.creation-card,.creation-card figure,#configuration-confusion,#configuration-confusion .chat-canvas,#presentation-02 [data-node-id="1058:23316"]>div,[data-node-id="1058:23355"]').forEach(card=>{
   card.style.setProperty('--illustration-inset',24/scaleOf(card)+'px');
   card.style.setProperty('padding','var(--illustration-inset)','important');
  });
  document.querySelectorAll('#configuration-confusion .chat-example').forEach(card=>card.style.setProperty('--case-caption-gap',12/scaleOf(card)+'px'));
  records.forEach(({element,target,line})=>{
   if(!element.isConnected)return;
   const scale=scaleOf(element);
   const size=target/scale+'px';
   if(element.style.getPropertyValue('font-size')!==size)element.style.setProperty('font-size',size,'important');
   if(line)element.style.setProperty('line-height',line/scale+'px','important');
  });
 }
 window.applyAnyclawTypography=apply;
 apply();
 new ResizeObserver(apply).observe(document.querySelector('.case-main'));
 window.addEventListener('resize',()=>requestAnimationFrame(apply));
 document.fonts.ready.then(apply);
})();
