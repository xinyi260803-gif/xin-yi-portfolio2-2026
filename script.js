/*
 * Lim Xin Yi Portfolio — vanilla JavaScript only.
 * Personal details follow the user's publicly shared portfolio.
 * Review every claim and understand each feature before submitting coursework.
 */
'use strict';

const SETTINGS = {
  ownerName: 'Lim Xin Yi',
  contactEmail: 'xinyi260803@gmail.com',
  themeStorageKey: 'xinyi-portfolio-purple-theme'
};

const PROJECTS = [
  {
    id: 'campus360',
    number: '01',
    title: 'Campus360 Student App',
    category: 'mobile',
    type: 'Student services / No-code app',
    status: 'Work in progress',
    summary: 'An exploration of connected campus services, from student wellbeing activities to practical reporting and appointments.',
    idea: 'University students often need multiple services in one place. This AppSheet project explores a simpler way to discover wellbeing resources, report incidents, and access counseling bookings.',
    process: 'I have been working through database fields, mobile screens, upload interactions, and booking-form behavior. Testing these flows has highlighted why clean data structures and clear feedback matter.',
    learning: 'A useful interface depends on more than appearance: data consistency, input validation, and real-world testing are just as important.',
    tools: ['AppSheet', 'UI workflows', 'Data structure'],
    visual: 'campus'
  },
  {
    id: 'campus-guide',
    number: '02',
    title: 'UNIMAS Campus Guide',
    category: 'mobile',
    type: 'Android / Coursework',
    status: 'Coursework',
    summary: 'A two-screen Android learning project featuring venue navigation, intent data passing, and a simple campus-tip share flow.',
    idea: 'A small campus guide provides a clear context for learning how Android screens communicate with one another and with other apps.',
    process: 'I explored explicit Intents for passing a venue name between Activities, an implicit ACTION_SEND Intent for the Android Sharesheet, and UI state considerations during screen rotation.',
    learning: 'Navigation is only one part of a reliable app. Safe error handling and understanding the Activity lifecycle make interactions more dependable.',
    tools: ['Kotlin', 'Jetpack Compose', 'Android Intents'],
    visual: 'guide'
  },
  {
    id: 'time-machine',
    number: '03',
    title: 'Campus Time Machine 5G',
    category: 'concept',
    type: 'AR / Innovation proposal',
    status: 'Proposal concept',
    summary: 'An AR learning concept imagining how students could explore campus history and possible futures through shared 5G experiences.',
    idea: 'What if a campus could be explored across time? This proposal envisions location-based historical overlays, future-campus previews, and collaborative AR tours.',
    process: 'I developed a concept flow around lecturers hosting synchronized class tours, students joining a shared environment, and a mobile interface for selecting places and time periods.',
    learning: 'Innovation proposals need a clear user benefit and a convincing explanation of how technology such as 5G supports the experience. This is a concept, not a deployed AR application.',
    tools: ['Concept design', 'AR / 5G', 'UX proposal'],
    visual: 'time'
  },
  {
    id: 'web-portfolio',
    number: '04',
    title: 'Personal Portfolio Website',
    category: 'web',
    type: 'Front-end / Personal project',
    status: 'Current build',
    summary: 'A responsive portfolio experience built from semantic HTML, modern CSS, and browser-native JavaScript.',
    idea: 'A portfolio should communicate both what someone makes and how they think. I wanted a clean, personal space for telling the story behind my work.',
    process: 'This example explores accessible navigation, project filtering and search, detail dialogs, theme preferences, a contact form, and mobile-first layout decisions without a front-end framework.',
    learning: 'Small interaction decisions, contrast, responsive spacing, and keyboard access all influence whether a website feels effortless to use.',
    tools: ['HTML', 'CSS', 'JavaScript', 'Accessibility'],
    visual: 'portfolio'
  },
  {
    id: 'waterfall',
    number: '05',
    title: 'Waterfall Model Visual Guide',
    category: 'design',
    type: 'Information design / Study work',
    status: 'Visual study',
    summary: 'A visual breakdown of sequential software development phases, designed to make a technical process easier to understand.',
    idea: 'Technical concepts become more approachable when the structure and order of information are easy to see at a glance.',
    process: 'I explored how requirements, design, implementation, testing, deployment, and maintenance could be arranged into a simple visual flow with consistent labels and color.',
    learning: 'A useful diagram is not only attractive. It must preserve accurate relationships, communicate the sequence clearly, and be easy to read.',
    tools: ['Visual communication', 'Software process', 'Presentation'],
    visual: 'waterfall'
  }
];

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeFilter = 'all';
let searchTerm = '';
let sortOrder = 'featured';
let currentProjectId = null;
let toastTimer;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3300);
}

