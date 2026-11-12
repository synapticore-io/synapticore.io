# synapticore.io

**Scientific Computing & Spatial Intelligence**

[\![Live](https://img.shields.io/badge/synapticore.io-live-blue?style=flat-square)](https://synapticore.io)

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- Content from DuckDB CMS (build-time JSON, zero runtime overhead)
- Deployed via GitHub Pages + GitHub Actions

## Development

```bash
npm install
npm run dev      # Dev server on port 5173
npm run build    # Production build → dist/
npm run preview  # Preview build on port 4173
```

Hero-Texte werden im CMS in `hero_sections`, Forschungsfelder und Arbeitsweise in `content_blocks` gepflegt. Export: `uv run cms export --site synapticore-io` im CMS-Verzeichnis. Die Darstellung des Arbeitsablaufs, die Projektauswahl sowie Über-mich- und Ökosystemtexte stehen in `src/App.jsx`.

## Offen

- Die bisherige Umsatzsteuer-ID kann laut Auskunft des Finanzamts reaktiviert werden; Abschluss und Gültigkeit der Reaktivierung noch bestätigen.

Die gemeinsame technische AI-Act-Sichtung und die Prüfanlässe stehen im Repository `agentic-dev.io` unter `docs/ai-act-website-sichtung.md`.

## License

[MIT Ethical Use](LICENSE)

