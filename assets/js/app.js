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
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  if (image) image.removeAttribute("src");
  if (image) image.alt = "";
  if (name) name.textContent = "";
}

function showCharacterReveal() {
  if (!currentRound?.image) return;

  const reveal = document.getElementById("characterReveal");
  const image = document.getElementById("characterImage");
  const name = document.getElementById("characterName");

  if (!reveal || !image || !name) return;

  image.src = currentRound.image;
  image.alt = currentRound.answer;
  name.textContent = currentRound.answer;
  reveal.hidden = false;
}

function getCurrentHint() {
  const hints = currentRound?.hints || [];
  if (!hints.length) return "";

  if (tries <= 0) return "";
  if (tries === 1) return hints[0] || "";
  return hints[1] || hints[0] || "";
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
  clearResult();
  hideCharacterReveal();

  if (!currentRound) {
    setText("clueText", "No rounds found for this mode yet.");
    setText("helperText", "");
    setInputLocked(true);
    return;
  }

  setText("clueText", currentRound.clue);
  setText("helperText", "You get 3 tries. Extra hints only appear after wrong guesses.");
  updateScore();
}

function checkAnswer() {
  if (!currentRound || roundLocked) return;

  const input = document.getElementById("answerInput");
  const guess = normalizeAnswer(input?.value);
  const answer = normalizeAnswer(currentRound.answer);
  const aliases = (currentRound.aliases || []).map(normalizeAnswer);

  if (!guess) {
    setResult("Type a guess first.", "warning");
    return;
  }

  tries += 1;

  const correct = guess === answer || aliases.includes(guess);

  if (correct) {
    score += 1;
    played += 1;
    roundLocked = true;
    setInputLocked(true);
    showCharacterReveal();
    setResult(`Correct. The answer was ${currentRound.answer}.`, "correct");
    updateScore();
    return;
  }

  if (tries >= MAX_TRIES) {
    played += 1;
    roundLocked = true;
    setInputLocked(true);
    showCharacterReveal();
    setResult(`Out of tries. The answer was ${currentRound.answer}.`, "wrong");
    updateScore();
    return;
  }

  const hint = getCurrentHint();
  const triesLeft = MAX_TRIES - tries;

  if (hint) {
    setText("helperText", hint);
  }

  setResult(`Wrong. ${triesLeft} ${triesLeft === 1 ? "try" : "tries"} left.`, "wrong");

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
    setText("helperText", "Check assets/data/rounds.json and make sure the path is correct.");
    setInputLocked(true);
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

document.addEventListener("DOMContentLoaded", initGamePage);