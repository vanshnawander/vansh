// Shared header and footer — injected into every page
// Eliminates duplication of header/footer HTML across pages

function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  return filename;
}

function renderHeader() {
  const current = getCurrentPage();
  const navItems = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'blogs.html', label: 'Blogs' },
    { href: 'reading.html', label: 'Reading' },
    { href: 'resume/VANSH_RESUME.pdf', label: 'CV', external: true },
    { href: 'contact.html', label: 'Contact' },
  ];

  const navLinks = navItems.map(item => {
    const isActive = item.href === current;
    const externalAttr = item.external ? ' target="_blank"' : '';
    return `<a class="nav-link${isActive ? ' active' : ''}" href="${item.href}"${externalAttr}>${item.label}</a>`;
  }).join('\n          ');

  const headerHTML = `
    <header class="site-header">
      <div class="container">
        <a class="brand" href="index.html">Vansh Nawander</a>
        <nav class="nav">
          ${navLinks}
        </nav>
        <button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>`;

  const mount = document.getElementById('site-header');
  if (mount) {
    mount.outerHTML = headerHTML;
  }
}

function renderFooter() {
  const year = new Date().getFullYear();
  const footerHTML = `
    <footer class="site-footer">
      <div class="container">
        <p>&copy; ${year} Vansh Nawander</p>
      </div>
    </footer>`;

  const mount = document.getElementById('site-footer');
  if (mount) {
    mount.outerHTML = footerHTML;
  }
}

// Inject header and footer as early as possible
function injectComponents() {
  renderHeader();
  renderFooter();
}

// Run immediately if DOM is already parsed, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectComponents);
} else {
  injectComponents();
}
