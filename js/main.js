// Element references
const contentText = document.getElementById('contentText');
const userText = document.getElementById('userText');
const userInputSection = document.getElementById('userInputSection');
const historyList = document.getElementById('historyList');
const favoriteText = document.getElementById('favoriteText');

let mode = 'joke';
let history = {
  joke: [],
  fact: [],
  yoda: []
};
let favorites = {
  joke: null,
  fact: null,
  yoda: null
};

// --- API Calls ---

async function fetchJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/random');
    const data = await res.json();
    const joke = `${data.setup} ${data.punchline}`;
    updateContent(joke);
  } 
  catch (err) {
  console.error(err);
  updateContent('Failed to load a joke. Try again!');
}
}

async function fetchFact() {
  try {
    const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await res.json();
    updateContent(data.text);
  } 
  catch (err) {
  console.error(err);
  updateContent('Failed to load a fun fact.');
}

}

async function translateToYoda(text) {
  try {
    const res = await fetch('https://api.funtranslations.com/translate/yoda.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ text })
    });

    if (!res.ok) {
      if (res.status === 429) return 'Rate limit hit! Try again later.';
      throw new Error('Translation failed');
    }

    const data = await res.json();
    return data.contents.translated;
  } 
  catch (err) {
  console.error(err);
  return 'Yoda translation failed.';
}

}

// --- Content Display ---

function updateContent(text) {
  contentText.textContent = text;

  // Store in history
  history[mode].unshift(text);
  if (history[mode].length > 5) history[mode].pop();

  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  history[mode].forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.addEventListener('click', () => {
      contentText.textContent = item;
    });
    historyList.appendChild(li);
  });
}

function renderFavorite() {
  const fav = favorites[mode];
  favoriteText.textContent = fav ? fav : 'No favorite saved yet.';
}

// --- Button Actions ---

document.getElementById('newBtn').addEventListener('click', async () => {
  if (mode === 'joke') {
    fetchJoke();
  } else if (mode === 'fact') {
    fetchFact();
  } else if (mode === 'yoda') {
    const input = userText.value.trim();
    if (!input) return alert('Please enter something to Yoda-fy!');
    const yodaText = await translateToYoda(input);
    updateContent(yodaText);
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const text = contentText.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard! Share Away!');
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  favorites[mode] = contentText.textContent;
  renderFavorite();
  alert('Favorite saved!');
});

document.getElementById('translateBtn').addEventListener('click', async () => {
  const input = userText.value.trim();
  if (!input) return alert('Please enter something!');
  const yodaText = await translateToYoda(input);
  updateContent(yodaText);
});

// --- Mood Selector ---

document.getElementById('jokeMode').addEventListener('click', () => {
  mode = 'joke';
  userInputSection.classList.add('hidden');
  updateContent('Click the "Give Me A New One!" button below to get a joke.');
  renderHistory();
  renderFavorite();
});

document.getElementById('factMode').addEventListener('click', () => {
  mode = 'fact';
  userInputSection.classList.add('hidden');
  updateContent('Click the "Give Me A New One!" button below to get a fun fact.');
  renderHistory();
  renderFavorite();
});

document.getElementById('yodaMode').addEventListener('click', () => {
  mode = 'yoda';
  userInputSection.classList.remove('hidden');
  updateContent('Type something below you must. Yoda-fy your sentence I will.');
  renderHistory();
  renderFavorite();
});

// --- Default on Load ---
window.addEventListener('load', () => {
  updateContent('Click a button above to get started!');
  renderFavorite();
});
