// script.js
// Interactividad avanzada de MiChan: pantalla de lanzamiento, dashboard y flujos de usuario.

const body = document.body;
const openThreadButton = document.getElementById('open-thread-button');
const headerCreateThreadButton = document.getElementById('header-create-thread-button');
const visitForumButton = document.getElementById('visit-forum-button');
const threadCreationArticle = document.getElementById('thread-creation-article');
const registrationForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const threadForm = document.getElementById('thread-form');
const guestEntranceButton = document.getElementById('guest-entrance-button');
const headerGuestButton = document.getElementById('guest-access-button');
const signInButton = document.getElementById('sign-in-button');
const createAccountButton = document.getElementById('create-account-button');
const chatAccessButton = document.getElementById('chat-access-button');
const profileButton = document.getElementById('profile-button');
const logoutButton = document.getElementById('logout-button');
const notificationsButton = document.getElementById('notifications-button');
const profileAccessButton = document.getElementById('profile-access-button');
const notificationsAccessButton = document.getElementById('notifications-access-button');
const searchInput = document.getElementById('search-input');
const menuToggleButton = document.getElementById('menu-toggle');
const panelOverlay = document.getElementById('panel-overlay');
const panelCloseButton = document.getElementById('panel-close-button');
const panelTitle = document.getElementById('panel-title');
const panelContent = document.getElementById('panel-content');
const launchScreen = document.getElementById('launch-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginArticle = document.getElementById('login-article');
const registrationArticle = document.getElementById('registration-article');
const dashboardTitle = document.getElementById('dashboard-title');
const dashboardDescription = document.getElementById('dashboard-description');
const threadsContainer = document.getElementById('threads-container');
const userCount = document.getElementById('user-count');
const threadCount = document.getElementById('thread-count');
const onlineUsers = document.getElementById('online-users');
const recentActivity = document.getElementById('recent-activity');
const siteHeader = document.getElementById('site-header');

const state = {
  threadFormOpen: false,
  currentScreen: 'launch',
};

let currentUser = null;

const mockStats = {
  users: 0,
  threads: 0,
  online: 0,
  activity: '-',
};

// No sample threads by default — start with an empty list.
let currentThreads = [];

let notificationsLocal = [];

function showElement(element, visible) {
  element.classList.toggle('hidden', !visible);
  element.setAttribute('aria-hidden', String(!visible));
}

function setLaunchSection(section) {
  const showLogin = section === 'login';
  showElement(loginArticle, showLogin);
  showElement(registrationArticle, !showLogin);
}

function showScreen(screen) {
  state.currentScreen = screen;
  showElement(launchScreen, screen === 'launch');
  showElement(dashboardScreen, screen === 'dashboard');
}

function populateDashboard(userName, mode) {
  const title = mode === 'guest' ? 'Modo invitado activo' : `Bienvenido, ${userName}`;
  const description =
    mode === 'guest'
      ? 'Explora la comunidad sin registro. Algunas funciones estarán limitadas.'
      : `Has iniciado sesión en tu espacio seguro de MiChan como ${userName}.`;
  dashboardTitle.textContent = title;
  dashboardDescription.textContent = description;

  userCount.textContent = mockStats.users;
  threadCount.textContent = currentThreads.length;
  onlineUsers.textContent = mockStats.online;
  recentActivity.textContent = mockStats.activity;
}

function renderThreads(threads) {
  // keep a reference to the current threads for filtering and detail views
  currentThreads = Array.isArray(threads) ? threads : [];
  if (!threadsContainer) {
    return;
  }

  if (!threads.length) {
    threadsContainer.innerHTML = `<div class="threads-placeholder">No se encontraron hilos. Prueba otra búsqueda o crea uno nuevo.</div>`;
    return;
  }

  threadsContainer.innerHTML = `
    <div class="threads-grid">
      ${threads
        .map(
          (thread, index) => `
        <article class="thread-card" data-index="${index}">
          <div class="thread-meta">
            <span class="thread-author">${thread.author}</span>
            <span class="thread-tags">${thread.tags.map((tag) => `<strong>#${tag}</strong>`).join(' ')}</span>
          </div>
          <h3>${thread.title}</h3>
          <p>${thread.excerpt}</p>
          <button type="button" class="button button-secondary thread-view-button">Ver hilo</button>
        </article>
      `
        )
        .join('')}
    </div>
  `;
  // staggered animations for thread cards
  requestAnimationFrame(() => {
    const cards = threadsContainer.querySelectorAll('.thread-card');
    cards.forEach((c, i) => {
      c.classList.remove('animate');
      setTimeout(() => c.classList.add('animate'), i * 80);
    });
  });
}

function openPanel(title, content) {
  panelTitle.textContent = title;
  panelContent.innerHTML = content;
  showElement(panelOverlay, true);
  panelOverlay.setAttribute('aria-hidden', 'false');
}

function closePanel() {
  showElement(panelOverlay, false);
  panelOverlay.setAttribute('aria-hidden', 'true');
}

function filterThreads(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    renderThreads(currentThreads);
    return;
  }

  const filtered = currentThreads.filter((thread) => {
    const text = `${thread.title} ${thread.excerpt} ${thread.author} ${thread.tags.join(' ')}`.toLowerCase();
    return text.includes(normalized);
  });

  renderThreads(filtered);
}

