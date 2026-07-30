// Mobile hamburger nav toggle
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });
  // Close nav when a link is clicked (useful for single-page feel)
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

async function loadPosts() {
  try {
    const res = await fetch('data/posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load posts.json');
    const posts = await res.json();
    // sort by date desc
    posts.sort((a, b) => (a.date < b.date ? 1 : -1));

    const listEl = document.getElementById('posts-list');
    if (listEl) {
      listEl.innerHTML = '';
      for (const p of posts) {
        const li = document.createElement('li');
        const date = new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
        li.innerHTML = `
          <a class="post-item" href="${p.path}">
            <span class="title">${p.title}</span>
            <span class="meta">${date}</span>
            <p class="excerpt clamp-3">${p.excerpt || ''}</p>
          </a>
        `;
        listEl.appendChild(li);
      }
    }

    const latestEl = document.getElementById('latest-post');
    if (latestEl && posts.length > 0) {
      const latest = posts[0];
      latestEl.innerHTML = `<a href="${latest.path}">${latest.title}</a> <span class="muted">— ${new Date(latest.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</span>`;
    }
  } catch (e) {
    console.error(e);
  }
}

// Global state to track pagination, items, and active filters for each reading list
const readingState = {};
let activeTagFilter = 'ALL';

async function loadReading() {
  const categories = [
    { name: 'Diffusion', file: 'diffusion-reading.json', listId: 'diffusion-list', sectionId: 'diffusion-section' },
    { name: 'Deep Learning', file: 'deep-learning-reading.json', listId: 'deep-learning-list', sectionId: 'deep-learning-section' },
    { name: 'Attention Mechanism', file: 'attention-reading.json', listId: 'attention-list', sectionId: 'attention-section' },
    { name: 'Parallel Computing', file: 'parallel-computing-reading.json', listId: 'parallel-computing-list', sectionId: 'parallel-computing-section' },
    { name: 'Paper Reading', file: 'paper-reading.json', listId: 'paper-reading-list', sectionId: 'paper-reading-section' },
    { name: 'OCR', file: 'ocr-reading.json', listId: 'ocr-list', sectionId: 'ocr-section' },
    { name: 'Speech', file: 'speech-reading.json', listId: 'speech-list', sectionId: 'speech-section' },
    { name: 'Speculative Decoding', file: 'speculative-decoding-reading.json', listId: 'speculative-decoding-list', sectionId: 'speculative-decoding-section' },
    { name: 'Architecture and Internal Components', file: 'architecture-reading.json', listId: 'architecture-list', sectionId: 'architecture-section' },
    { name: 'Miscellaneous', file: 'reading.json', listId: 'miscellaneous-list', sectionId: 'miscellaneous-section' }
  ];

  // Render filter bar container
  renderFilterBar();

  for (const cat of categories) {
    try {
      const listEl = document.getElementById(cat.listId);
      if (!listEl) continue; // Not on reading page

      const res = await fetch(`data/${cat.file}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load ${cat.file}`);
      const items = await res.json();

      // sort: reading, to_read, completed, then by dateAdded desc
      const order = { reading: 0, to_read: 1, completed: 2 };
      items.sort((a, b) => {
        const so = (order[a.status] ?? 99) - (order[b.status] ?? 99);
        if (so !== 0) return so;
        return (a.dateAdded < b.dateAdded) ? 1 : -1;
      });

      // Initialize state for this category
      readingState[cat.listId] = {
        items: items,
        currentPage: 1,
        pageSize: 5,
        cat: cat
      };

      renderCategoryList(cat.listId);

    } catch (e) {
      console.error(e);
    }
  }
}

function renderFilterBar() {
  const filterBar = document.getElementById('tag-filter-bar');
  if (!filterBar) return;

  const tags = ['ALL', 'VVVIP', 'VVIP', 'VIP', 'GOOD'];
  filterBar.innerHTML = '';

  for (const tag of tags) {
    const pill = document.createElement('button');
    const isAll = tag === 'ALL';
    pill.className = `filter-pill ${tag === activeTagFilter ? 'active' : ''} ${!isAll ? 'filter-' + tag.toLowerCase() : ''}`;
    pill.innerText = isAll ? 'All Items' : tag;
    pill.onclick = () => selectFilter(tag);
    filterBar.appendChild(pill);
  }
}

function selectFilter(tag) {
  activeTagFilter = tag;
  renderFilterBar();
  // Reset all categories to page 1 and re-render
  for (const listId in readingState) {
    readingState[listId].currentPage = 1;
    renderCategoryList(listId);
  }
}

function renderCategoryList(listId) {
  const state = readingState[listId];
  if (!state) return;

  const listEl = document.getElementById(listId);
  if (!listEl) return;

  const { items, currentPage, pageSize, cat } = state;

  // Filter items based on active tag filter
  let filteredItems = items;
  if (activeTagFilter !== 'ALL') {
    filteredItems = items.filter(it => it.tag && it.tag.toUpperCase() === activeTagFilter);
  }

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Toggle list section visibility depending on item count
  const sectionEl = document.getElementById(cat.sectionId);
  if (sectionEl) {
    if (totalItems === 0) {
      sectionEl.style.display = 'none';
      return; // Skip rendering
    } else {
      sectionEl.style.display = '';
    }
  }

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageItems = filteredItems.slice(startIndex, endIndex);

  const badge = (status) => {
    const label = status === 'reading' ? 'Reading' : status === 'to_read' ? 'To read' : status === 'completed' ? 'Completed' : status;
    return `<span class="badge status-${status}">${label}</span>`;
  };

  const tagBadge = (tag) => {
    if (!tag) return '';
    const cleanTag = tag.toUpperCase();
    return `<span class="badge tag-${cleanTag.toLowerCase()}">${cleanTag}</span>`;
  };

  listEl.innerHTML = '';
  for (const it of pageItems) {
    const li = document.createElement('li');
    li.className = 'reading-item';
    const link = it.link ? `<a href="${it.link}" target="_blank" rel="noopener">${it.title}</a>` : it.title;
    const meta = [it.author, new Date(it.dateAdded).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })]
      .filter(Boolean)
      .join(' • ');
    li.innerHTML = `
      <div class="reading-item-body">
        <div class="reading-item-title">${link}</div>
        <div class="reading-item-meta">${meta}</div>
      </div>
      <div class="reading-item-badges">
        ${tagBadge(it.tag)}
        ${badge(it.status)}
      </div>
    `;
    listEl.appendChild(li);
  }

  // Render pagination controls
  const oldPagination = document.getElementById(`${listId}-pagination`);
  if (oldPagination) oldPagination.remove();

  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.id = `${listId}-pagination`;
    paginationContainer.className = 'pagination-controls';
    paginationContainer.innerHTML = `
      <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage('${listId}', ${currentPage - 1})" aria-label="Previous page">←</button>
      <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
      <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage('${listId}', ${currentPage + 1})" aria-label="Next page">→</button>
    `;
    listEl.parentNode.appendChild(paginationContainer);
  }
}

function changePage(listId, newPage) {
  const state = readingState[listId];
  if (!state) return;
  state.currentPage = newPage;
  renderCategoryList(listId);
}

// Make globally available
window.changePage = changePage;
window.selectFilter = selectFilter;

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { initNavToggle(); loadPosts(); loadReading(); });
} else {
  initNavToggle();
  loadPosts();
  loadReading();
}
