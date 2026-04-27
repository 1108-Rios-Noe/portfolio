/* Shared inline viewer for static project pages.
   Expects a global `PROJECT_DATA` object: { title, blurb, description, images: [] }
*/
(function(){
  if(typeof PROJECT_DATA === 'undefined') return;
  const project = PROJECT_DATA;
  let current = 0;

  function qs(sel){ return document.querySelector(sel); }

  function build(){
    document.title = `${project.title} — Onlynoer's Portfolio`;
    qs('#project-title').textContent = project.title;
    qs('#project-blurb').textContent = project.blurb || '';
    qs('#project-desc').textContent = project.description || '';

    const dots = qs('#inline-dots');
    dots.innerHTML = '';
    project.images.forEach((_, i)=>{
      const b = document.createElement('button');
      b.className = 'dot';
      b.ariaLabel = `Image ${i+1}`;
      b.addEventListener('click', ()=> show(i));
      dots.appendChild(b);
    });

    qs('#inline-prev').addEventListener('click', ()=> show((current-1+project.images.length)%project.images.length));
    qs('#inline-next').addEventListener('click', ()=> show((current+1)%project.images.length));
    show(0);
  }

  function show(i){
    current = i;
    const img = qs('#inline-img');
    const counter = qs('#inline-counter');
    const dots = qs('#inline-dots');
    img.classList.remove('broken');
    img.style.opacity = 0;
    img.onload = ()=> { img.style.transition = 'opacity .35s ease'; img.style.opacity = 1; };
    img.onerror = ()=> { img.classList.add('broken'); img.style.opacity = 0; };
    img.src = project.images[i];
    Array.from(dots.children).forEach((d, idx)=> d.classList.toggle('active', idx===i));
    counter.textContent = `${i+1} / ${project.images.length}`;
  }

  document.addEventListener('DOMContentLoaded', build);
})();
