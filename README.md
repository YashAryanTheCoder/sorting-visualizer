# Sorting Visualizer

A static HTML, CSS, and JavaScript website that demonstrates six sorting algorithms:

- Bubble Sort
- Insertion Sort
- Selection Sort
- Heap Sort
- Merge Sort
- Quick Sort

## Open the app

Open the `index.html` file in a browser, or serve the folder with any local static server.

Example:

```bash
cd sorting-visualizer
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Host on GitHub Pages

This project is already set up as a static site for GitHub Pages.

1. Push this folder to a new GitHub repository.
2. In GitHub, open the repository and go to Settings > Pages.
3. Under Source, choose GitHub Actions.
4. Commit the workflow file in `.github/workflows/deploy.yml`.
5. Push to the `main` branch.
6. GitHub will build and deploy the site automatically.

After the workflow finishes, your site will be available at:

```text
https://<your-username>.github.io/<your-repo-name>/
```
