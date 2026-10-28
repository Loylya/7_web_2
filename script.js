// /* ============================================================
//    Aurora Hunter SPB
//    ============================================================ */

// // ⚠️ ВСТАВЬ СЮДА СВОЙ КЛЮЧ OpenWeatherMap (бесплатный)
// // Получить: https://home.openweathermap.org/users/sign_up

// // NASA DEMO_KEY подходит для тестов (30 запросов/час)
// // const NASA_API_KEY = 'FZlLhxhiJQXIl84r9x0JhQCgqasb8AZd9xkUgqAU';

// const SPB_COORDS = { lat: 59.9343, lon: 30.3351 };
// const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 минут

// /* ---------- Утилиты ---------- */



// const $ = (id) => document.getElementById(id);

// function fmtDate(iso) {
//   const d = new Date(iso);
//   return d.toLocaleString('ru-RU', {
//     day: '2-digit', month: '2-digit', year: 'numeric',
//     hour: '2-digit', minute: '2-digit'
//   });
// }

// function setHint(el, text, cls = '') {
//   el.textContent = text || '';
//   el.className = 'hint' + (cls ? ' ' + cls : '');
// }

// /* ---------- 1. Космическая погода (NASA DONKI GST) ---------- */

// async function fetchSpaceWeather() {
//   const kpEl = $('kpValue');
//   const statusEl = $('spaceStatus');
//   const hintEl = $('spaceHint');

//   try {
//     // Берём данные за последние 7 дней
//     const end = new Date();
//     const start = new Date();
//     start.setDate(end.getDate() - 7);
//     const fmt = (d) => d.toISOString().slice(0, 10);

//     const url = `https://ccmc.gsfc.nasa.gov/DONKI-API/get/GST?startDate=${fmt(start)}&endDate=${fmt(end)}`;
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`NASA HTTP ${res.status}`);
//     const data = await res.json();

//     let kp = 0;
//     let latest = null;

//     if (Array.isArray(data) && data.length > 0) {
//       // Сортируем по дате начала, берём последнее событие
//       const sorted = data
//         .filter(e => e.startTime)
//         .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

//       if (sorted.length > 0) {
//         latest = sorted[0];
//         // Берём максимальный Kp из всех allKpIndex у последнего события
//         const kps = (latest.allKpIndex || []).map(x => Number(x.kpIndex)).filter(n => !isNaN(n));
//         kp = kps.length ? Math.max(...kps) : 0;
//       }
//     }

//     // Если событий нет — считаем спокойно
//     if (!latest) {
//       kpEl.textContent = '~2';
//       kpEl.style.color = 'var(--green)';
//       statusEl.textContent = 'Спокойно';
//       statusEl.className = 'status calm';
//       setHint(hintEl, 'Геомагнитных бурь за последние 7 дней не зафиксировано.');
//       return;
//     }

//     kpEl.textContent = kp;
//     let cls, label, hint, hintCls;
//     if (kp >= 7) {
//       cls = 'strong'; label = 'Сильная буря';
//       hint = '🔥 Вероятность сияния повышена! Смотрите на север!';
//       hintCls = 'good';
//       kpEl.style.color = 'var(--red)';
//     } else if (kp >= 5) {
//       cls = 'weak'; label = 'Слабая буря';
//       hint = '✨ Вероятность сияния повышена! Выезжайте за город.';
//       hintCls = 'good';
//       kpEl.style.color = 'var(--yellow)';
//     } else {
//       cls = 'calm'; label = 'Спокойно';
//       hint = 'Магнитосфера спокойна. Шансы низкие.';
//       hintCls = '';
//       kpEl.style.color = 'var(--green)';
//     }

//     statusEl.textContent = label;
//     statusEl.className = 'status ' + cls;
//     setHint(hintEl, hint, hintCls);

//   } catch (err) {
//     console.error('NASA DONKI error:', err);
//     kpEl.textContent = '—';
//     kpEl.style.color = 'var(--text-dim)';
//     statusEl.textContent = 'Нет данных';
//     statusEl.className = 'status unknown';
//     setHint(hintEl, 'Не удалось получить данные NASA. Попробуйте позже.', 'warn');
//   }
// }

// /* ---------- 2. Погода в СПб (OpenWeatherMap) ---------- */

// async function fetchWeather() {
//   const tempEl = $('temp');
//   const feelsEl = $('feelsLike');
//   const cloudsEl = $('clouds');
//   const hintEl = $('weatherHint');