// Fetch replies for a thread
async function fetchReplies(threadId) {
  try {
    const res = await fetch(`/api/threads/${threadId}/replies`);
    if (!res.ok) throw new Error('no replies');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('fetchReplies', err);
    return [];
  }
}

function renderReplies(replies, container) {
  if (!container) return;
  if (!replies || !replies.length) {
    container.innerHTML = '<div class="threads-placeholder">Aún no hay respuestas. Sé el primero en responder.</div>';
    return;
  }
  container.innerHTML = `
    <div class="replies-list">
      ${replies
        .map(
          (r) => `
        <article class="reply-card">
          <div class="reply-meta"><strong>${r.author}</strong> <span class="reply-time">${new Date(r.created_at).toLocaleString()}</span></div>
          <p class="reply-content">${r.content}</p>
          ${r.image ? `<div class="reply-image"><img src="${r.image}" alt="Adjunto" /></div>` : ''}
        </article>
      `
        )
        .join('')}
    </div>
  `;
}

// Open a detailed thread view with replies and a reply form
async function openThreadDetail(thread) {
  const threadId = thread.id;
  const contentHtml = `
    <article class="panel-thread">
      <h3>${thread.title}</h3>
      <div class="thread-by"><strong>${thread.author}</strong> • <span class="thread-time">${thread.createdAt ? new Date(thread.createdAt).toLocaleString() : ''}</span></div>
      <div class="thread-content">${thread.content}</div>
      <div class="panel-tags">${thread.tags.map((t) => `<span>#${t}</span>`).join(' ')}</div>
      <hr />
      <section id="replies-section">
        <h4>Respuestas</h4>
        <div id="replies-container">Cargando respuestas...</div>
      </section>
      <hr />
      <section id="reply-form-section">
        <h4>Escribe una respuesta</h4>
        <form id="reply-form">
          <div class="form-group">
            <label for="reply-author">Nombre (opcional)</label>
            <input id="reply-author" name="reply-author" type="text" placeholder="Tu nombre o alias" />
          </div>
          <div class="form-group">
            <label for="reply-content">Respuesta</label>
            <textarea id="reply-content" name="reply-content" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label for="reply-image">Imagen (URL, opcional)</label>
            <input id="reply-image" name="reply-image" type="url" placeholder="https://..." />
          </div>
          <div class="form-actions"><button type="submit" class="button button-primary">Responder</button></div>
        </form>
      </section>
    </article>
  `;

  openPanel(thread.title, contentHtml);

  // after panel is in DOM, fetch and render replies
  const repliesContainer = document.getElementById('replies-container');
  const replies = await fetchReplies(threadId);
  renderReplies(replies, repliesContainer);

  // wire reply form
  const replyForm = document.getElementById('reply-form');
  if (replyForm) {
    replyForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const author = document.getElementById('reply-author').value.trim() || 'Anónimo';
      const content = document.getElementById('reply-content').value.trim();
      const image = document.getElementById('reply-image').value.trim() || '';
      const submitBtn = replyForm.querySelector('button[type="submit"]');
      if (!content) {
        showToast('Escribe el contenido de la respuesta.', 'error');
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      try {
        const res = await fetch(`/api/threads/${threadId}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ author, content, image }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'No se pudo enviar la respuesta');
        }
        const created = await res.json();
        // append to list
        replies.push(created);
        renderReplies(replies, repliesContainer);
        replyForm.reset();
        showToast('Respuesta publicada.', 'info');
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Error al publicar respuesta.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

