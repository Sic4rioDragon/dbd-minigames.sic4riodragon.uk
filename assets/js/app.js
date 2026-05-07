const MODE_TITLES = {
  classic: "Classic Guess",
  killer: "Killer Guess",
  emoji: "Emoji Guess",
  perk: "Perk Guess",
  quote: "Quote Guess",
  lore: "Lore Guess"
};

const MAX_TRIES = 3;

let rounds = [];
let currentMode = null;
let currentRound = null;
let roundQueue = [];
let characterData = {
  killers: [],
  survivors: []
};

let score = 0;
let played = 0;
let bestScore = 0;
let tries = 0;
let roundLocked = false;

function getRoot() {
  return document.querySelector("[data-game-mode]");
}

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

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDoneKey() {
  return `dbd-minigames-done-${getTodayKey()}-${currentMode}`;
}

function getDoneIds() {
  try {
    return JSON.parse(localStorage.getItem(getDoneKey()) || "[]");
  } catch {
    return [];
  }
}

function saveDoneIds(ids) {
  localStorage.setItem(getDoneKey(), JSON.stringify([...new Set(ids)]));
}

function markRoundDone(roundId) {
  if (!roundId) return;

  const ids = getDoneIds();
  ids.push(roundId);
  saveDoneIds(ids);
}

function clearDoneRounds() {
  localStorage.removeItem(getDoneKey());
}

function resetQueue() {
  const doneIds = new Set(getDoneIds());
  const availableRounds = rounds.filter(round => !doneIds.has(round.id));

  roundQueue = shuffleList(availableRounds);
}

function showAllDoneState() {
  currentRound = null;
  roundLocked = true;
  tries = 0;

  setText("clueText", "Everything done for this mode today.");
  setText("helperText", "You finished every available round. Want to reset this mode and play them again?");

  setInputLocked(true);

  const next = document.getElementById("nextBtn");
  if (next) next.disabled = true;

  setResult("All rounds complete. Press Reset if you want to replay this mode.", "warning");
  updateScore();
}

function pickRound() {
  if (!roundQueue.length) resetQueue();

  if (!roundQueue.length) {
    return null;
  }

  return roundQueue.shift();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getGameDataPath() {
  const root = document.querySelector("[data-game-mode]");
  return root?.dataset.roundsPath || "../../assets/data/rounds/classic.json";
}

function getSiteInfoPath() {
  return getRoot() ? "../../assets/data/site.json" : "assets/data/site.json";
}

function getDbDAssetsBase() {
  const root = getRoot();
  return root?.dataset.dbdAssetsBase || "https://deadbydaylight.sic4riodragon.uk/";
}

function makeAbsoluteDbDUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  return new URL(path, getDbDAssetsBase()).href;
}

