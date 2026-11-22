# sparked Riddim Box

Eine Drum Machine für den Browser im sparked-Design: drei Reggae-Soundwelten (roots, dancehall, dub), Sequencer mit Patterns, Mischpult, Live-Effekten und Teilen per Link. Läuft auf Handy, Tablet und Laptop, ohne Server und ohne externe Dateien.

## Ordner

| Pfad | Inhalt |
|---|---|
| `src/engine.js` | Sound-Engine (Web Audio): alle Klänge, Effekte, Mischpult, Kit-Bibliothek, Tonarten |
| `src/app.js` | Oberfläche und Sequencer: Patterns, Steps, Regler, Teilen, Speichern |
| `src/ui.html` | HTML-Gerüst und CSS (Platzhalter `__ENGINE__`, `__APP__`, `__LOGOB__`) |
| `src/assets/sparked-logo-black.svg` | Logo |
| `build.py` | baut alles zu einer einzigen Datei |
| `dist/web/index.html` | fertige Webseite zum Hochladen (ca. 100 KB) |
| `dist/riddim-box.html` | dieselbe Box als Claude-Artifact (ohne HTML-Gerüst) |
| `extras/` | Sound Lab (Klangtests), die Design-Varianten und der Haptik-Entwurf (nicht weiterverfolgt) |

## Bauen

```
python3 build.py
```

Erzeugt `dist/web/index.html` und `dist/riddim-box.html`. Python 3 ohne Zusatzpakete genügt.

## Kostenlos online stellen (eigene Adresse)

Der Ordner `dist/web` ist eine komplette Webseite. Am einfachsten mit **Netlify Drop**: app.netlify.com/drop öffnen, den Ordner `web` ins Fenster ziehen, fertig. Mit einem kostenlosen Netlify-Konto bleibt die Seite dauerhaft unter einer Adresse wie `riddim-box.netlify.app`. Alternativen: GitHub Pages, Cloudflare Pages.

Als eigene Seite kopiert "share" automatisch einen fertigen Link in die Zwischenablage.

## Auf der Webseite einbauen

Empfohlen: `dist/web/index.html` auf den Server laden und per iframe in eine bestehende Seite setzen. So gibt es keine Konflikte mit dem Theme-CSS.

```html
<iframe src="/riddim/index.html" title="sparked Riddim Box"
        style="width:100%;max-width:980px;height:1250px;border:0" allow="autoplay"></iframe>
```

Vor dem Einbau anpassen, in `src/app.js` ganz oben:

```js
const CONFIG = { shareBase: "https://www.planet-sparked.com/riddim", ctaUrl: "https://www.planet-sparked.com", storeKey: "riddimbox-v1" };
```

- `shareBase`: die Adresse, an die geteilte Beats angehängt werden. Läuft die Box als eigene Seite, ist das automatisch ihre eigene Adresse. Bei Einbettung per iframe hier die Adresse der Elternseite eintragen.
- Geteilte Links haben die Form `…#rb1z…`. Liegt die Box in einem iframe, muss die Elternseite den Teil nach `#` an das iframe weitergeben (oder die Box direkt als eigene Seite ausliefern).
- Das Layout wechselt ab 980 px Breite ins Querformat. Im iframe zählt die Breite des iframes.

Hinweise:
- **Schriften:** Im Moment Manrope und Cormorant von Google Fonts als Platzhalter. Für die Webseite die Hausschriften (GT Eesti, Orpheus Pro) selbst hosten, sofern die Lizenz Webfonts erlaubt, und den Google-Fonts-Link in `src/ui.html` entfernen (Datenschutz).
- **Ton:** Browser spielen erst nach einer Berührung Ton ab. Das löst der erste Tipp aus.
- **iPhone:** Der Stummschalter kann Web-Audio stumm schalten. Es ist eine Gegenmaßnahme eingebaut, ältere iOS-Versionen ignorieren sie.

## Neue Soundwelt hinzufügen

In `src/engine.js` im Objekt `KITS` einen Eintrag ergänzen (Vorlage: `roots`):

- `name`, `genre` (z. B. `"hip hop"`), `bpm`, `swing`
- Parameter für die 8 Spuren `kick, snare, rim, hat, perc, bass, skank, siren`. Wiederverwendbare Klang-Typen, z. B. `bass.type: "string" | "808" | "growl"`, `skank.type: "organ" | "keys" | "chop"`, `rim.type: "rim" | "clap"`
- `send`: feste Echo- und Hall-Anteile pro Spur
- `labels` (optional): Spurnamen überschreiben, z. B. `skank: {pro: "chord", easy: "akkord"}`
- im Objekt `DEMOS` einen Demo-Beat ergänzen

Sobald ein zweites Genre existiert, zeigt die Oberfläche automatisch eine Genre-Auswahl über den Kits.

## Offene Punkte

- **Voice-Samples:** brauchen echte Aufnahmen (eigene oder lizenzfreie). Sie können einzelne FX-Plätze im fx-Modus ersetzen (`FX_TYPES` in `src/engine.js`).
- Eigene Samples per Upload oder Mikrofon
- Hip-Hop- und Techno-Kits
