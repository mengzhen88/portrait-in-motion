/* Original Figma MP4s load only after an explicit play action. */
(()=>{
 const dialog=document.querySelector('.video-modal'),video=dialog.querySelector('video'),stage=dialog.querySelector('.modal-video-stage');
 const title=dialog.querySelector('h2'),toggle=dialog.querySelector('.video-toggle'),time=dialog.querySelector('time'),seek=dialog.querySelector('input'),speed=dialog.querySelector('select'),error=dialog.querySelector('.video-error');
 const format=value=>{const seconds=Number.isFinite(value)?Math.floor(value):0;return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
 const sync=()=>{toggle.classList.toggle('is-playing',!video.paused);toggle.setAttribute('aria-label',video.paused?'播放':'暂停');time.textContent=format(video.currentTime)+' / '+format(video.duration);seek.value=video.duration?video.currentTime/video.duration*1000:0;seek.style.setProperty('--progress',Number(seek.value)/10+'%');};
 const play=()=>video.play().catch(()=>{sync();});
 const togglePlay=()=>video.paused?play():video.pause();
 document.querySelectorAll('.video-cover').forEach(button=>button.addEventListener('click',()=>{
  title.textContent=button.dataset.title;error.hidden=true;video.poster=button.querySelector('img').currentSrc;video.src=button.dataset.video;video.muted=true;video.playbackRate=1;speed.value='1';dialog.showModal();video.load();play();
 }));
 toggle.addEventListener('click',togglePlay);video.addEventListener('click',togglePlay);
 ['loadedmetadata','timeupdate','play','pause','ended','emptied'].forEach(event=>video.addEventListener(event,sync));
 video.addEventListener('error',()=>{error.hidden=false;});
 seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)/1000*video.duration;});
 speed.addEventListener('change',()=>{video.playbackRate=Number(speed.value);});
 dialog.querySelector('.video-enlarge').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else if(stage.requestFullscreen)stage.requestFullscreen().catch(()=>{});else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();});
 dialog.querySelector('.video-modal-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();});
})();
