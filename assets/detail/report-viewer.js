/* A local PDF.js reader: continuous pages, bounded canvas memory, no CDN. */
(() => {
  'use strict';
  const script = document.currentScript;
  const libraryRoot = new URL('../vendor/pdfjs/', script.src);
  const readers = document.querySelectorAll('[data-pdf-src]');
  const start = async root => {
    const scroller = root.querySelector('.report-scroll');
    const pagesElement = root.querySelector('.report-pages');
    const status = root.querySelector('.report-status');
    const pageCount = root.querySelector('.report-page-count');
    try {
      const pdfjs = await import(new URL('pdf.min.mjs', libraryRoot).href);
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', libraryRoot).href;
      const pdf = await pdfjs.getDocument({
        url: new URL(root.dataset.pdfSrc, document.baseURI).href,
        cMapUrl: new URL('cmaps/', libraryRoot).href,
        cMapPacked: true,
        standardFontDataUrl: new URL('standard_fonts/', libraryRoot).href,
        wasmUrl: new URL('wasm/', libraryRoot).href,
      }).promise;
      const first = await pdf.getPage(1);
      const firstViewport = first.getViewport({scale:1});
      const states = Array.from({length:pdf.numPages}, (_, index) => {
        const element = document.createElement('figure');
        element.className = 'report-page';
        element.style.aspectRatio = `${firstViewport.width} / ${firstViewport.height}`;
        element.setAttribute('role','img');
        element.setAttribute('aria-label', `调研报告，第 ${index+1} 页，共 ${pdf.numPages} 页`);
        element.dataset.page = index+1;
        const label = document.createElement('span');
        label.className = 'report-page-label';
        label.textContent = `第 ${index+1} 页`;
        label.setAttribute('aria-hidden','true');
        element.append(label);
        pagesElement.append(element);
        return {number:index+1,element,task:null,busy:false,canvas:null,width:0,visible:false};
      });
      status.hidden = true;
      root.dataset.pdfPages = pdf.numPages;
      const queued = new Set();
      let running = 0;
      function enqueue(state) {
        const width = state.element.clientWidth;
        if (state.busy || (state.canvas && Math.abs(state.width-width)<1)) return;
        queued.add(state);
        pump();
      }
      async function draw(state) {
        const page = state.number===1 ? first : await pdf.getPage(state.number);
        const width = state.element.clientWidth;
        const natural = page.getViewport({scale:1});
        const viewport = page.getViewport({scale:width/natural.width});
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width*pixelRatio);
        canvas.height = Math.ceil(viewport.height*pixelRatio);
        canvas.setAttribute('aria-hidden','true');
        state.element.style.aspectRatio = `${natural.width} / ${natural.height}`;
        state.task = page.render({canvas,viewport,transform:pixelRatio!==1?[pixelRatio,0,0,pixelRatio,0,0]:null,background:'#fff'});
        await state.task.promise;
        if (state.canvas) {state.canvas.width = 0;state.canvas.remove();}
        state.canvas = canvas;
        state.width = width;
        state.element.append(canvas);
        state.element.dataset.rendered = 'true';
        if (state.number===1) root.dataset.pdfReady = 'true';
      }
      function pump() {
        while(running<2 && queued.size) {
          const state = queued.values().next().value;
          queued.delete(state);
          if (!state.visible) continue;
          state.busy = true;
          running++;
          draw(state).catch(() => {
            state.element.querySelector('.report-page-label').textContent = '本页暂时无法显示，请查看原文';
          }).finally(() => {
            state.task=null;
            state.busy=false;
            running--;
            if (state.visible && state.canvas && Math.abs(state.width-state.element.clientWidth)>=1) enqueue(state);
            updatePosition();
            pump();
          });
        }
      }
      const visiblePages = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const state = states[Number(entry.target.dataset.page)-1];
          state.visible = entry.isIntersecting;
          if (state.visible) enqueue(state);
        });
      },{root:scroller,rootMargin:'800px 0px',threshold:0});
      states.forEach(state => visiblePages.observe(state.element));
      let scrollFrame = 0;
      function updatePosition() {
        scrollFrame = 0;
        const bounds = scroller.getBoundingClientRect();
        const readingLine = bounds.top + Math.min(100,bounds.height/3);
        let current = 1;
        states.forEach(state => {if(state.element.getBoundingClientRect().top<=readingLine) current=state.number;});
        pageCount.textContent = `${current} / ${pdf.numPages} 页`;
        root.dataset.currentPage = current;
        // Keep nearby rendered pages, release distant canvases in long reports.
        states.forEach(state => {
          if (state.canvas && !state.visible && Math.abs(state.number-current)>3 && !state.busy) {
            state.canvas.width=0;
            state.canvas.remove();
            state.canvas=null;
            state.element.removeAttribute('data-rendered');
          }
        });
      }
      scroller.addEventListener('scroll',() => {if(!scrollFrame)scrollFrame=requestAnimationFrame(updatePosition);},{passive:true});
      let measuredWidth = scroller.clientWidth;
      new ResizeObserver(() => {
        if(Math.abs(scroller.clientWidth-measuredWidth)<1) return;
        measuredWidth=scroller.clientWidth;
        states.filter(state=>state.visible).forEach(enqueue);
      }).observe(scroller);
      updatePosition();
    } catch(error) {
      status.hidden = false;
      status.textContent = '报告暂时无法加载，请点击右上方“查看原文”打开 PDF。';
      root.dataset.pdfError = 'true';
    }
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {observer.unobserve(entry.target);start(entry.target);}
    });
  },{rootMargin:'800px 0px'});
  readers.forEach(reader=>observer.observe(reader));
})();
