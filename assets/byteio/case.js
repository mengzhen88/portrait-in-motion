(() => {
 const links=[...document.querySelectorAll('.case-toc a')];
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(link=>link.classList.toggle('active',link.hash==='#'+entry.target.id));});},{rootMargin:'-12% 0px -65% 0px'});
 document.querySelectorAll('section[id]').forEach(section=>observer.observe(section));
})();