//   if (!OWM_API_KEY || OWM_API_KEY.includes('ВСТАВЬ')) {
//     tempEl.textContent = '—';
//     feelsEl.textContent = '—';
//     cloudsEl.textContent = '—';
//     setHint(hintEl, 'Укажите OWM_API_KEY в script.js', 'warn');
//     return;
//   }

//   try {
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=Saint Petersburg&units=metric&lang=ru&appid=${OWM_API_KEY}`;
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`OWM HTTP ${res.status}`);
//     const data = await res.json();

//     const temp = Math.round(data.main.temp);
//     const feels = Math.round(data.main.feels_like);
//     const clouds = data.clouds?.all ?? 0;

//     tempEl.textContent = `${temp}°C`;
//     feelsEl.textContent = `${feels}°C`;
//     cloudsEl.textContent = `${clouds}%`;

//     if (clouds > 80) {
//       setHint(hintEl, '☁️ Облачность > 80% — шансы увидеть сияние низкие.', 'warn');
//     } else if (clouds > 50) {
//       setHint(hintEl, '⛅ Переменная облачность — есть шанс.', '');
//     } else {
//       setHint(hintEl, '🌤️ Малооблачно — хорошие условия для наблюдений!', 'good');
//     }

//   } catch (err) {
//     console.error('OWM error:', err);
//     tempEl.textContent = '—';
//     feelsEl.textContent = '—';
//     cloudsEl.textContent = '—';
//     setHint(hintEl, 'Не удалось получить погоду. Проверьте ключ/интернет.', 'warn');
//   }
// }

// /* ---------- 3. Луна (SunCalc) ---------- */

// function updateMoon() {
//   const phaseEl = $('moonPhase');
//   const illumEl = $('moonIllum');
//   const hintEl = $('moonHint');

//   try {
//     const now = new Date();
//     const moon = SunCalc.getMoonIllumination(now);

//     const fraction = Math.round(moon.fraction * 100);
//     const phase = moon.phase; // 0..1

//     // Маппинг фазы на русское название
//     let phaseName;
//     if (phase < 0.03 || phase > 0.97) phaseName = 'Новолуние';
//     else if (phase < 0.22) phaseName = 'Растущий серп';
//     else if (phase < 0.28) phaseName = 'Первая четверть';
//     else if (phase < 0.47) phaseName = 'Растущая луна';
//     else if (phase < 0.53) phaseName = 'Полнолуние';
//     else if (phase < 0.72) phaseName = 'Убывающая луна';
//     else if (phase < 0.78) phaseName = 'Последняя четверть';
//     else phaseName = 'Убывающий серп';

//     phaseEl.textContent = phaseName;
//     illumEl.textContent = `${fraction}%`;

//     if (fraction > 80) {
//       setHint(hintEl, '🌕 Яркая луна может помешать наблюдениям.', 'warn');
//     } else if (fraction > 50) {
//       setHint(hintEl, '🌗 Луна умеренно яркая.', '');
//     } else {
//       setHint(hintEl, '🌑 Луна почти не помешает — отличные условия!', 'good');
//     }

//   } catch (err) {
//     console.error('SunCalc error:', err);
//     phaseEl.textContent = '—';
//     illumEl.textContent = '—';
//     setHint(hintEl, 'Не удалось рассчитать фазу Луны.', 'warn');
//   }
// }

// /* ---------- 4. Заметки (localStorage) ---------- */

// const NOTES_KEY = 'aurora_hunter_notes';

// function loadNotes() {
//   try {
//     const raw = localStorage.getItem(NOTES_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// function saveNotes(notes) {
//   localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
// }

// function renderNotes() {
//   const list = $('notesList');
//   const notes = loadNotes();
//   list.innerHTML = '';

//   if (notes.length === 0) {
//     const li = document.createElement('li');
//     li.className = 'note-empty';
//     li.textContent = 'Пока заметок нет.';
//     list.appendChild(li);
//     return;
//   }

//   // Сортируем по дате (новые сверху)
//   notes
//     .slice()
//     .sort((a, b) => new Date(b.date) - new Date(a.date))
//     .forEach(note => {
//       const li = document.createElement('li');
//       li.className = 'note-item';

//       const text = document.createElement('div');
//       text.className = 'note-text';
//       text.textContent = note.text;

//       const date = document.createElement('div');
//       date.className = 'note-date';
//       date.textContent = fmtDate(note.date);

//       li.appendChild(text);
//       li.appendChild(date);
//       list.appendChild(li);
//     });
// }

// function addNote() {
//   const input = $('noteInput');
//   const text = input.value.trim();
//   if (!text) return;

//   const notes = loadNotes();
//   notes.push({ text, date: new Date().toISOString() });
//   saveNotes(notes);
//   input.value = '';
//   renderNotes();
// }

// function clearNotes() {
//   if (!confirm('Удалить все заметки?')) return;
//   localStorage.removeItem(NOTES_KEY);
//   renderNotes();
// }

// /* ---------- Обновление и автообновление ---------- */

// async function refreshAll() {
//   $('lastUpdate').textContent = 'Обновление…';
//   await Promise.allSettled([
//     fetchSpaceWeather(),
//     fetchWeather(),
//   ]);
//   updateMoon(); // синхронно, не требует сети
//   $('lastUpdate').textContent = 'Последнее обновление: ' + fmtDate(new Date().toISOString());
// }

// /* ---------- Инициализация ---------- */

// document.addEventListener('DOMContentLoaded', () => {
//   renderNotes();

//   $('refreshBtn').addEventListener('click', refreshAll);
//   $('addNoteBtn').addEventListener('click', addNote);
//   $('clearNotesBtn').addEventListener('click', clearNotes);

//   // Ctrl+Enter в textarea — добавить заметку
//   $('noteInput').addEventListener('keydown', (e) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') addNote();
//   });

//   refreshAll();
//   setInterval(refreshAll, REFRESH_INTERVAL_MS);
// });







/* ============================================================
   Aurora Hunter SPB
   ============================================================ */

const SPB_COORDS = { lat: 59.9343, lon: 30.3351 };
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 минут

/* ---------- Утилиты ---------- */

const $ = (id) => document.getElementById(id);

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function setHint(el, text, cls = '') {
  el.textContent = text || '';
  el.className = 'hint' + (cls ? ' ' + cls : '');
}

/* ---------- 1. Космическая погода (NASA DONKI GST) ---------- */

async function fetchSpaceWeather() {
  const kpEl = $('kpValue');
  const statusEl = $('spaceStatus');
  const hintEl = $('spaceHint');

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const url = `https://ccmc.gsfc.nasa.gov/DONKI-API/get/GST?startDate=${fmt(start)}&endDate=${fmt(end)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA HTTP ${res.status}`);
    const data = await res.json();

    let kp = 0;
    let latest = null;

    if (Array.isArray(data) && data.length > 0) {
      const sorted = data
        .filter(e => e.startTime)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

      if (sorted.length > 0) {
        latest = sorted[0];
        const kps = (latest.allKpIndex || [])
          .map(x => Number(x.kpIndex))
          .filter(n => !isNaN(n));
        kp = kps.length ? Math.max(...kps) : 0;
      }
    }

    if (!latest) {
      kpEl.textContent = '~2';
      kpEl.style.color = 'var(--green)';
      statusEl.textContent = 'Спокойно';
      statusEl.className = 'status calm';
      setHint(hintEl, 'Геомагнитных бурь за последние 7 дней не зафиксировано.');
      return;
    }

    kpEl.textContent = kp;
    let cls, label, hint, hintCls;
    if (kp >= 7) {
      cls = 'strong'; label = 'Сильная буря';
      hint = '🔥 Вероятность сияния повышена! Смотрите на север!';
      hintCls = 'good';
      kpEl.style.color = 'var(--red)';
    } else if (kp >= 5) {
      cls = 'weak'; label = 'Слабая буря';
      hint = '✨ Вероятность сияния повышена! Выезжайте за город.';
      hintCls = 'good';
      kpEl.style.color = 'var(--yellow)';
    } else {
      cls = 'calm'; label = 'Спокойно';
      hint = 'Магнитосфера спокойна. Шансы низкие.';
      hintCls = '';
      kpEl.style.color = 'var(--green)';
    }

    statusEl.textContent = label;
    statusEl.className = 'status ' + cls;
    setHint(hintEl, hint, hintCls);

  } catch (err) {
    console.error('NASA DONKI error:', err);
    kpEl.textContent = '—';
    kpEl.style.color = 'var(--text-dim)';
    statusEl.textContent = 'Нет данных';
    statusEl.className = 'status unknown';
    setHint(hintEl, 'Не удалось получить данные NASA. Попробуйте позже.', 'warn');
  }
}