// Show a small toast message on screen for user-friendly errors/infos
function showToast(message, type = 'info', timeout = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.right = '1rem';
    container.style.bottom = '1rem';
    container.style.zIndex = 1100;
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.textContent = message;
  el.style.marginTop = '0.5rem';
  el.style.padding = '0.65rem 0.85rem';
  el.style.borderRadius = '10px';
  el.style.color = type === 'error' ? '#fff' : '#06210d';
  el.style.background = type === 'error' ? 'rgba(200,40,40,0.95)' : 'rgba(165, 226, 182, 0.95)';
  el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';

  container.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 300ms ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, timeout);
}

// Fetch threads from server API and render them
async function fetchThreads() {
  try {
    const res = await fetch('/api/threads');
    if (!res.ok) throw new Error('Error al obtener hilos');
    const data = await res.json();
    currentThreads = Array.isArray(data) ? data : [];
    renderThreads(currentThreads);
  } catch (err) {
    console.error(err);
    showToast('No se pudieron cargar los hilos. Intenta de nuevo.', 'error');
  }
}

// Fetch stats from server API and update the dashboard numbers
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    const stats = await res.json();
    userCount.textContent = stats.users ?? 0;
    threadCount.textContent = stats.threads ?? 0;
    onlineUsers.textContent = stats.online ?? 0;
    recentActivity.textContent = stats.activity ?? '-';
  } catch (err) {
    console.error(err);
    showToast('No se pudieron cargar las estadísticas.', 'error');
  }
}

function toggleMobileMenu() {
  siteHeader.classList.toggle('nav-open');
}

function enterDashboard(mode, options = {}) {
  const userName = options.username || 'MiChan';
  populateDashboard(userName, mode);
  showScreen('dashboard');
  showElement(threadCreationArticle, false);
  state.threadFormOpen = false;
  openThreadButton.textContent = 'Crear hilo';
  renderThreads(currentThreads);
}

