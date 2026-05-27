
# Slovník – Update-Patch (Mai 2026)

## Enthaltene Verbesserungen

- Wiederholungsintervall jetzt sinnvoll einstellbar (3–20)
- Statistik-Zeitraum einstellbar (7 Tage / 30 Tage / 1 Jahr / Gesamt)
- Vorbereitung für bessere Deep-Learn-Logik
- CSS rgba()-Fehler korrigiert
- Import-Dateitypfehler korrigiert
- Shuffle-Algorithmus verbessert

---

# 1. SETTINGS_DEFAULTS ersetzen

Suche:

```js
const SETTINGS_DEFAULTS={repeatInterval:20,
```

Ersetzen durch:

```js
const SETTINGS_DEFAULTS={
  repeatInterval:10,
  statsRange:365,
  modeFlip:true,
  modeType:true,
  modeLetters:true,
  accent:'#c9a84c',
  accentDim:'#7a6330',
  appLang:'de'
};
```

---

# 2. Wiederholungsintervall modernisieren

Suche:

```html
<input type="number" id="set-repeat-interval" min="5" max="50"
```

Ersetzen durch:

```html
<input
  type="range"
  id="set-repeat-interval"
  min="3"
  max="20"
  step="1"
  value="10"
  class="set-input"
  oninput="updateRepeatInterval(this.value)">

<div style="margin-top:8px;font-size:14px;color:var(--gold)">
  <span id="repeat-interval-value">10</span> Karten
</div>
```

---

# 3. Neue Funktion ergänzen

Unter `saveSetting()` ergänzen:

```js
function updateRepeatInterval(v){
  document.getElementById('repeat-interval-value').textContent=v;
  saveSetting('repeatInterval',parseInt(v));
}
```

---

# 4. Statistik-Zeitraum hinzufügen

Im Statistikbereich ergänzen:

```html
<div class="settings-row">
  <div class="sr-label">Statistik-Zeitraum</div>

  <select id="stats-range"
          class="set-select"
          onchange="changeStatsRange(this.value)">

    <option value="7">7 Tage</option>
    <option value="30">30 Tage</option>
    <option value="365">1 Jahr</option>
    <option value="99999">Gesamt</option>
  </select>
</div>
```

---

# 5. Statistikfunktion ergänzen

```js
function changeStatsRange(v){
  saveSetting('statsRange',parseInt(v));
  renderStats();
}
```

---

# 6. renderStats() verbessern

Ganz oben in renderStats():

```js
const s=loadSettings();
const range=s.statsRange||365;

const now=Date.now();
const limit=now-(range*24*60*60*1000);

const filtered=v.filter(c=>{
  if(!c.lastReviewed)return range===99999;
  return c.lastReviewed>=limit;
});
```

Danach überall `v` durch `filtered` ersetzen.

---

# 7. Shuffle verbessern

Suche:

```js
.sort(()=>Math.random()-.5)
```

Ersetzen durch:

```js
shuffle(array)
```

Und ergänzen:

```js
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
```

---

# 8. CSS-Fehler korrigieren

Suche:

```css
rgba(201,168,76,15)
```

Ersetzen durch:

```css
rgba(201,168,76,.15)
```

Und:

```css
rgba(201,168,76,12)
```

→

```css
rgba(201,168,76,.12)
```

Und:

```css
rgba(0,0,0,72)
```

→

```css
rgba(0,0,0,.72)
```

---

# 9. Import-Fehler korrigieren

Suche:

```html
accept=".json,csv"
```

Ersetzen durch:

```html
accept=".json,.csv"
```

---

# 10. Deep-Learn verbessern (empfohlen)

Aktuell:
A A A → B B B

Besser:
A B C A C B

Neue Queue-Idee:

```js
practiceQueue.push(card);

const pos=Math.min(
  practiceQueue.length,
  Math.floor(Math.random()*4)+3
);

practiceQueue.splice(pos,0,card);
```

Dadurch kommen Karten später zufällig wieder.

