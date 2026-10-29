// Central API & Authentication Utility
const API_BASE = (typeof window !== 'undefined' && window.location && (window.location.protocol === 'file:' || (window.location.port !== '5000' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')))
  ? 'http://localhost:5000/api'
  : '/api';

// Helpful disk-access notification banner if opened via file://
if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('fileProtocolWarning')) {
      const banner = document.createElement('div');
      banner.id = 'fileProtocolWarning';
      banner.className = 'alert alert-warning text-center m-0 rounded-0 py-2 border-bottom shadow-sm fw-medium small';
      banner.style.position = 'sticky';
      banner.style.top = '0';
      banner.style.zIndex = '10500';
      banner.innerHTML = `<i class="bi bi-info-circle-fill me-1 text-warning"></i> Tip: You opened this file directly from your disk (<code>file://</code>). For the best experience and database connectivity, open <a href="http://localhost:5000" class="alert-link fw-bold text-decoration-underline">http://localhost:5000</a> in your browser.`;
      document.body.prepend(banner);
    }
  });
}

// Authentication storage helpers
const Auth = {
  getToken() {
    return localStorage.getItem('crbs_token');
  },
  setToken(token) {
    localStorage.setItem('crbs_token', token);
  },
  getUser() {
    try {
      const u = localStorage.getItem('crbs_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('crbs_user', JSON.stringify(user));
  },
  logout(redirect = true) {
    localStorage.removeItem('crbs_token');
    localStorage.removeItem('crbs_user');
    if (redirect) {
      const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
      window.location.href = isFile ? 'login.html' : '/login.html';
    }
  },
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },
  requireAuth(allowedRoles = []) {
    const isFile = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    if (!this.isAuthenticated()) {
      const loginTarget = isFile ? 'login.html' : `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      window.location.href = loginTarget;
      return false;
    }
    const user = this.getUser();
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Access Restricted: This page requires ${allowedRoles.join(' or ')} privileges.`);
      // Redirect to their respective dashboard
      if (user.role === 'admin') window.location.href = isFile ? 'admin-dashboard.html' : '/admin-dashboard.html';
      else if (user.role === 'faculty' || user.role === 'staff') window.location.href = isFile ? 'faculty-dashboard.html' : '/faculty-dashboard.html';
      else window.location.href = isFile ? 'student-dashboard.html' : '/student-dashboard.html';
      return false;
    }
    return true;
  }
};

// Generic Fetch Wrapper with Bearer token injection
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = Auth.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));

    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      const hadToken = !!Auth.getToken();
      Auth.logout(false);
      
      const publicPages = ['/index.html', '/', '/login.html', '/register.html', '/classrooms.html', '/classroom-details.html', '/calendar.html', '/resources.html'];
      const currentPath = window.location.pathname;
      const isPublic = publicPages.some(p => currentPath === p || (p !== '/' && currentPath.endsWith(p)));

      if (!isPublic && hadToken) {
        window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
      }
      return { success: false, message: 'Authentication required or session expired.' };
    }

    return { ...data, statusCode: res.status, ok: res.ok };
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    return {
      success: false,
      message: 'Network connection failed. Please check if the server is running.',
      error: err.message
    };
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  const bgClasses = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-primary text-white'
  };

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center border-0 shadow ${bgClasses[type] || bgClasses.info}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-medium">${message}</div>
      <button type="button" class="btn-close ${type !== 'warning' ? 'btn-close-white' : ''} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  if (window.bootstrap && bootstrap.Toast) {
    const toast = new bootstrap.Toast(toastEl, { delay: 4500 });
    toast.show();
  } else {
    // Fallback if bootstrap JS is loading
    setTimeout(() => toastEl.remove(), 4500);
  }
}

// Format helpers
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

function formatStatusBadge(status) {
  switch (status) {
    case 'Approved':
      return '<span class="badge badge-approved"><i class="bi bi-check-circle-fill me-1"></i>Approved</span>';
    case 'Pending':
      return '<span class="badge badge-pending"><i class="bi bi-clock-fill me-1"></i>Pending</span>';
    case 'Rejected':
      return '<span class="badge badge-rejected"><i class="bi bi-x-circle-fill me-1"></i>Rejected</span>';
    case 'Cancelled':
      return '<span class="badge badge-cancelled"><i class="bi bi-slash-circle me-1"></i>Cancelled</span>';
    default:
      return `<span class="badge bg-secondary">${status}</span>`;
  }
}