async function handleRegistrationSubmit(event) {
  event.preventDefault();
  const username = registrationForm.username.value.trim();
  const password = registrationForm.querySelector('#password').value;
  const confirmPassword = registrationForm.querySelector('#confirm-password').value;
  const course = registrationForm.querySelector('#course-select').value;
  const submitBtn = registrationForm.querySelector('button[type="submit"]');

  if (!username || !password || !course) {
    showToast('Completa todos los campos del registro.', 'error');
    return;
  }
  if (password !== confirmPassword) {
    showToast('Las contraseñas no coinciden.', 'error');
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ username, password, course }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || 'Error en el registro');
    }
    const user = await res.json();
    currentUser = user;
    showToast('Registro correcto. Bienvenido ' + user.username, 'info');
    updateUserStatus(true);
    enterDashboard('register', { username: user.displayName || user.username });
  } catch (err) {
    console.error(err);
    showToast(err.message || 'No se pudo registrar.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = loginForm['login-username'].value.trim();
  const password = loginForm['login-password'].value;
  const submitBtn = loginForm.querySelector('button[type="submit"]');

  if (!username || !password) {
    showToast('Ingresa usuario y contraseña.', 'error');
    return;
  }
  if (submitBtn) submitBtn.disabled = true;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'same-origin',
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || 'Credenciales inválidas');
    }
    const user = await res.json();
    currentUser = user;
    showToast('Inicio de sesión correcto. Hola ' + user.username, 'info');
    enterDashboard('login', { username: user.displayName || user.username });
  } catch (err) {
    console.error(err);
    showToast(err.message || 'No se pudo iniciar sesión.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleThreadSubmit(event) {
  event.preventDefault();
  // Gather form values
  const author = threadForm['thread-author'].value || 'Anónimo';
  const title = threadForm['thread-title'].value && threadForm['thread-title'].value.trim();
  const content = threadForm['thread-content'].value && threadForm['thread-content'].value.trim();
  const tagsRaw = threadForm['thread-tags'].value || '';

  if (!title || !content) {
    showToast('Por favor completa el título y el contenido del hilo.', 'error');
    return;
  }

  const submitBtn = threadForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  try {
    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, title, content, tags }),
    });

    if (!res.ok) {
      let errText = 'Error al publicar el hilo.';
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) errText = errJson.error;
      } catch (e) {}
      throw new Error(errText);
    }

    const created = await res.json();
    // Prepend to current threads and re-render
    currentThreads.unshift(created);
    renderThreads(currentThreads);
    // Update stats
    fetchStats();
    showToast('Hilo publicado correctamente.', 'info');
    threadForm.reset();
    showElement(threadCreationArticle, false);
    state.threadFormOpen = false;
    openThreadButton.textContent = 'Crear hilo';
  } catch (err) {
    console.error(err);
    showToast(err.message || 'No se pudo publicar el hilo.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function toggleThreadForm() {
  state.threadFormOpen = !state.threadFormOpen;
  showElement(threadCreationArticle, state.threadFormOpen);
  openThreadButton.textContent = state.threadFormOpen ? 'Cerrar formulario' : 'Crear hilo';
}

function openPlaceholder(feature) {
  if (feature === 'Perfil') {
    return openProfilePanel();
  }
  if (feature === 'Notificaciones') {
    return openNotificationsPanel();
  }

  const contentMap = {
    Foro: '<p>Bienvenido al foro. Aquí encontrarás conversaciones activas, debates y eventos de la comunidad.</p>',
    'Chat privado': '<p>Esta área mostrará tus mensajes privados. Conecta con otros miembros y organiza conversaciones privadas.</p>',
  };

  openPanel(feature, contentMap[feature] || '<p>Funcionalidad en construcción.</p>');
}

// Open a small prompt to choose a nickname for guest access
function openGuestPrompt() {
  const content = `
    <div class="guest-prompt">
      <p>Ingresa un apodo público para usar como invitado (máx. 24 caracteres):</p>
      <input id="guest-nick-input" type="text" maxlength="24" placeholder="Tu apodo" />
      <div style="margin-top:0.6rem; display:flex; gap:0.5rem;">
        <button id="guest-nick-confirm" class="button button-primary">Entrar</button>
        <button id="guest-nick-cancel" class="button button-secondary">Cancelar</button>
      </div>
    </div>
  `;
  openPanel('Entrar como invitado', content);

  // attach listeners after panel is opened
  const input = document.getElementById('guest-nick-input');
  const confirm = document.getElementById('guest-nick-confirm');
  const cancel = document.getElementById('guest-nick-cancel');
  if (input) input.focus();

  function cleanup() {
    confirm?.removeEventListener('click', onConfirm);
    cancel?.removeEventListener('click', onCancel);
  }

  function onConfirm() {
    const nick = input.value.trim() || 'Invitado';
    if (!nick || nick.length === 0) {
      showToast('Por favor ingresa un apodo válido.', 'error');
      return;
    }
    if (nick.length > 24) {
      showToast('El apodo debe tener como máximo 24 caracteres.', 'error');
      return;
    }
    cleanup();
    closePanel();
    enterDashboard('guest', { username: nick });
  }

  function onCancel() {
    cleanup();
    closePanel();
  }

  confirm?.addEventListener('click', onConfirm);
  cancel?.addEventListener('click', onCancel);

  // allow Enter to confirm
  input?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') onConfirm();
  });
}