/* ---------- 2. Погода в СПб (Open-Meteo, без ключа) ---------- */

async function fetchWeather() {
  const tempEl = $('temp');
  const feelsEl = $('feelsLike');
  const cloudsEl = $('clouds');
  const hintEl = $('weatherHint');

  try {
    const { lat, lon } = SPB_COORDS;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,cloud_cover&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();

    const cur = data.current;
    if (!cur) throw new Error('Open-Meteo: нет блока current');

    const temp = Math.round(cur.temperature_2m);
    const feels = Math.round(cur.apparent_temperature);
    const clouds = cur.cloud_cover ?? 0;

    tempEl.textContent = `${temp}°C`;
    feelsEl.textContent = `${feels}°C`;
    cloudsEl.textContent = `${clouds}%`;

    if (clouds > 80) {
      setHint(hintEl, '☁️ Облачность > 80% — шансы увидеть сияние низкие.', 'warn');
    } else if (clouds > 50) {
      setHint(hintEl, '⛅ Переменная облачность — есть шанс.', '');
    } else {
      setHint(hintEl, '🌤️ Малооблачно — хорошие условия для наблюдений!', 'good');
    }

  } catch (err) {
    console.error('Open-Meteo error:', err);
    tempEl.textContent = '—';
    feelsEl.textContent = '—';
    cloudsEl.textContent = '—';
    setHint(hintEl, 'Не удалось получить погоду. Проверьте интернет.', 'warn');
  }
}