// Render Uniform Navbar
function renderNavbar(activePage = '') {
  const navContainer = document.getElementById('navbarMount');
  if (!navContainer) return;

  const user = Auth.getUser();
  const isAuth = Auth.isAuthenticated();

  let dashboardUrl = '/login.html';
  let dashboardName = 'Dashboard';
  if (user) {
    if (user.role === 'admin') {
      dashboardUrl = '/admin-dashboard.html';
      dashboardName = 'Admin Dashboard';
    } else if (user.role === 'faculty' || user.role === 'staff') {
      dashboardUrl = '/faculty-dashboard.html';
      dashboardName = user.role === 'staff' ? 'Staff Portal' : 'Faculty Dashboard';
    } else {
      dashboardUrl = '/student-dashboard.html';
      dashboardName = 'Student Dashboard';
    }
  }

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div class="container-fluid">
        <a class="navbar-brand" href="/index.html">
          <i class="bi bi-mortarboard-fill text-white fs-4 me-2"></i>
          <span>Classroom Resource Booking System</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="/index.html"><i class="bi bi-house me-1"></i>Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'classrooms' ? 'active' : ''}" href="/classrooms.html"><i class="bi bi-door-open me-1"></i>Classrooms</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'calendar' ? 'active' : ''}" href="/calendar.html"><i class="bi bi-calendar3 me-1"></i>Schedule</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'resources' ? 'active' : ''}" href="/resources.html"><i class="bi bi-cpu me-1"></i>Equipment</a>
            </li>
            ${
              isAuth
                ? `
              <li class="nav-item">
                <a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="${dashboardUrl}">
                  <i class="bi bi-speedometer2 me-1"></i>${dashboardName}
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'booking' ? 'active' : ''}" href="/booking.html"><i class="bi bi-calendar-plus me-1"></i>Book Room</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'my-bookings' ? 'active' : ''}" href="/my-bookings.html"><i class="bi bi-journal-bookmark me-1"></i>My Bookings</a>
              </li>
              ${
                user.role === 'admin'
                  ? `<li class="nav-item"><a class="nav-link ${activePage === 'reports' ? 'active' : ''}" href="/reports.html"><i class="bi bi-graph-up me-1"></i>Reports</a></li>`
                  : ''
              }
            `
                : ''
            }
          </ul>
          <ul class="navbar-nav ms-auto align-items-center">
            ${
              isAuth
                ? `
              <li class="nav-item me-2">
                <a class="nav-link position-relative ${activePage === 'notifications' ? 'active' : ''}" href="/notifications.html" title="Notifications">
                  <i class="bi bi-bell fs-5"></i>
                  <span id="navUnreadBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">0</span>
                </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <div class="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.85rem;">
                    ${user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>${user.name}</span>
                  <span class="badge bg-info text-dark text-capitalize ms-1">${user.role}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  <li><h6 class="dropdown-header text-truncate" style="max-width: 200px;">${user.email}</h6></li>
                  <li><a class="dropdown-item" href="${dashboardUrl}"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
                  <li><a class="dropdown-item" href="/profile.html"><i class="bi bi-person me-2"></i>My Profile</a></li>
                  <li><a class="dropdown-item" href="/my-bookings.html"><i class="bi bi-calendar-check me-2"></i>My Bookings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="Auth.logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </li>
            `
                : `
              <li class="nav-item me-2">
                <a class="btn btn-outline-light btn-sm px-3" href="/login.html">Login</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-warning btn-sm px-3 text-dark fw-semibold" href="/register.html">Register</a>
              </li>
            `
            }
          </ul>
        </div>
      </div>
    </nav>
  `;

  if (isAuth) {
    updateNotificationBadge();
  }
}

// Update unread notification count on navbar badge
async function updateNotificationBadge() {
  const badge = document.getElementById('navUnreadBadge');
  if (!badge) return;

  const res = await fetchApi('/notifications');
  if (res.success && res.unreadCount > 0) {
    badge.textContent = res.unreadCount;
    badge.classList.remove('d-none');
  } else {
    badge.classList.add('d-none');
  }
}

// Render Uniform Footer
function renderFooter() {
  const footerContainer = document.getElementById('footerMount');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer>
      <div class="container text-center">
        <p class="mb-1 fw-semibold text-dark">Classroom Resource Booking System (CRBS)</p>
        <p class="mb-1 text-muted">Web Technology (23CS2048) — Third Internal Assessment (IA3)</p>
        <p class="mb-0 text-muted" style="font-size: 0.8rem;">Full Stack Solo Project • Node.js • Express • MongoDB • Bootstrap 5</p>
      </div>
    </footer>
  `;
}

