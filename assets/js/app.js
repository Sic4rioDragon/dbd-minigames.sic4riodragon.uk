const MODE_TITLES = {
  classic: "Classic Guess",
  killer: "Killer Guess",
  emoji: "Emoji Guess",
  perk: "Perk Guess",
  quote: "Quote Guess",
  lore: "Lore Guess",
  terror: "Terror Radius Guess"
};

const MAX_TRIES = 3;

let roundsByMode = {};
let currentMode = null;
let currentRound = null;
let roundQueue = [];
let score = 0;
let played = 0;
let bestScore = 0;
let tries = 0;
let roundLocked = false;

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^the\s+/, "")
    .trim();
}

function getAnswerTokens(value) {
  return normalizeAnswer(value)
    .split(" ")
    .map(part => part.trim())
    .filter(part => part.length >= 3);
}

function isCorrectGuess(guessValue, round) {
  const guess = normalizeAnswer(guessValue);
  if (!guess || !round) return false;

  const accepted = [
    round.answer,
    ...(round.aliases || [])
  ]
    .map(normalizeAnswer)
    .filter(Boolean);

  if (accepted.includes(guess)) return true;

  for (const value of accepted) {
    const tokens = getAnswerTokens(value);

    if (tokens.includes(guess)) {
      return true;
    }
  }

  return false;
}

function shuffleList(list) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getBestKey() {
  return `dbd-minigames-best-${currentMode}`;
}

function loadBestScore() {
  bestScore = Number(localStorage.getItem(getBestKey()) || 0);
}

function saveBestScore() {
  if (score <= bestScore) return;

  bestScore = score;
  localStorage.setItem(getBestKey(), String(bestScore));
}

function resetQueue() {
  const rounds = roundsByMode[currentMode] || [];
  roundQueue = shuffleList(rounds);
}

