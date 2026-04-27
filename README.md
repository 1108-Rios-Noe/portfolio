# portfolio
Portfolio website featuring many of my creations.

## Local preview

To preview the site locally, serve the folder with a simple static server and open http://localhost:8000 in your browser. Example using Python 3:

```bash
cd /workspaces/portfolio
python3 -m http.server 8000
```

Or use `npx http-server` if you prefer Node:

```bash
npx http-server -p 8000
```

The main entry is `index.html`. Project data is in `data/projects.json` and styles are in `css/styles.css`.

## Per-project pages

Each project has its own page at `project.html?id=<project-id>`. From the homepage click "View page →" or open a URL like:

```
http://localhost:8000/project.html?id=p1
```

The project page shows the full description and an image gallery.