// Render Navy Blue Sidebar for Dashboards
function renderSidebar(activeItem = 'dashboard') {
  const mount = document.getElementById('sidebarMount');
  if (!mount) return;

  const user = Auth.getUser() || { name: 'User', role: 'student', email: '' };
  const isAdmin = user.role === 'admin';
  const isFacultyOrStaff = user.role === 'faculty' || user.role === 'staff';

  const userInitial = user.name ? user.name[0].toUpperCase() : 'U';

  let roleDashboard = '/student-dashboard.html';
  if (isAdmin) roleDashboard = '/admin-dashboard.html';
  else if (isFacultyOrStaff) roleDashboard = '/faculty-dashboard.html';

  mount.innerHTML = `
    <!-- Mobile Backdrop -->
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebar(false)"></div>

    <!-- Navy Blue Sidebar -->
    <aside class="sidebar-navy" id="appSidebar">
      <div class="sidebar-brand-container">
        <a class="sidebar-brand" href="/index.html">
          <div class="brand-icon-wrapper">
            <i class="bi bi-mortarboard-fill"></i>
          </div>
          <div class="brand-text">
            <span class="brand-title">Classroom System</span>
            <span class="brand-subtitle">Resource Portal</span>
          </div>
        </a>
      </div>

      <div class="sidebar-user-pill">
        <div class="user-avatar-sm">${userInitial}</div>
        <div class="user-meta text-truncate">
          <span class="user-name text-truncate">${user.name}</span>
          <span class="user-role-badge">${user.role}</span>
        </div>
      </div>

      <div class="sidebar-menu-wrapper">
        <div class="sidebar-heading">Main Menu</div>
        <ul class="sidebar-menu">
          <li>
            <a class="sidebar-nav-link ${activeItem === 'dashboard' ? 'active' : ''}" href="${roleDashboard}">
              <i class="bi bi-grid-fill"></i><span>Dashboard</span>
            </a>
          </li>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'booking' ? 'active' : ''}" href="/booking.html">
              <i class="bi bi-calendar-plus-fill"></i><span>Book Resource</span>
            </a>
          </li>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'my-bookings' ? 'active' : ''}" href="/my-bookings.html">
              <i class="bi bi-journal-bookmark-fill"></i><span>My Bookings</span>
            </a>
          </li>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'resources' || activeItem === 'classrooms' ? 'active' : ''}" href="/classrooms.html">
              <i class="bi bi-collection-fill"></i><span>Resources</span>
            </a>
          </li>

          ${isAdmin ? `
          <div class="sidebar-heading mt-3">Administration</div>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'admin' || activeItem === 'admin-approvals' ? 'active' : ''}" href="/admin-dashboard.html">
              <i class="bi bi-shield-lock-fill"></i><span>Admin Approvals</span>
            </a>
          </li>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'reports' ? 'active' : ''}" href="/reports.html">
              <i class="bi bi-graph-up"></i><span>Reports & Analytics</span>
            </a>
          </li>
          ` : ''}

          <div class="sidebar-heading mt-3">Account</div>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'notifications' ? 'active' : ''}" href="/notifications.html">
              <i class="bi bi-bell-fill"></i><span>Notifications</span>
              <span class="badge bg-danger rounded-pill d-none" id="sidebarNotifBadge">0</span>
            </a>
          </li>
          <li>
            <a class="sidebar-nav-link ${activeItem === 'profile' ? 'active' : ''}" href="/profile.html">
              <i class="bi bi-person-fill"></i><span>Profile</span>
            </a>
          </li>
          <li>
            <a class="sidebar-nav-link sidebar-logout-link" href="javascript:void(0)" onclick="Auth.logout()">
              <i class="bi bi-box-arrow-right"></i><span>Sign Out</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  `;

  // Update notification badge on sidebar
  fetchApi('/notifications').then(res => {
    if (res && res.success && res.unreadCount > 0) {
      const b = document.getElementById('sidebarNotifBadge');
      if (b) {
        b.textContent = res.unreadCount;
        b.classList.remove('d-none');
      }
    }
  });
}

function toggleSidebar(forceState) {
  const sb = document.getElementById('appSidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (!sb) return;

  const show = forceState !== undefined ? forceState : !sb.classList.contains('show');
  if (show) {
    sb.classList.add('show');
    if (bd) bd.classList.add('show');
  } else {
    sb.classList.remove('show');
    if (bd) bd.classList.remove('show');
  }
}