// 1. Theme toggle with a safe localStorage fallback.
function setupTheme() {
  let savedTheme = null;
  try { savedTheme = window.localStorage.getItem(SETTINGS.themeStorageKey); } catch { /* Storage may be blocked. */ }
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : (systemPrefersDark ? 'dark' : 'light'), false);
  $('#theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
    showToast(next === 'dark' ? 'Dark theme enabled' : 'Light theme enabled');
  });
}

function setTheme(theme, remember) {
  document.documentElement.dataset.theme = theme;
  $('#theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  $('.theme-icon').textContent = theme === 'dark' ? '☼' : '◐';
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#161221' : '#faf8ff';
  if (remember) {
    try { window.localStorage.setItem(SETTINGS.themeStorageKey, theme); } catch { /* Site works without storage. */ }
  }
}

// 2. Collapsible mobile menu, including outside-click and Escape handling.
function setupNavigation() {
  const toggle = $('#menu-toggle');
  const links = $('#nav-links');
  const close = () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  toggle.addEventListener('click', () => {
    const opening = !links.classList.contains('is-open');
    links.classList.toggle('is-open', opening);
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  });
  $$('.nav-link', links).forEach(link => link.addEventListener('click', close));
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav') && links.classList.contains('is-open')) close();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) close(); });
}

// 3. A scroll progress indicator and 4. back-to-top button.
function setupScrollTools() {
  let framePending = false;
  const update = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const fraction = Math.min(1, Math.max(0, window.scrollY / scrollable));
    $('#scroll-progress').style.width = `${(fraction * 100).toFixed(2)}%`;
    $('#back-to-top').classList.toggle('is-visible', window.scrollY > 650);
    framePending = false;
  };
  window.addEventListener('scroll', () => {
    if (!framePending) { framePending = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  $('#back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' }));
  update();
}

// 5. Active section indication in the persistent navigation.
function setupActiveSection() {
  const sections = $$('main section[id]');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    const inView = entries.filter(item => item.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    if (!inView.length) return;
    const activeId = inView[0].target.id;
    $$('.nav-link').forEach(link => {
      if (link.getAttribute('href') === `#${activeId}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .15, .5] });
  sections.forEach(section => observer.observe(section));
}

// 6. Reduced-motion-aware scroll reveal, using one reusable observer.
function setupReveals() {
  const elements = $$('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
    });
  }, { threshold: .08, rootMargin: '0px 0px 35px 0px' });
  elements.forEach(element => observer.observe(element));
}

// A small rotating introduction respects reduced-motion preferences.
function setupRoleRotator() {
  const label = $('#role-rotator');
  if (!label || reduceMotion.matches) return;
  const phrases = ['Multimedia Computing student', 'creative learner', 'future developer'];
  let index = 0;
  window.setInterval(() => {
    if (document.hidden) return;
    index = (index + 1) % phrases.length;
    label.textContent = phrases[index];
  }, 3400);
}

// Accessible tabs keep all of the original Interests, Goals, Hobbies, and Subjects content.
function setupWorldTabs() {
  const tabs = $$('.world-tab');
  if (!tabs.length) return;
  const activate = (tab, focus = false) => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target = null;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (target) { event.preventDefault(); activate(target, true); }
    });
  });
  $$('[data-open-tab]').forEach(link => link.addEventListener('click', event => {
    const target = tabs.find(tab => tab.id === `${link.dataset.openTab}-tab`);
    if (!target) return;
    event.preventDefault();
    activate(target);
    $('#my-world').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    window.history.replaceState(null, '', '#my-world');
  }));
  const directPanel = document.getElementById(window.location.hash.slice(1));
  if (directPanel && directPanel.classList.contains('world-panel')) {
    const tab = tabs.find(item => item.getAttribute('aria-controls') === directPanel.id);
    if (tab) activate(tab);
  }
}

function visualFor(project) {
  const shared = `<span class="visual-shape" aria-hidden="true"></span><span class="visual-caption" aria-hidden="true">${escapeHTML(project.type.toUpperCase())}</span>`;
  let illustration = '';
  if (project.visual === 'campus') {
    illustration = `<div class="mini-phone" aria-hidden="true"><span class="phone-notch"></span><span class="phone-title">Campus360 ✳</span><div class="phone-bar">☀ Mind & Body</div><div class="phone-bar">♡ Counseling</div><div class="phone-bar">▤ Incident Report</div><div class="phone-circle-row"><i></i><i></i><i></i></div></div>`;
  } else if (project.visual === 'guide') {
    illustration = `<div class="mini-phone guide-screen" aria-hidden="true"><span class="phone-notch"></span><span class="phone-title">Explore campus</span><div class="route-line"></div><div class="phone-bar">↗ Find a venue</div><div class="phone-bar">⇧ Share a campus tip</div></div>`;
  } else if (project.visual === 'time') {
    illustration = `<div class="ar-scene" aria-hidden="true"><div class="ar-ground"></div><div class="ar-building one"></div><div class="ar-building two"></div><div class="ar-building three"></div><span class="ar-label">AR · 2035 ↗</span></div>`;
  } else if (project.visual === 'portfolio') {
    illustration = `<div class="website-mini" aria-hidden="true"><div class="website-nav"><span>xy.</span><span>WORK &nbsp; ABOUT &nbsp; ↗</span></div><span class="website-big">Made to<br><em>explore.</em></span><span class="website-rule"></span></div>`;
  } else {
    illustration = `<div class="steps-visual" aria-hidden="true"><span>01 / Requirements</span><span>02 / Design</span><span>03 / Development</span><span>04 / Testing & deploy</span></div>`;
  }
  return `<div class="project-visual visual-${escapeHTML(project.visual)}" role="img" aria-label="Stylized illustration for ${escapeHTML(project.title)}">${shared}${illustration}</div>`;
}

// 7. Data-driven project cards, 8. category filters, 9. live search, 10. sorting.
function renderProjects() {
  const query = searchTerm.toLowerCase().trim();
  const matches = PROJECTS.filter(project => {
    const categoryMatches = activeFilter === 'all' || project.category === activeFilter;
    const searchMatches = [project.title, project.summary, project.type, ...project.tools].join(' ').toLowerCase().includes(query);
    return categoryMatches && searchMatches;
  });
  if (sortOrder !== 'featured') {
    matches.sort((a,b) => sortOrder === 'az' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
  }
  $('#project-grid').innerHTML = matches.map(project => `
    <article class="project-card">
      ${visualFor(project)}
      <div class="project-content">
        <div class="project-overline"><span>PROJECT / ${project.number}</span><span class="status">${escapeHTML(project.status.toUpperCase())}</span></div>
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.summary)}</p>
        <div class="tag-list">${project.tools.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
        <div class="project-card-footer"><span>${escapeHTML(project.type.toUpperCase())}</span><button class="project-detail-button" type="button" data-project="${escapeHTML(project.id)}" aria-label="View details for ${escapeHTML(project.title)}">View details <span aria-hidden="true">↗</span></button></div>
      </div>
    </article>
  `).join('');
  $('#results-count').textContent = `Showing ${matches.length} ${matches.length === 1 ? 'project' : 'projects'}`;
  $('#empty-state').hidden = matches.length > 0;
}

function setFilter(category) {
  activeFilter = category;
  $$('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === category;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderProjects();
}

function setupProjectTools() {
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  $('#project-search').addEventListener('input', event => { searchTerm = event.target.value; renderProjects(); });
  $('#project-sort').addEventListener('change', event => { sortOrder = event.target.value; renderProjects(); });
  $('#reset-filters').addEventListener('click', () => {
    searchTerm = '';
    sortOrder = 'featured';
    $('#project-search').value = '';
    $('#project-sort').value = 'featured';
    setFilter('all');
    $('#project-search').focus();
  });
  $('#project-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-project]');
    if (button) openProject(button.dataset.project);
  });
  renderProjects();
}

// 11. Native modal case studies, Escape/backdrop close, and 12. shareable deep links.
function projectURL(projectId) {
  const url = new URL(window.location.href);
  if (projectId) url.searchParams.set('project', projectId);
  else url.searchParams.delete('project');
  if (projectId) url.hash = 'work';
  return url;
}

function openProject(projectId, fromLink = false) {
  const project = PROJECTS.find(item => item.id === projectId);
  if (!project) return;
  currentProjectId = project.id;
  $('#dialog-cover').innerHTML = visualFor(project);
  $('#dialog-category').textContent = `PROJECT / ${project.number}`;
  $('#dialog-title').textContent = project.title;
  $('#dialog-intro').textContent = project.summary;
  $('#dialog-type').textContent = project.type;
  $('#dialog-status').textContent = project.status;
  $('#dialog-idea').textContent = project.idea;
  $('#dialog-process').textContent = project.process;
  $('#dialog-learning').textContent = project.learning;
  $('#dialog-tags').innerHTML = project.tools.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
  const dialog = $('#project-dialog');
  if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
  else if (typeof dialog.showModal !== 'function') { showToast('Your browser does not support project dialogs.'); return; }
  if (!fromLink) window.history.replaceState(null, '', projectURL(projectId));
  $('#dialog-close').focus();
}

function setupDialog() {
  const dialog = $('#project-dialog');
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    currentProjectId = null;
    const url = new URL(window.location.href);
    if (url.searchParams.has('project')) window.history.replaceState(null, '', projectURL(null));
  });
  const requested = new URLSearchParams(window.location.search).get('project');
  if (requested && PROJECTS.some(project => project.id === requested)) openProject(requested, true);
}

// Clipboard API has restrictions; the fallback still works in many older browsers.
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    const copied = document.execCommand('copy');
    temp.remove();
    return copied;
  } catch { return false; }
}

// 13. Live character counter and 14. accessible field validation.
function setupContactForm() {
  const form = $('#contact-form');
  const message = $('#contact-message');
  const fields = ['name', 'email', 'message'];
  const rules = {
    name: value => value.length < 2 ? 'Please enter at least 2 characters.' : '',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address.',
    message: value => value.length < 10 ? 'Please write at least 10 characters.' : ''
  };
  const validate = key => {
    const input = $(`#contact-${key}`);
    const error = rules[key](input.value.trim());
    $(`#${key}-error`).textContent = error;
    if (error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !error;
  };
  fields.forEach(key => {
    const input = $(`#contact-${key}`);
    input.setAttribute('aria-describedby', `${key}-error`);
    input.addEventListener('blur', () => validate(key));
    input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) validate(key); });
  });
  message.addEventListener('input', () => { $('#message-count').textContent = `${message.value.length} / 600`; });

  // 15. Front-end-only contact workflow with mailto or safe copy fallback.
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const checks = fields.map(validate);
    if (checks.includes(false)) { $(`#contact-${fields[checks.indexOf(false)]}`).focus(); return; }
    const sender = $('#contact-name').value.trim();
    const email = $('#contact-email').value.trim();
    const subject = $('#contact-subject').value.trim() || 'Portfolio enquiry';
    const body = `Hi ${SETTINGS.ownerName},\n\n${message.value.trim()}\n\nFrom: ${sender}\nEmail: ${email}`;
    const feedback = $('#form-feedback');
    if (SETTINGS.contactEmail.trim()) {
      const mailto = `mailto:${encodeURIComponent(SETTINGS.contactEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      feedback.textContent = 'Your email application should open with a prepared draft. Please press Send there.';
    } else {
      const copied = await copyText(`Subject: ${subject}\n\n${body}`);
      feedback.textContent = copied
        ? 'Message copied! Add the portfolio owner email in the code to enable direct email drafts.'
        : 'The portfolio email is not set yet. Add it in script.js before submitting the website.';
      showToast(copied ? 'Your draft was copied to clipboard' : 'Contact email needs to be configured');
    }
  });
}

// 16. Print-friendly résumé view and 17. automatic footer year.
function setupExtras() {
  $('#print-resume').addEventListener('click', () => window.print());
  $('#year').textContent = String(new Date().getFullYear());
}

function init() {
  setupTheme();
  setupNavigation();
  setupScrollTools();
  setupActiveSection();
  setupReveals();
  setupRoleRotator();
  setupWorldTabs();
  setupProjectTools();
  setupDialog();
  setupContactForm();
  setupExtras();
}

document.addEventListener('DOMContentLoaded', init);