async function loadJsonSafe(path) {
  if (!path) return null;

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load JSON from ${path}`);
  }

  return response.json();
}

async function loadSiteInfo() {
  const versionEls = document.querySelectorAll("#siteVersion");
  if (!versionEls.length) return;

  try {
    const response = await fetch(getSiteInfoPath());

    if (!response.ok) {
      throw new Error("Could not load site.json");
    }

    const info = await response.json();
    const version = info.version || "v0.0.1";

    versionEls.forEach(el => {
      el.textContent = version;
    });
  } catch {
    versionEls.forEach(el => {
      el.textContent = "v0.0.1";
    });
  }
}

async function loadRoundData() {
  const path = getGameDataPath();
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load rounds from ${path}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    rounds = data;
    return;
  }

  if (Array.isArray(data?.rounds)) {
    rounds = data.rounds;
    return;
  }

  throw new Error("Round JSON must be an array or contain a rounds array.");
}

async function loadCharacterData() {
  const root = getRoot();
  if (!root) return;

  const killersPath = root.dataset.killersPath || "";
  const survivorsPath = root.dataset.survivorsPath || "";

  try {
    const [killersJson, survivorsJson] = await Promise.all([
      loadJsonSafe(killersPath),
      loadJsonSafe(survivorsPath)
    ]);

    characterData.killers = killersJson?.killers || [];
    characterData.survivors = survivorsJson?.survivors || [];
  } catch (error) {
    console.warn("Could not load character data:", error);
    characterData.killers = [];
    characterData.survivors = [];
  }
}

function findCharacter(round) {
  const type = String(round?.characterType || round?.type || "").toLowerCase();
  const id = String(round?.characterId || "").toLowerCase();

  if (!id) return null;

  const list = type === "killer"
    ? characterData.killers
    : characterData.survivors;

  return list.find(character => String(character.id || "").toLowerCase() === id) || null;
}

function getRoundImage(round) {
  if (round?.image) return round.image;

  const character = findCharacter(round);
  if (!character?.img) return "";

  return makeAbsoluteDbDUrl(character.img);
}

function buildResultHtml(message, state, round) {
  const imageUrl = getRoundImage(round);

  if (!roundLocked || !imageUrl) {
    return `<span>${message}</span>`;
  }

  return `
    <img class="result-portrait" src="${imageUrl}" alt="${round.answer}" />
    <span>${message}</span>
  `;
}

function setResult(message, state, withPortrait = false) {
  const result = document.getElementById("result");
  if (!result) return;

  result.classList.add("show");
  result.dataset.state = state;

  if (withPortrait) {
    result.innerHTML = buildResultHtml(message, state, currentRound);
  } else {
    result.textContent = message;
  }

  const img = result.querySelector(".result-portrait");

  if (img) {
    img.onerror = () => {
      img.remove();
    };
  }
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
  setResult(message, state, true);
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

  if (!currentRound) {
    if (rounds.length) {
      showAllDoneState();
    } else {
      setText("clueText", "No rounds found for this mode yet.");
      setText("helperText", "");
      setInputLocked(true);
    }

    return;
  }

  setText("clueText", currentRound.clue);
  setText("helperText", currentRound.isNew ? "New round." : "");
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
    played += 1;
    roundLocked = true;

    markRoundDone(currentRound.id);

    setInputLocked(true);
    showCharacterReveal();
    setResult(`Correct. The answer was ${currentRound.answer}.`, "correct");
    updateScore();
    return;
  }

  if (tries >= MAX_TRIES) {
    played += 1;
    roundLocked = true;

    markRoundDone(currentRound.id);

    setInputLocked(true);
    showCharacterReveal();
    setResult(`Out of tries. The answer was ${currentRound.answer}.`, "wrong");
    updateScore();
    return;
  }

  const triesLeft = MAX_TRIES - tries;

  const earlyHint = currentRound.hintAfterTry === tries
    ? currentRound.hints?.[0] || ""
    : "";

  if (earlyHint) {
    setText("helperText", earlyHint);
    setResult(`Wrong. ${triesLeft} ${triesLeft === 1 ? "try" : "tries"} left.`, "warning");
  } else if (triesLeft === 1) {
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

  clearDoneRounds();
  resetQueue();
  loadRound();
  updateScore();
}

async function initGamePage() {
  const root = getRoot();
  if (!root) return;

  currentMode = root.dataset.gameMode;

  try {
    await loadRoundData();
    await loadCharacterData();
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

function getDbDAssetsBase() {
  const root = document.querySelector("[data-game-mode]");
  return root?.dataset.dbdAssetsBase || "https://deadbydaylight.sic4riodragon.uk/";
}

function makeAbsoluteDbDUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  return new URL(path, getDbDAssetsBase()).href;
}

async function loadJsonSafe(path) {
  if (!path) return null;

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load JSON from ${path}`);
  }

  return response.json();
}

async function loadCharacterData() {
  const root = document.querySelector("[data-game-mode]");
  if (!root) return;

  try {
    const [killersJson, survivorsJson] = await Promise.all([
      loadJsonSafe(root.dataset.killersPath),
      loadJsonSafe(root.dataset.survivorsPath)
    ]);

    characterData.killers = killersJson?.killers || [];
    characterData.survivors = survivorsJson?.survivors || [];
  } catch (error) {
    console.warn("Could not load character data:", error);
    characterData.killers = [];
    characterData.survivors = [];
  }
}

function findCharacter(round) {
  const type = String(round?.characterType || round?.type || "").toLowerCase();
  const id = String(round?.characterId || "").toLowerCase();

  if (!id) return null;

  const list = type === "killer"
    ? characterData.killers
    : characterData.survivors;

  return list.find(character => String(character.id || "").toLowerCase() === id) || null;
}

function getRoundImage(round) {
  if (round?.image) return round.image;

  const character = findCharacter(round);
  if (!character?.img) return "";

  return makeAbsoluteDbDUrl(character.img);
}