function initEvents() {
  openThreadButton.addEventListener('click', toggleThreadForm);
  headerCreateThreadButton.addEventListener('click', toggleThreadForm);
  registrationForm.addEventListener('submit', handleRegistrationSubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);
  threadForm.addEventListener('submit', handleThreadSubmit);
  guestEntranceButton.addEventListener('click', () => openGuestPrompt());
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  if (headerGuestButton) headerGuestButton.addEventListener('click', () => openGuestPrompt());
  signInButton.addEventListener('click', () => setLaunchSection('login'));
  createAccountButton.addEventListener('click', () => setLaunchSection('register'));
  visitForumButton.addEventListener('click', () => openPlaceholder('Foro'));
  chatAccessButton.addEventListener('click', () => openPlaceholder('Chat privado'));
  profileButton.addEventListener('click', () => openPlaceholder('Perfil'));
  notificationsButton.addEventListener('click', () => openPlaceholder('Notificaciones'));
  if (profileAccessButton) {
    profileAccessButton.addEventListener('click', () => openPlaceholder('Perfil'));
  }
  if (notificationsAccessButton) {
    notificationsAccessButton.addEventListener('click', () => openPlaceholder('Notificaciones'));
  }
  if (menuToggleButton) {
    menuToggleButton.addEventListener('click', toggleMobileMenu);
  }
  if (panelCloseButton) {
    panelCloseButton.addEventListener('click', closePanel);
  }
  if (panelOverlay) {
    panelOverlay.addEventListener('click', (event) => {
      if (event.target === panelOverlay) {
        closePanel();
      }
    });
  }
  if (threadsContainer) {
    threadsContainer.addEventListener('click', (event) => {
      const button = event.target.closest('.thread-view-button');
      if (!button) return;
      const card = button.closest('.thread-card');
      const index = card?.dataset.index;
      if (index == null) return;
      const thread = currentThreads[Number(index)];
      if (!thread) return;
      openThreadDetail(thread);
    });
  }
  searchInput.addEventListener('input', (event) => {
    filterThreads(event.target.value);
  });
}

// Delegated fallback: ensure guest buttons always open the guest prompt
document.addEventListener('click', (e) => {
  try {
    const btn = e.target.closest && e.target.closest('#guest-entrance-button, #guest-access-button');
    if (btn) {
      e.preventDefault();
      openGuestPrompt();
    }
  } catch (err) {
    // ignore
  }
});

// Notifications: fetch from API and render
async function fetchNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('no notifications');
    const data = await res.json();
    notificationsLocal = Array.isArray(data) ? data : [];
    renderNotifications();
  } catch (err) {
    console.error('fetchNotifications', err);
  }
}

async function clearNotifications() {
  try {
    const res = await fetch('/api/notifications/clear', { method: 'POST' });
    if (!res.ok) throw new Error('clear failed');
    notificationsLocal = [];
    renderNotifications();
    showToast('Notificaciones borradas.', 'info');
  } catch (err) {
    console.error(err);
    showToast('No se pudieron borrar las notificaciones.', 'error');
  }
}

// --- Notificaciones / estado de usuario ---
function renderNotifications() {
  const list = document.getElementById('notifications-list');
  const badge = document.getElementById('notif-badge');
  if (!list) return;
  if (!notificationsLocal.length) {
    list.innerHTML = '<p class="threads-placeholder">No tienes notificaciones nuevas.</p>';
    if (badge) badge.classList.add('hidden');
    return;
  }

  list.innerHTML = `<ul class="notifications-list">${notificationsLocal
    .map((n) => `<li class="notification-item"><strong>${n.text}</strong><span class="notif-time">${n.time || ''}</span></li>`)
    .join('')}</ul>`;
  if (badge) {
    badge.textContent = notificationsLocal.length;
    badge.classList.remove('hidden');
  }
}

// old clearNotifications removed; use clearNotifications() that calls the API (defined earlier)

async function loadCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (!res.ok) {
      currentUser = null;
      return;
    }
    currentUser = await res.json();
  } catch (err) {
    console.error('loadCurrentUser', err);
    currentUser = null;
  }
}

function resetSession() {
  currentUser = null;
  updateUserStatus(false);
  showElement(logoutButton, false);
}

