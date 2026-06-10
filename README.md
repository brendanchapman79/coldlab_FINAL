# [cold_lab] website — maintainer guide

Live site: **coldlab.org** · Repo: `brendanchapman79/coldlab_FINAL`

Deployments are automatic — every push to `main` triggers Netlify to rebuild and publish within ~30 seconds.

---

## Repo structure

```
coldlab_FINAL/
├── index.html                  ← homepage (self-contained, CSS inline)
├── about.html
├── our_team.html
├── research.html
├── publications.html           ← pulls live from ORCID, no manual updates needed
├── ccr.html
├── community.html
├── education.html
│
├── assets/
│   ├── css/
│   │   └── style.css           ← all styling, edit here for design changes
│   ├── js/
│   │   └── site.js             ← nav injection, markdown renderer, ORCID loader, team photos
│   └── img/
│       ├── logo/
│       │   ├── icon.svg        ← nav logo mark
│       │   ├── full.svg        ← full logo with wordmark
│       │   └── favicon.svg     ← browser tab icon
│       └── [name].jpg          ← team headshots (e.g. brendan-chapman.jpg)
│
├── content/
│   └── pages/
│       ├── about.md            ← edit page content here (markdown)
│       ├── our_team.md         ← team bios — add/remove people here
│       ├── research.md
│       ├── ccr.md
│       ├── community.md
│       └── education.md
│
├── partials/
│   ├── nav.html                ← shared navigation bar
│   └── footer.html             ← shared footer
│
├── robots.txt
├── sitemap.xml
└── netlify.toml                ← Netlify config (redirects, cache headers)
```

---

## One-time setup (already done — kept here for reference)

### Clone the repo
```bash
cd "/Users/brendanchapman/Library/CloudStorage/OneDrive-MurdochUniversity/Documents/Murdoch/2- RESEARCH/Research Lab/Webpage"
git clone https://github.com/brendanchapman79/coldlab_FINAL.git
cd coldlab_FINAL
```

### Authenticate with GitHub (Personal Access Token)

GitHub does not accept passwords — you need a Personal Access Token (PAT).

**To generate one:**
1. github.com → profile photo → **Settings**
2. Bottom of left sidebar → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
4. Name it (e.g. "MacBook"), set expiry, tick **`repo`**, click **Generate token**
5. Copy the token immediately (`ghp_xxxxxxxxxxxxxx`) — you won't see it again

**To save it so you're never prompted again:**
```bash
git remote set-url origin https://brendanchapman79:YOUR_TOKEN_HERE@github.com/brendanchapman79/coldlab_FINAL.git
```

---

## Making and publishing changes

### Step 1 — Open Terminal

Terminal is at **Applications → Utilities → Terminal**
(or Spotlight: `Cmd+Space` → type `terminal`)

### Step 2 — Navigate to the repo

```bash
cd "/Users/brendanchapman/Library/CloudStorage/OneDrive-MurdochUniversity/Documents/Murdoch/2- RESEARCH/Research Lab/Webpage/coldlab_FINAL"
```

Tip: drag the folder from Finder onto the Terminal window instead of typing the path.

### Step 3 — Edit your files

Make changes in Finder / any text editor. The most common updates:

| What you want to change | File to edit |
|------------------------|--------------|
| Team bios, add/remove a researcher | `content/pages/our_team.md` |
| About page text | `content/pages/about.md` |
| Research areas | `content/pages/research.md` |
| Cold case review page | `content/pages/ccr.md` |
| Community/collaborators | `content/pages/community.md` |
| Education / courses | `content/pages/education.md` |
| Nav links or footer | `partials/nav.html` or `partials/footer.html` |
| Colours, fonts, layout | `assets/css/style.css` |
| Homepage content | `index.html` |
| Team headshot photos | Add `firstname-lastname.jpg` to `assets/img/` |

### Step 4 — Check what you've changed (optional but good habit)

```bash
git status
```

This lists every file you've modified. Green = staged, red = not yet staged.

### Step 5 — Stage, commit, and push

```bash
git add .
git commit -m "brief note about what you changed"
git push
```

**What each command does:**

- `git add .` — stages all changed files, ready to commit
- `git commit -m "..."` — saves a snapshot with a description. Write anything useful, e.g.:
  - `"add Sara Natale bio"`
  - `"update community collaborators list"`
  - `"fix typo on about page"`
- `git push` — sends your commit to GitHub, which triggers Netlify to deploy

**Full example:**

```bash
cd "/Users/brendanchapman/Library/CloudStorage/OneDrive-MurdochUniversity/Documents/Murdoch/2- RESEARCH/Research Lab/Webpage/coldlab_FINAL"
git add .
git commit -m "update research areas"
git push
```

The site will be live at coldlab.org within ~30 seconds of pushing.

---

## Common tasks

### Adding a new team member

1. Add their bio to `content/pages/our_team.md` following the existing format:
```markdown
### Firstname Lastname, PhD Candidate
Bio text here.
```
2. Add their headshot as `assets/img/firstname-lastname.jpg` (square crop recommended, min 200×200px)
3. Add their name to the `PHOTO_MEMBERS` array in `assets/js/site.js`:
```javascript
const PHOTO_MEMBERS = [
  'Dr Brendan Chapman',
  'Sara Natale',
  ...
  'New Person',   ← add here
];
```
4. Stage, commit, push.

### Removing a team member

1. Delete their section from `content/pages/our_team.md`
2. Remove their name from `PHOTO_MEMBERS` in `site.js`
3. Optionally delete their photo from `assets/img/`
4. Stage, commit, push.

### Publications

Publications are pulled live from ORCID (ID: `0000-0001-7518-6645`) — no manual updates needed. Any publication you add to your ORCID profile will appear automatically on the next page load.

---

## If something goes wrong

**Pushed something you want to undo:**
```bash
git revert HEAD
git push
```
This creates a new commit that undoes the last one — safe, doesn't rewrite history.

**See a log of recent changes:**
```bash
git log --oneline -10
```

**Pull latest version from GitHub** (if editing on multiple machines):
```bash
git pull
```
Always `git pull` before starting work if you edit from more than one computer.
