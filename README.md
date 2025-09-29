# My Minimal Website

A lightweight, minimalist personal website with simple pages and a clean navigation bar.

## Structure

- `index.html` — Home
- `about.html` — Redirects to Home (About content lives on Home)
- `blogs.html` — Blog list
- `reading.html` — My reading list
- `contact.html` — Contact details
- `posts/hello-world.html` — Sample blog post
- `css/style.css` — Shared styles
- `data/posts.json` — Posts manifest powering Blogs and Latest Post
- `data/reading.json` — Reading list items
- `js/site.js` — Minimal JS to fetch and render posts

## Local Preview

- Double click `index.html` to open it in your browser, or
- Use a simple local server (optional):
  - Python: `python -m http.server 8000`
  - Node: `npx serve .`

Then visit http://localhost:8000

Note: The blogs page and the latest post on the homepage load data via `fetch`, which requires running from a local server (file:// will block fetch). Use one of the servers above.

## Deployment

This is a static site. You can deploy it on many hosts:

- Netlify: Drag and drop the folder into Netlify Drop at https://app.netlify.com/drop
- GitHub Pages:
  1. Create a new repo and push these files.
  2. In repo Settings → Pages, choose branch `main` (root) and save.
  3. Your site will be live at `https://<username>.github.io/<repo>/`.
- Cloudflare Pages: Create a new project from your GitHub repo and deploy.

No build step required.

## Customize

- Replace the name and bio in `index.html`.
- Update contact links in `contact.html`.
- Add posts by copying `posts/hello-world.html` and linking them from `blogs.html`.

### Avatar / Profile photo

- The homepage shows an avatar at `images/avatar.svg`.
- Replace this with your own image (recommended 160×160 or 512×512) and update the `<img>` `src` in `index.html` if you change the filename.
- Styles used: `.hero-grid` and `.avatar` in `css/style.css`.

### About page

- The About link was removed to keep navigation minimal, and `about.html` now redirects to the homepage.
- If you prefer a separate About page, restore content in `about.html` and add the About link back into each page’s navigation bar.

## Add or remove blog posts

Posts are plain HTML files in the `posts/` folder. The list and latest post are driven by `data/posts.json`.

Add a post:
1. Copy `posts/hello-world.html` to `posts/<your-slug>.html` and edit the content.
2. Add an entry to `data/posts.json` at the top of the array (newest first):
   ```json
   {
     "title": "My New Post",
     "slug": "my-new-post",
     "path": "posts/my-new-post.html",
     "date": "2025-09-15",
     "excerpt": "One-line summary of the post."
   }
   ```

Remove a post:
1. Delete the file from `posts/`.
2. Remove its object from `data/posts.json`.

Change order:
- `js/site.js` sorts posts by `date` descending. Ensure your `date` strings are ISO format `YYYY-MM-DD`.

## Manage the reading list

Reading items live in `data/reading.json` and are rendered on `reading.html`.

Each item fields:
- `title` (string)
- `author` (string)
- `status` (one of: `reading`, `to_read`, `completed`)
- `link` (optional URL)
- `notes` (optional)
- `dateAdded` (YYYY-MM-DD)

Ordering:
- Items are grouped by status in the order: reading → to_read → completed.
- Within the same status they are sorted by `dateAdded` (newest first).

Add an item:
1. Add an object to `data/reading.json` with the fields above.

Remove an item:
1. Delete its object from `data/reading.json`.
