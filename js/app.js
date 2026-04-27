const $ = sel => document.querySelector(sel);
let projects = [];
let currentProject = null;
let currentImageIndex = 0;

async function load() {
  const res = await fetch('data/projects.json');
  projects = await res.json();
  renderList();
}

function renderList(){
  const container = $('#projects');
  container.innerHTML = '';
  projects.forEach(p=>{
    const card = document.createElement('article');
    card.className='card';
    card.tabIndex=0;
    card.innerHTML = `
      <img class="thumb" src="${p.images[0]}" alt="${p.title} thumbnail"/>
      <h3>${p.title}</h3>
      <p>${p.blurb}</p>
    `;
    card.addEventListener('click',()=> openProject(p.id));
    card.addEventListener('keypress',(e)=>{ if(e.key === 'Enter') openProject(p.id)});
    container.appendChild(card);
  })
}

function openProject(id){
  const p = projects.find(x=>x.id===id);
  currentProject = p;
  const aside = $('#project-detail');
  aside.classList.remove('hidden');
  aside.setAttribute('aria-hidden','false');
  aside.innerHTML = `
    <h2>${p.title}</h2>
    <p>${p.description}</p>
    <div class="thumbnails">
      ${p.images.map((img,idx)=>`<img class="thumb-sm" src="${img}" data-idx="${idx}" alt="${p.title} image ${idx+1}">`).join('')}
    </div>
  `;
  aside.querySelectorAll('.thumb-sm').forEach(img=>{
    img.addEventListener('click', (e)=> openViewer(parseInt(e.currentTarget.dataset.idx)));
  })
}

// Viewer controls
function openViewer(idx){
  currentImageIndex = idx;
  $('#viewer-img').src = currentProject.images[currentImageIndex];
  $('#viewer').classList.remove('hidden');
}

function closeViewer(){
  $('#viewer').classList.add('hidden');
}

function prevImage(){
  currentImageIndex = (currentImageIndex -1 + currentProject.images.length) % currentProject.images.length;
  $('#viewer-img').src = currentProject.images[currentImageIndex];
}

function nextImage(){
  currentImageIndex = (currentImageIndex +1) % currentProject.images.length;
  $('#viewer-img').src = currentProject.images[currentImageIndex];
}

document.addEventListener('DOMContentLoaded',()=>{
  load();
  $('#viewer-close').addEventListener('click', closeViewer);
  $('#viewer-prev').addEventListener('click', prevImage);
  $('#viewer-next').addEventListener('click', nextImage);
  document.addEventListener('keydown',(e)=>{
    if($('#viewer').classList.contains('hidden')) return;
    if(e.key==='ArrowLeft') prevImage();
    if(e.key==='ArrowRight') nextImage();
    if(e.key==='Escape') closeViewer();
  });
});
