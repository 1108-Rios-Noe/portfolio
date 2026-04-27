const $ = sel => document.querySelector(sel);
let projects = [];
let currentProject = null;
let currentImageIndex = 0;

async function load() {
  const container = $('#projects');
  projects = [];
  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) {
      throw new Error(`Failed to load projects (${res.status})`);
    }
    projects = await res.json();
    renderList();
  } catch (err) {
    container.innerHTML = '<p role="alert">Unable to load projects right now. Please try again later.</p>';
  }
}

function renderList(){
  const container = $('#projects');
  container.innerHTML = '';
  projects.forEach(p=>{
    const card = document.createElement('article');
    card.className='card';
    card.tabIndex=0;
    card.setAttribute('role', 'button');
    const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const slug = slugify(p.title || p.id);
    card.innerHTML = `
      <img class="thumb" src="${p.images[0]}" alt="${p.title} thumbnail"/>
      <h3>${p.title}</h3>
      <p>${p.blurb}</p>
      <div style="margin-top:.6rem"><a class="card-link" href="projects/${slug}/">View page →</a></div>
    `;
    card.addEventListener('click',()=> { window.location.href = `projects/${slug}/`; });
    card.addEventListener('keydown',(e)=>{
      if(e.key === 'Enter' || e.key === ' ') {
        if(e.key === ' ') e.preventDefault();
        window.location.href = `projects/${slug}/`;
      }
    });
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
    img.addEventListener('click', (e)=> openViewer(parseInt(e.currentTarget.dataset.idx, 10)));
  })
  aside.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = p.title;
  const description = document.createElement('p');
  description.textContent = p.description;
  const thumbnails = document.createElement('div');
  thumbnails.className = 'thumbnails';
  p.images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.className = 'thumb-sm';
    thumb.src = img;
    thumb.setAttribute('data-idx', String(idx));
    thumb.alt = `${p.title} image ${idx+1}`;
    thumb.addEventListener('click', () => openViewer(idx));
    thumbnails.appendChild(thumb);
  });
  aside.appendChild(title);
  aside.appendChild(description);
  aside.appendChild(thumbnails);
}

// Viewer controls
function openViewer(idx){
  currentImageIndex = idx;
  const img = $('#viewer-img');
  const msg = document.getElementById('viewer-msg');
  img.classList.remove('broken');
  if (!currentProject || !currentProject.images) return;
  // show loading status
  msg.textContent = 'Loading image…';
  msg.classList.remove('hidden');
  img.classList.remove('broken');
  img.removeAttribute('src');
  img.onload = () => {
    msg.classList.add('hidden');
    img.classList.remove('broken');
    img.style.visibility = 'visible';
  };
  img.onerror = () => {
    img.classList.add('broken');
    img.removeAttribute('src');
    img.style.visibility = 'hidden';
    msg.textContent = 'Could not load image.';
    msg.classList.remove('hidden');
  };
  // set src last to trigger load
  img.style.visibility = 'hidden';
  img.src = currentProject.images[currentImageIndex];
  $('#viewer').classList.remove('hidden');
}

function closeViewer(){
  $('#viewer').classList.add('hidden');
  const img = $('#viewer-img');
  img.removeAttribute('src');
  document.getElementById('viewer-msg').classList.add('hidden');
  currentImageIndex = 0;
}

function prevImage(){
  if (!currentProject || !currentProject.images || currentProject.images.length === 0) {
    console.warn('prevImage: no project loaded');
    return;
  }
  currentImageIndex = (currentImageIndex -1 + currentProject.images.length) % currentProject.images.length;
  const img = $('#viewer-img');
  img.classList.remove('broken');
  img.onload = () => img.classList.remove('broken');
  img.onerror = () => { img.classList.add('broken'); img.removeAttribute('src'); document.getElementById('viewer-msg').classList.remove('hidden'); };
  img.src = currentProject.images[currentImageIndex];
}

function nextImage(){
  if (!currentProject || !currentProject.images || currentProject.images.length === 0) {
    console.warn('nextImage: no project loaded');
    return;
  }
  currentImageIndex = (currentImageIndex +1) % currentProject.images.length;
  const img = $('#viewer-img');
  img.classList.remove('broken');
  img.onload = () => img.classList.remove('broken');
  img.onerror = () => { img.classList.add('broken'); img.removeAttribute('src'); document.getElementById('viewer-msg').classList.remove('hidden'); };
  img.src = currentProject.images[currentImageIndex];
}

document.addEventListener('DOMContentLoaded',()=>{
  load();
  $('#viewer-close').addEventListener('click', (e) => { e.stopPropagation(); closeViewer(); });
  $('#viewer-prev').addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  $('#viewer-next').addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
  // click outside image closes viewer
  document.getElementById('viewer').addEventListener('click', (e) => {
    if (e.target && e.target.id === 'viewer') closeViewer();
  });
  document.addEventListener('keydown',(e)=>{
    if($('#viewer').classList.contains('hidden')) return;
    if(e.key==='ArrowLeft') prevImage();
    if(e.key==='ArrowRight') nextImage();
    if(e.key==='Escape') closeViewer();
  });
  initThemeAndLayout();
});

/* Theme & layout controls */
function initThemeAndLayout(){
  const select = document.getElementById('theme-select');
  const layoutBtn = document.getElementById('layout-toggle');
  const savedTheme = localStorage.getItem('portfolio:theme') || 'dark';
  const savedLayout = localStorage.getItem('portfolio:layout') || 'grid';
  applyTheme(savedTheme);
  applyLayout(savedLayout);
  select.value = savedTheme;
  layoutBtn.textContent = savedLayout === 'grid' ? 'Grid' : 'List';

  select.addEventListener('change',(e)=>{
    applyTheme(e.target.value);
    localStorage.setItem('portfolio:theme', e.target.value);
  });

  layoutBtn.addEventListener('click', ()=>{
    const current = document.body.classList.contains('layout-list') ? 'list' : 'grid';
    const next = current === 'grid' ? 'list' : 'grid';
    applyLayout(next);
    layoutBtn.textContent = next === 'grid' ? 'Grid' : 'List';
    localStorage.setItem('portfolio:layout', next);
  });
}

function applyTheme(name){
  document.documentElement.classList.remove('theme-dark','theme-light','theme-neon','theme-earth');
  document.documentElement.classList.add('theme-'+name);
}

function applyLayout(name){
  if(name === 'list') document.body.classList.add('layout-list');
  else document.body.classList.remove('layout-list');
}
