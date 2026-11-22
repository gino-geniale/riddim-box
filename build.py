#!/usr/bin/env python3
"""Baut aus src/ eine einzelne, eigenständige HTML-Datei: dist/riddim-box.html"""
import base64, pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
logo = "data:image/svg+xml;base64," + base64.b64encode((src / "assets/sparked-logo-black.svg").read_bytes()).decode()
html = (src / "ui.html").read_text(encoding="utf-8")
html = html.replace("__LOGOB__", logo).replace("__ENGINE__", (src / "engine.js").read_text(encoding="utf-8")).replace("__APP__", (src / "app.js").read_text(encoding="utf-8"))
# 1) Fragment für Claude-Artifacts (das Gerüst mit <html>/<head> ergänzt der Artifact-Dienst)
out = root / "dist/riddim-box.html"
out.write_text(html, encoding="utf-8")
# 2) Eigenständige Webseite, z. B. für Netlify, GitHub Pages oder den eigenen Server
page = ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<meta name="description" content="sparked Riddim Box: eine Drum Machine für Reggae, Dancehall und Dub im Browser.">\n'
        '<style>html,body{margin:0}body{font-family:system-ui,sans-serif}[hidden]{display:none!important}</style>\n'
        '</head>\n<body>\n' + html + '\n</body>\n</html>\n')
web = root / "dist/web/index.html"
web.parent.mkdir(parents=True, exist_ok=True)
web.write_text(page, encoding="utf-8")
print(f"gebaut: {out} und {web} ({len(page)//1024} KB)")
