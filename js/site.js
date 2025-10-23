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
        li.className = 'post-item';
        li.innerHTML = `
          <div>
            <a class="title" href="${p.path}">${p.title}</a>
            <span class="muted meta">— ${date}</span>
            <p class="excerpt clamp-3">${p.excerpt || ''}</p>
          </div>
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

async function loadReading() {
  const categories = [
    { name: 'Parallel Computing', file: 'parallel-computing-reading.json', listId: 'parallel-computing-list', sectionId: 'parallel-computing-section' },
    { name: 'Paper Reading', file: 'paper-reading.json', listId: 'paper-reading-list', sectionId: 'paper-reading-section' },
    { name: 'Deep Learning', file: 'deep-learning-reading.json', listId: 'deep-learning-list', sectionId: 'deep-learning-section' },
    { name: 'Miscellaneous', file: 'reading.json', listId: 'miscellaneous-list', sectionId: 'miscellaneous-section' }
  ];

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

      const badge = (status) => {
        const label = status === 'reading' ? 'Reading' : status === 'to_read' ? 'To read' : status === 'completed' ? 'Completed' : status;
        return `<span class="badge status-${status}">${label}</span>`;
      };

      listEl.innerHTML = '';
      for (const it of items) {
        const li = document.createElement('li');
        const link = it.link ? `<a href="${it.link}" target="_blank" rel="noopener">${it.title}</a>` : it.title;
        const meta = [it.author, new Date(it.dateAdded).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })]
          .filter(Boolean)
          .join(' • ');
        li.innerHTML = `${link} ${badge(it.status)}<div class="muted">${meta}</div>`;
        listEl.appendChild(li);
      }

      // Hide section if no items
      const sectionEl = document.getElementById(cat.sectionId);
      if (sectionEl && items.length === 0) {
        sectionEl.style.display = 'none';
      }

    } catch (e) {
      console.error(e);
    }
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { loadPosts(); loadReading(); });
} else {
  loadPosts();
  loadReading();
}
