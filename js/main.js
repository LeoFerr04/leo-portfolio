// scroll progress bar
const progress = document.getElementById('progress');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + '%';
}
window.addEventListener('scroll', updateProgress); updateProgress();

// active nav link
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.navlinks a');
function onScroll(){
  let current = '';
  sections.forEach(s=>{ if(window.scrollY >= s.offsetTop - 120) current = s.id; });
  links.forEach(l=>{ l.classList.toggle('active', l.getAttribute('href') === '#'+current); });
}
window.addEventListener('scroll', onScroll); onScroll();

// responsive navigation menu
const menuBtn = document.getElementById('menuBtn');
const navList = document.getElementById('navlinks');

function closeNavMenu(){
  if(!menuBtn || !navList) return;
  navList.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}

if(menuBtn && navList){
  menuBtn.addEventListener('click', ()=>{
    const open = !navList.classList.contains('open');
    navList.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  navList.querySelectorAll('a').forEach(link=>link.addEventListener('click', closeNavMenu));

  document.addEventListener('click', (event)=>{
    if(!navList.classList.contains('open')) return;
    if(navList.contains(event.target) || menuBtn.contains(event.target)) return;
    closeNavMenu();
  });

  document.addEventListener('keydown', (event)=>{
    if(event.key === 'Escape') closeNavMenu();
  });

  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 1030) closeNavMenu();
  });
}

// stagger delays within each grid/group so items cascade in one after another
document.querySelectorAll('.principles, .stats-row, .proj-grid, .talks-grid, .timeline').forEach(group=>{
  const items = Array.from(group.children).filter(c=>c.classList.contains('reveal'));
  items.forEach((el,i)=>{ el.style.transitionDelay = Math.min(i*90,540)+'ms'; });
});

// reveal on scroll
const reduceMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if(!reduceMotion){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
        // trigger counters / bars when about section reveals
        if(e.target.querySelector && e.target.querySelector('[data-count]')){ animateCounters(e.target); }
        if(e.target.querySelector && e.target.querySelector('[data-w]')){ animateBars(e.target); }
      }
    });
  }, {threshold:.2});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'));
  document.querySelectorAll('[data-count]').forEach(el=>el.textContent=el.dataset.count);
  document.querySelectorAll('[data-w]').forEach(el=>el.style.width=el.dataset.w+'%');
}

function animateCounters(scope){
  scope.querySelectorAll('[data-count]').forEach(el=>{
    const target = parseInt(el.dataset.count,10);
    let cur = 0;
    const step = Math.max(1, Math.round(target/30));
    const t = setInterval(()=>{
      cur += step;
      if(cur >= target){ cur = target; clearInterval(t); }
      el.textContent = cur;
    }, 35);
  });
}
function animateBars(scope){
  scope.querySelectorAll('[data-w]').forEach(el=>{ el.style.width = el.dataset.w + '%'; });
}

// rotating role text in hero
let ri = 0;
const getRoles = () => window.PortfolioI18n ? window.PortfolioI18n.getRoles() : ['Computer Engineering', 'AI & Automation', 'Web Development', 'Systems Engineering'];
const cycleEl = document.getElementById('cycleText');
if(!reduceMotion){
  setInterval(()=>{
    const roles = getRoles();
    ri = (ri+1) % roles.length;
    cycleEl.style.opacity = 0;
    setTimeout(()=>{ cycleEl.textContent = roles[ri]; cycleEl.style.opacity = 1; }, 300);
  }, 2600);
  cycleEl.style.transition = 'opacity .3s ease';
}

window.addEventListener('portfolio-language-change', ()=>{
  ri = 0;
  const roles = getRoles();
  if(cycleEl && roles.length) cycleEl.textContent = roles[0];
});

// photo tilt
const frame = document.getElementById('photoFrame');
if(!reduceMotion && frame){
  const wrap = frame.parentElement;
  wrap.addEventListener('mousemove', (e)=>{
    const r = frame.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    frame.style.transform = `rotateY(${x*10}deg) rotateX(${-y*10}deg)`;
  });
  wrap.addEventListener('mouseleave', ()=>{ frame.style.transform = 'rotateY(0) rotateX(0)'; });
}

// project filter
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.proj-card');
filterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.f;
    cards.forEach(c=>{
      const tags = c.dataset.tags.split(',');
      c.style.display = (f==='all' || tags.includes(f)) ? '' : 'none';
    });
  });
});

// contact form
const contactForm = document.getElementById('contactForm');
const contactSubmit = document.getElementById('contactSubmit');
const formStatus = document.getElementById('formStatus');

function setFormStatus(message, type=''){
  if(!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = 'form-status' + (type ? ' ' + type : '');
}

if(contactForm){
  contactForm.addEventListener('submit', async (event)=>{
    event.preventDefault();
    setFormStatus('');

    if(!contactForm.checkValidity()){
      contactForm.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(contactForm).entries());
    contactSubmit.disabled = true;
    contactSubmit.textContent = window.PortfolioI18n ? window.PortfolioI18n.t('sending') : 'Sending…';

    try{
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error || 'Unable to send your message.');

      contactForm.reset();
      setFormStatus(window.PortfolioI18n ? window.PortfolioI18n.t('sent') : 'Message sent. Thank you — I’ll get back to you by email.', 'success');
    }catch(error){
      setFormStatus(window.PortfolioI18n ? window.PortfolioI18n.t('send_error') : 'The form could not send the message. Please email leonardofnferreira@gmail.com directly.', 'error');
    }finally{
      contactSubmit.disabled = false;
      contactSubmit.textContent = window.PortfolioI18n ? window.PortfolioI18n.t('send_message') : 'Send message';
    }
  });
}
