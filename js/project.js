function qsParam(name){
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

const projectContainer = document.getElementById('project');
let project = null;
let currentImageIndex = 0;

async function loadProject(){
  const id = qsParam('id');
  if(!id){
    projectContainer.innerHTML = '<p role="alert">No project specified. Go back to <a href="index.html">projects</a>.</p>';
    return;
  }
  try{
    const res = await fetch('data/projects.json');
    if(!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    project = data.find(p=>p.id === id);
    if(!project) {
      projectContainer.innerHTML = '<p role="alert">Project not found. <a href="index.html">Back</a></p>';
      return;
    }
    renderProject();
  }catch(err){
    projectContainer.innerHTML = '<p role="alert">Unable to load project data.</p>';
  }
}

function renderProject(){
  projectContainer.innerHTML = '';
  // Set page title
  document.title = `${project.title} — Onlynoer's Portfolio`;

  // Build inline viewer + meta
  const top = document.createElement('div');
  top.className = 'project-top';

  const viewer = document.createElement('div');
  viewer.className = 'viewer-inline';
  viewer.innerHTML = `
    <button class="viewer-inline-prev" aria-label="Previous image">◀</button>
    <div class="viewer-inline-frame">
      <img id="inline-img" class="inline-img" alt="${project.title} image 1">
      <div id="inline-dots" class="inline-dots" aria-hidden="false"></div>
      <div id="inline-counter" class="inline-counter"></div>
    </div>
    <button class="viewer-inline-next" aria-label="Next image">▶</button>
  `;

  const meta = document.createElement('div');
  meta.className = 'project-meta';
  meta.innerHTML = `
    <h2 id="project-title">${project.title}</h2>
    <p class="project-blurb">${project.blurb || ''}</p>
    <p class="project-desc">${project.description || ''}</p>
  `;

  top.appendChild(viewer);
  top.appendChild(meta);

  // Thumbnails row
  const thumbsRow = document.createElement('div');
  thumbsRow.className = 'thumbs-row';
  project.images.forEach((img, idx)=>{
    const t = document.createElement('img');
    t.className = 'thumb-sm';
    t.src = img;
    t.alt = `${project.title} image ${idx+1}`;
    t.setAttribute('data-idx', String(idx));
    t.addEventListener('click', () => showInlineImage(idx));
    thumbsRow.appendChild(t);
  });

  projectContainer.appendChild(top);
  projectContainer.appendChild(thumbsRow);

  // Wire inline viewer controls
  document.querySelector('.viewer-inline-prev').addEventListener('click', prevInline);
  document.querySelector('.viewer-inline-next').addEventListener('click', nextInline);

  // populate dots and show first image
  buildDots();
  showInlineImage(0);
}

function $(sel){ return document.querySelector(sel); }

function buildDots(){
  const dots = document.getElementById('inline-dots');
  dots.innerHTML = '';
  project.images.forEach((_, i)=>{
    const b = document.createElement('button');
    b.className = 'dot';
    b.setAttribute('aria-label', `Image ${i+1}`);
    b.addEventListener('click', ()=> showInlineImage(i));
    dots.appendChild(b);
  });
}

function showInlineImage(idx){
  if(!project || !project.images) return;
  currentImageIndex = idx;
  const img = document.getElementById('inline-img');
  const counter = document.getElementById('inline-counter');
  const dots = document.getElementById('inline-dots');
  img.classList.remove('broken');
  img.style.visibility = 'hidden';
  img.onload = () => { img.style.visibility = 'visible'; };
  img.onerror = () => { img.classList.add('broken'); img.style.visibility = 'hidden'; };
  img.src = project.images[currentImageIndex];
  // update dots
  Array.from(dots.children).forEach((d, i)=> d.classList.toggle('active', i===currentImageIndex));
  // update counter
  counter.textContent = `${currentImageIndex+1} / ${project.images.length}`;
}

function prevInline(){
  if(!project || !project.images || project.images.length===0) return;
  const next = (currentImageIndex -1 + project.images.length) % project.images.length;
  showInlineImage(next);
}

function nextInline(){
  if(!project || !project.images || project.images.length===0) return;
  const next = (currentImageIndex +1) % project.images.length;
  showInlineImage(next);
}

function closeViewer(){
  $('#viewer').classList.add('hidden');
  const img = $('#viewer-img');
  img.removeAttribute('src');
  document.getElementById('viewer-msg').classList.add('hidden');
  currentImageIndex = 0;
}

function prevImage(){
  if(!project || !project.images || project.images.length === 0) return;
  currentImageIndex = (currentImageIndex -1 + project.images.length) % project.images.length;
  const img = $('#viewer-img');
  img.classList.remove('broken');
  img.onload = () => img.classList.remove('broken');
  img.onerror = () => { img.classList.add('broken'); img.removeAttribute('src'); document.getElementById('viewer-msg').classList.remove('hidden'); };
  img.src = project.images[currentImageIndex];
}

function nextImage(){
  if(!project || !project.images || project.images.length === 0) return;
  currentImageIndex = (currentImageIndex +1) % project.images.length;
  const img = $('#viewer-img');
  img.classList.remove('broken');
  img.onload = () => img.classList.remove('broken');
  img.onerror = () => { img.classList.add('broken'); img.removeAttribute('src'); document.getElementById('viewer-msg').classList.remove('hidden'); };
  img.src = project.images[currentImageIndex];
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadProject();
  $('#viewer-close').addEventListener('click', (e)=>{ e.stopPropagation(); closeViewer(); });
  $('#viewer-prev').addEventListener('click', (e)=>{ e.stopPropagation(); prevImage(); });
  $('#viewer-next').addEventListener('click', (e)=>{ e.stopPropagation(); nextImage(); });
  document.getElementById('viewer').addEventListener('click', (e) => { if (e.target && e.target.id === 'viewer') closeViewer(); });
  document.addEventListener('keydown',(e)=>{
    if($('#viewer').classList.contains('hidden')) return;
    if(e.key==='ArrowLeft') prevImage();
    if(e.key==='ArrowRight') nextImage();
    if(e.key==='Escape') closeViewer();
  });
});
