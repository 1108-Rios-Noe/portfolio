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
  const title = document.createElement('h2');
  title.textContent = project.title;
  const desc = document.createElement('p');
  desc.textContent = project.description;
  const blurb = document.createElement('p');
  blurb.textContent = project.blurb || '';
  const thumbs = document.createElement('div');
  thumbs.className = 'thumbnails';
  project.images.forEach((img, idx)=>{
    const t = document.createElement('img');
    t.className = 'thumb-sm';
    t.src = img;
    t.alt = `${project.title} image ${idx+1}`;
    t.setAttribute('data-idx', String(idx));
    t.addEventListener('click', () => openViewer(idx));
    thumbs.appendChild(t);
  });
  projectContainer.appendChild(title);
  projectContainer.appendChild(desc);
  projectContainer.appendChild(blurb);
  projectContainer.appendChild(thumbs);
}

function $(sel){ return document.querySelector(sel); }

function openViewer(idx){
  currentImageIndex = idx;
  const img = $('#viewer-img');
  const msg = document.getElementById('viewer-msg');
  if(!project || !project.images) return;
  msg.textContent = 'Loading image…';
  msg.classList.remove('hidden');
  img.classList.remove('broken');
  img.removeAttribute('src');
  img.onload = () => { msg.classList.add('hidden'); img.classList.remove('broken'); img.style.visibility = 'visible'; };
  img.onerror = () => { img.classList.add('broken'); img.removeAttribute('src'); img.style.visibility = 'hidden'; msg.textContent = 'Could not load image.'; msg.classList.remove('hidden'); };
  img.style.visibility = 'hidden';
  img.src = project.images[currentImageIndex];
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
