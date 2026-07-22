/**
 * auth.js — Stackly client-side authentication
 * Uses localStorage to store registered users and session state.
 * LOGIN: any valid email + any password → instant access (open access mode).
 */

const AUTH_KEY  = 'stackly_users';
const SESS_KEY  = 'stackly_session';

/* ---------- helpers ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}
function getSession() {
  return JSON.parse(localStorage.getItem(SESS_KEY) || 'null');
}
function setSession(user) {
  localStorage.setItem(SESS_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(SESS_KEY);
}
function isLoggedIn() {
  return getSession() !== null;
}

/* ---------- derive display name from email ---------- */
function nameFromEmail(email) {
  const prefix = email.split('@')[0] || 'User';
  return prefix
    .replace(/[._\-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* ---------- sign-up (open — any email accepted) ---------- */
function register(name, email, password) {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    // Already registered — just update name & log in
    existing.name = name || existing.name;
    saveUsers(users);
    setSession({ name: existing.name, email: existing.email });
    return { ok: true };
  }
  const user = { name: name || nameFromEmail(email), email, password };
  users.push(user);
  saveUsers(users);
  setSession({ name: user.name, email: user.email });
  return { ok: true };
}

/* ---------- login (open — ANY email + ANY password) ---------- */
function login(email, password) {
  // Basic email format check
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, msg: 'Please enter a valid email address.' };
  }
  // Require at least 1 character password
  if (!password || password.length < 1) {
    return { ok: false, msg: 'Please enter your password.' };
  }

  // Auto-register if user doesn't exist yet (open access — any mail works)
  const users = getUsers();
  let   user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { name: nameFromEmail(email), email, password };
    users.push(user);
    saveUsers(users);
  }

  setSession({ name: user.name, email: user.email });
  return { ok: true };
}

/* ---------- logout ---------- */
function logout() {
  clearSession();
  window.location.href = 'index.html';
}

/* ---------- update nav buttons ---------- */
function updateNavAuth() {
  // Always keep standard Login and Sign Up buttons visible in the header menu.
}

/* ---------- signup page ---------- */
function initSignup() {
  updateNavAuth();
  if (isLoggedIn()) { window.location.href = 'index.html'; return; }

  const form  = document.getElementById('signup-form');
  const errEl = document.getElementById('signup-error');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name  = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const pass  = document.getElementById('su-pass').value;
    const conf  = document.getElementById('su-confirm').value;

    errEl.style.display = 'none';

    if (name.length < 2) {
      errEl.textContent = 'Please enter your full name.';
      errEl.style.display = 'block'; return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'Please enter a valid email address.';
      errEl.style.display = 'block'; return;
    }
    if (pass.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.';
      errEl.style.display = 'block'; return;
    }
    if (pass !== conf) {
      errEl.textContent = 'Passwords do not match.';
      errEl.style.display = 'block'; return;
    }

    const result = register(name, email, pass);
    if (!result.ok) {
      errEl.textContent = result.msg;
      errEl.style.display = 'block'; return;
    }
    window.location.href = 'index.html';
  });
}

/* ---------- login page ---------- */
function initLogin() {
  updateNavAuth();
  if (isLoggedIn()) { window.location.href = 'index.html'; return; }

  const form  = document.getElementById('login-form');
  const errEl = document.getElementById('login-error');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-pass').value;

    errEl.style.display = 'none';

    const result = login(email, pass);
    if (!result.ok) {
      errEl.textContent = result.msg;
      errEl.style.display = 'block'; return;
    }
    window.location.href = 'index.html';
  });
}