function showProfileSection(profile) {
  const publicCourse = profile.publicCourse ? `Curso público: ${profile.course}` : `Curso privado: ${profile.course}`;
  const avatar = profile.avatarUrl ? `<img src="${profile.avatarUrl}" alt="Avatar de ${profile.displayName}" class="profile-avatar" />` : '<div class="profile-avatar profile-avatar-placeholder">?</div>';
  const editable = profile.id === currentUser?.id;
  return `
    <article class="card card-form soft-card profile-panel">
      <div class="profile-header">
        ${avatar}
        <div>
          <h2>${profile.displayName || profile.username}</h2>
          <p>${profile.username}</p>
          <p>${publicCourse}</p>
          <p>Miembro desde ${new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <p>${profile.bio || 'Sin biografía todavía.'}</p>
      ${editable ? `
        <form id="profile-edit-form" class="form profile-edit-form">
          <div class="form-group">
            <label for="profile-displayName">Nombre visible</label>
            <input id="profile-displayName" name="displayName" type="text" value="${profile.displayName || ''}" required />
          </div>
          <div class="form-group">
            <label for="profile-course">Curso</label>
            <input id="profile-course" name="course" type="text" value="${profile.course || ''}" required />
          </div>
          <div class="form-group">
            <label for="profile-bio">Biografía</label>
            <textarea id="profile-bio" name="bio" rows="4">${profile.bio || ''}</textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="button button-primary">Guardar perfil</button>
          </div>
        </form>
      ` : ''}
    </article>
  `;
}

async function openProfilePanel() {
  if (!currentUser) {
    openPanel('Perfil', '<p>Accede para ver tu perfil y editar tu información.</p>');
    return;
  }

  try {
    const res = await fetch(`/api/users/${currentUser.id}`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Perfil no disponible');
    const profile = await res.json();
    openPanel('Perfil', showProfileSection(profile));

    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
      editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = editForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        try {
          const body = {
            displayName: editForm['displayName'].value.trim(),
            course: editForm['course'].value.trim(),
            bio: editForm['bio'].value.trim(),
            avatarUrl: profile.avatarUrl || '',
          };
          const saveRes = await fetch(`/api/users/${currentUser.id}`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!saveRes.ok) {
            const errorJson = await saveRes.json().catch(() => ({}));
            throw new Error(errorJson.error || 'No se pudo guardar el perfil');
          }
          const updated = await saveRes.json();
          currentUser = { ...currentUser, displayName: updated.displayName, course: updated.course };
          showToast('Perfil actualizado.', 'info');
          openProfilePanel();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Error al guardar perfil.', 'error');
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  } catch (err) {
    console.error('openProfilePanel', err);
    openPanel('Perfil', '<p>No se pudo cargar el perfil.</p>');
  }
}

async function openNotificationsPanel() {
  openPanel('Notificaciones', '<div id="notifications-list">Cargando notificaciones...</div>');
  await fetchNotifications();
  const content = document.getElementById('panel-content');
  if (!content) return;
  const buttonHtml = currentUser
    ? '<div class="form-actions"><button id="clear-notifications-button" type="button" class="button button-secondary">Borrar notificaciones</button></div>'
    : '';
  content.innerHTML = `<div id="notifications-list">${notificationsLocal.length ? '' : '<p>Cargando notificaciones...</p>'}</div>${buttonHtml}`;
  renderNotifications();
  const clearButton = document.getElementById('clear-notifications-button');
  if (clearButton) clearButton.addEventListener('click', clearNotifications);
}

function updateUserStatus(connected = true) {
  const el = document.getElementById('user-status');
  const badge = document.getElementById('notif-badge');
  if (!el) return;
  if (connected && currentUser) {
    el.textContent = `${currentUser.displayName || currentUser.username} (Conectado)`;
    el.style.color = 'var(--accent)';
    showElement(logoutButton, true);
    if (badge && notificationsLocal.length) badge.classList.remove('hidden');
  } else if (connected) {
    el.textContent = 'Conectado';
    el.style.color = 'var(--accent)';
    showElement(logoutButton, false);
    if (badge && notificationsLocal.length) badge.classList.remove('hidden');
  } else {
    el.textContent = 'Desconectado';
    el.style.color = 'var(--muted)';
    showElement(logoutButton, false);
  }
}

async function handleLogout() {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!res.ok) throw new Error('logout failed');
  } catch (err) {
    console.error('handleLogout', err);
  } finally {
    resetSession();
    setLaunchSection('login');
    showScreen('launch');
    showToast('Sesión cerrada.', 'info');
  }
}

async function init() {
  initEvents();
  await loadCurrentUser();
  if (currentUser) {
    enterDashboard('login', { username: currentUser.displayName || currentUser.username });
  } else {
    setLaunchSection('register');
    showScreen('launch');
  }
  updateUserStatus(Boolean(currentUser));
  // Load data from backend
  fetchStats();
  fetchThreads();
  fetchNotifications();
}

init();