/* ---------- 3. Луна (SunCalc) ---------- */

function updateMoon() {
  const phaseEl = $('moonPhase');
  const illumEl = $('moonIllum');
  const hintEl = $('moonHint');

  try {
    const now = new Date();
    const moon = SunCalc.getMoonIllumination(now);

    const fraction = Math.round(moon.fraction * 100);
    const phase = moon.phase;

    let phaseName;
    if (phase < 0.03 || phase > 0.97) phaseName = 'Новолуние';
    else if (phase < 0.22) phaseName = 'Растущий серп';
    else if (phase < 0.28) phaseName = 'Первая четверть';
    else if (phase < 0.47) phaseName = 'Растущая луна';
    else if (phase < 0.53) phaseName = 'Полнолуние';
    else if (phase < 0.72) phaseName = 'Убывающая луна';
    else if (phase < 0.78) phaseName = 'Последняя четверть';
    else phaseName = 'Убывающий серп';

    phaseEl.textContent = phaseName;
    illumEl.textContent = `${fraction}%`;

    if (fraction > 80) {
      setHint(hintEl, '🌕 Яркая луна может помешать наблюдениям.', 'warn');
    } else if (fraction > 50) {
      setHint(hintEl, '🌗 Луна умеренно яркая.', '');
    } else {
      setHint(hintEl, '🌑 Луна почти не помешает — отличные условия!', 'good');
    }

  } catch (err) {
    console.error('SunCalc error:', err);
    phaseEl.textContent = '—';
    illumEl.textContent = '—';
    setHint(hintEl, 'Не удалось рассчитать фазу Луны.', 'warn');
  }
}

/* ---------- 4. Заметки (localStorage) ---------- */

const NOTES_KEY = 'aurora_hunter_notes';

function loadNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const list = $('notesList');
  const notes = loadNotes();
  list.innerHTML = '';

  if (notes.length === 0) {
    const li = document.createElement('li');
    li.className = 'note-empty';
    li.textContent = 'Пока заметок нет.';
    list.appendChild(li);
    return;
  }

  notes
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(note => {
      const li = document.createElement('li');
      li.className = 'note-item';

      const text = document.createElement('div');
      text.className = 'note-text';
      text.textContent = note.text;

      const date = document.createElement('div');
      date.className = 'note-date';
      date.textContent = fmtDate(note.date);

      li.appendChild(text);
      li.appendChild(date);
      list.appendChild(li);
    });
}

function addNote() {
  const input = $('noteInput');
  const text = input.value.trim();
  if (!text) return;

  const notes = loadNotes();
  notes.push({ text, date: new Date().toISOString() });
  saveNotes(notes);
  input.value = '';
  renderNotes();
}

function clearNotes() {
  if (!confirm('Удалить все заметки?')) return;
  localStorage.removeItem(NOTES_KEY);
  renderNotes();
}

/* ---------- Обновление и автообновление ---------- */

async function refreshAll() {
  $('lastUpdate').textContent = 'Обновление…';
  await Promise.allSettled([
    fetchSpaceWeather(),
    fetchWeather(),
  ]);
  updateMoon();
  $('lastUpdate').textContent = 'Последнее обновление: ' + fmtDate(new Date().toISOString());
}

/* ---------- Инициализация ---------- */

document.addEventListener('DOMContentLoaded', () => {
  renderNotes();

  $('refreshBtn').addEventListener('click', refreshAll);
  $('addNoteBtn').addEventListener('click', addNote);
  $('clearNotesBtn').addEventListener('click', clearNotes);

  $('noteInput').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') addNote();
  });

  refreshAll();
  setInterval(refreshAll, REFRESH_INTERVAL_MS);
});