function pickRound() {
  if (!roundQueue.length) resetQueue();
  return roundQueue.shift() || null;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getGameDataPath() {
  const root = document.querySelector("[data-game-mode]");
  return root?.dataset.roundsPath || "../../assets/data/rounds.json";
}

async function loadRoundData() {
  const path = getGameDataPath();
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load rounds from ${path}`);
  }

  roundsByMode = await response.json();
}

async function loadSiteInfo() {
  const versionEl = document.getElementById("siteVersion");
  if (!versionEl) return;

  try {
    const response = await fetch("assets/data/site.json");

    if (!response.ok) {
      throw new Error("Could not load site.json");
    }

    const info = await response.json();
    versionEl.textContent = info.version || "v0.0.1";
  } catch {
    versionEl.textContent = "v0.0.1";
  }
}

function setResult(message, state) {
  const result = document.getElementById("result");
  if (!result) return;

  result.classList.add("show");
  result.textContent = message;
  result.dataset.state = state;
}

function clearResult() {
  const result = document.getElementById("result");
  if (!result) return;

  result.classList.remove("show");
  result.textContent = "";
  result.dataset.state = "";
}

function setInputLocked(locked) {
  const input = document.getElementById("answerInput");
  const submit = document.getElementById("submitBtn");

  if (input) input.disabled = locked;
  if (submit) submit.disabled = locked;
}

function setNextLocked(locked) {
  const next = document.getElementById("nextBtn");
  if (next) next.disabled = locked;
}

function updateScore() {
  saveBestScore();

  setText("scoreText", `Score ${score}`);
  setText("playedText", `Played ${played}`);
  setText("bestText", `Best ${bestScore}`);
  setText("leftText", `Left ${roundQueue.length}`);
  setText("triesText", `Try ${tries}/${MAX_TRIES}`);
}

function updatePageTitle() {
  const title = MODE_TITLES[currentMode] || "DBD Mini Game";

  setText("modeTitle", title);
  document.title = `${title} - DBD Mini Games`;
}

function hideCharacterReveal() {
  const reveal = document.getElementById("characterReveal");
  const image = document.getElementById("characterImage");
  const name = document.getElementById("characterName");

  if (reveal) reveal.hidden = true;
  if (image) {
    image.removeAttribute("src");
    image.alt = "";
  }
  if (name) name.textContent = "";
}

function showCharacterReveal() {
  const reveal = document.getElementById("characterReveal");
  const image = document.getElementById("characterImage");
  const name = document.getElementById("characterName");

  if (!reveal || !name) return;

  name.textContent = currentRound.answer;

  if (image && currentRound.image) {
    image.src = currentRound.image;
    image.alt = currentRound.answer;

    image.onerror = () => {
      image.removeAttribute("src");
      image.alt = "";
      image.style.display = "none";
    };

    image.onload = () => {
      image.style.display = "";
    };
  }

  reveal.hidden = false;
}

function getLastTryHint() {
  const hints = currentRound?.hints || [];
  if (!hints.length) return "";

  return hints[hints.length - 1] || "";
}

function finishRound(message, state) {
  played += 1;
  roundLocked = true;

  setInputLocked(true);
  setNextLocked(false);
  showCharacterReveal();
  setResult(message, state);
  updateScore();
}

function loadRound() {
  currentRound = pickRound();
  tries = 0;
  roundLocked = false;

  const input = document.getElementById("answerInput");

  if (input) {
    input.value = "";
    input.focus();
  }

  setInputLocked(false);
  setNextLocked(true);
  clearResult();
  hideCharacterReveal();

  if (!currentRound) {
    setText("clueText", "No rounds found for this mode yet.");
    setText("helperText", "");
    setInputLocked(true);
    setNextLocked(true);
    return;
  }

  setText("clueText", currentRound.clue);
  setText("helperText", "");
  updateScore();
}

function checkAnswer() {
  if (!currentRound || roundLocked) return;

  const input = document.getElementById("answerInput");
const rawGuess = input?.value || "";
const guess = normalizeAnswer(rawGuess);

if (!guess) {
  setResult("Type a guess first.", "warning");
  return;
}

tries += 1;

const correct = isCorrectGuess(rawGuess, currentRound);

  if (correct) {
    score += 1;
    finishRound(`Correct. The answer was ${currentRound.answer}.`, "correct");
    return;
  }

  if (tries >= MAX_TRIES) {
    finishRound(`Out of tries. The answer was ${currentRound.answer}.`, "wrong");
    return;
  }

  const triesLeft = MAX_TRIES - tries;

  if (triesLeft === 1) {
    const hint = getLastTryHint();
    if (hint) setText("helperText", hint);
    setResult("Wrong. Last try left.", "warning");
  } else {
    setResult(`Wrong. ${triesLeft} tries left.`, "wrong");
  }

  if (input) {
    input.value = "";
    input.focus();
  }

  updateScore();
}

function resetRun() {
  score = 0;
  played = 0;
  tries = 0;
  roundLocked = false;
  resetQueue();
  loadRound();
  updateScore();
}

async function initGamePage() {
  const root = document.querySelector("[data-game-mode]");
  if (!root) return;

  currentMode = root.dataset.gameMode;

  try {
    await loadRoundData();
  } catch (error) {
    console.error(error);
    setText("modeTitle", "DBD Mini Game");
    setText("clueText", "Could not load the round data.");
    setText("helperText", "Run the site through GitHub Pages or a local web server. Opening the HTML file directly can block JSON loading.");
    setInputLocked(true);
    setNextLocked(true);
    return;
  }

  loadBestScore();
  resetQueue();
  updatePageTitle();

  const submit = document.getElementById("submitBtn");
  const next = document.getElementById("nextBtn");
  const reset = document.getElementById("resetBtn");
  const input = document.getElementById("answerInput");

  if (submit) submit.addEventListener("click", checkAnswer);
  if (next) next.addEventListener("click", loadRound);
  if (reset) reset.addEventListener("click", resetRun);

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") checkAnswer();
    });
  }

  updateScore();
  loadRound();
}

document.addEventListener("DOMContentLoaded", () => {
  loadSiteInfo();
  initGamePage();
});