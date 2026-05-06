const DEMO_ROUNDS = {
  classic: [
    {
      clue: "A ranged killer who hums and throws hatchets.",
      helper: "This one is mostly known by sound before you even see her.",
      finalHint: "Her lullaby is one of the easiest killer audio clues in the game.",
      answer: "Huntress",
      aliases: ["the huntress", "anna"]
    },
    {
      clue: "A survivor connected to fame, music production, and the All-Kill chapter.",
      helper: "She is not the performer, but she is very tied to that chapter.",
      finalHint: "She worked with Ji-Woon Hak before ending up in the Fog.",
      answer: "Yun-Jin Lee",
      aliases: ["yun jin", "yun-jin", "yun-jin lee", "yunjin"]
    },
    {
      clue: "A survivor connected to motorcycles, racing, and rebellious street style.",
      helper: "This one has nothing to do with All-Kill.",
      finalHint: "Her name starts with Yui.",
      answer: "Yui Kimura",
      aliases: ["yui", "yui kimura"]
    },
    {
      clue: "A killer known for bear traps, the MacMillan Estate, and brutal control.",
      helper: "One of the original DbD killers.",
      finalHint: "He is the poster boy for stepping in the wrong place.",
      answer: "Trapper",
      aliases: ["the trapper", "evan", "evan macmillan"]
    }
  ],

  killer: [
    {
      clue: "This killer places traps and punishes survivors who do not watch their step.",
      helper: "Old-school, simple, and still annoying when the basement is involved.",
      finalHint: "His power is literally bear traps.",
      answer: "Trapper",
      aliases: ["the trapper", "evan", "evan macmillan"]
    },
    {
      clue: "This killer stalks survivors and can expose them before attacking.",
      helper: "The mask is doing a lot of work here.",
      finalHint: "He is tied to phone calls, stalking, and a white mask.",
      answer: "Ghost Face",
      aliases: ["ghostface", "the ghost face", "danny", "jed", "jed olsen"]
    },
    {
      clue: "This killer teleports between TVs and punishes survivors who ignore tapes.",
      helper: "A cursed screen is usually involved.",
      finalHint: "Her name is Sadako.",
      answer: "Onryo",
      aliases: ["the onryo", "sadako", "sadako yamamura"]
    }
  ],

  emoji: [
    {
      clue: "🪓🎵🌲",
      helper: "A song, a forest, and something flying at your head.",
      finalHint: "The song is her lullaby.",
      answer: "Huntress",
      aliases: ["the huntress", "anna"]
    },
    {
      clue: "📺💀🕯️",
      helper: "You probably do not want to take too many tapes.",
      finalHint: "The TVs give it away.",
      answer: "Onryo",
      aliases: ["the onryo", "sadako"]
    },
    {
      clue: "🔪📞👻",
      helper: "A phone call would not be shocking here.",
      finalHint: "The mask is the big clue.",
      answer: "Ghost Face",
      aliases: ["ghostface", "the ghost face", "danny", "jed"]
    }
  ],

  perk: [
    {
      clue: "After a rushed vault, you break into a sprint.",
      helper: "A classic survivor exhaustion perk.",
      finalHint: "The name is short and starts with L.",
      answer: "Lithe",
      aliases: ["lithe"]
    },
    {
      clue: "When a generator is close to completion, survivors face a chain of difficult skill checks.",
      helper: "Storm warning.",
      finalHint: "It is one of Onryo's perks.",
      answer: "Merciless Storm",
      aliases: ["merciless storm"]
    },
    {
      clue: "You see the killer's aura after they damage a generator.",
      helper: "Useful when the killer kicks your progress away.",
      finalHint: "The perk name sounds like being warned.",
      answer: "Alert",
      aliases: ["alert"]
    }
  ],

  quote: [
    {
      clue: "\"Death is not an escape.\"",
      helper: "The line most players know from the game itself.",
      finalHint: "It is not a survivor or killer. It is the thing controlling the realm.",
      answer: "The Entity",
      aliases: ["entity", "the entity"]
    },
    {
      clue: "\"I want to play a game.\"",
      helper: "Not originally DbD, but very tied to one licensed killer.",
      finalHint: "Reverse Bear Traps.",
      answer: "Pig",
      aliases: ["the pig", "amanda", "amanda young"]
    },
    {
      clue: "\"This isn't happening.\"",
      helper: "It is also a survivor perk name.",
      finalHint: "The answer is the perk name itself.",
      answer: "This Is Not Happening",
      aliases: ["this is not happening"]
    }
  ],

  lore: [
    {
      clue: "A young woman pulled into darkness after surviving a cursed videotape and spreading fear through screens.",
      helper: "TVs are not your friend here.",
      finalHint: "Her better-known name is Sadako.",
      answer: "Onryo",
      aliases: ["the onryo", "sadako", "sadako yamamura"]
    },
    {
      clue: "A man from a wealthy family who became obsessed with control, punishment, and steel traps.",
      helper: "One of the original killers.",
      finalHint: "MacMillan Estate is a big clue.",
      answer: "Trapper",
      aliases: ["the trapper", "evan macmillan", "evan"]
    },
    {
      clue: "A performer whose music career became tied to violence, fame, and bright neon style.",
      helper: "All-Kill energy.",
      finalHint: "Ji-Woon Hak.",
      answer: "Trickster",
      aliases: ["the trickster", "trickster", "ji-woon", "ji woon", "ji-woon hak"]
    }
  ],

  terror: [
    {
      clue: "A lullaby reaches you before the actual terror radius becomes the main problem.",
      helper: "The audio warning is almost more iconic than the chase music.",
      finalHint: "Hatchets.",
      answer: "Huntress",
      aliases: ["the huntress", "anna"]
    },
    {
      clue: "A sudden stealthy reveal can make the terror radius feel like it arrived too late.",
      helper: "You may only notice him when the expose is already a problem.",
      finalHint: "He stalks with a white mask.",
      answer: "Ghost Face",
      aliases: ["ghostface", "the ghost face", "danny", "jed"]
    },
    {
      clue: "The terror can feel confusing because TVs and projection pressure are part of the map control.",
      helper: "Screens again. Always screens.",
      finalHint: "Sadako.",
      answer: "Onryo",
      aliases: ["the onryo", "sadako"]
    }
  ]
};

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
  const rounds = DEMO_ROUNDS[currentMode] || [];
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

  setText("scoreText", `Score: ${score}`);
  setText("playedText", `Played: ${played}`);
  setText("bestText", `Best: ${bestScore}`);
  setText("leftText", `Left: ${roundQueue.length}`);
  setText("triesText", `Tries: ${tries}/${MAX_TRIES}`);
}

function updatePageTitle() {
  const title = MODE_TITLES[currentMode] || "DBD Mini Game";

  setText("modeTitle", title);
  document.title = `${title} - DBD Mini Games`;
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

  if (!currentRound) {
    setText("clueText", "No demo rounds found for this mode yet.");
    setText("helperText", "");
    setInputLocked(true);
    return;
  }

  setText("clueText", currentRound.clue);
  setText("helperText", currentRound.helper || "Type your guess below.");
  updateScore();
}

function checkAnswer() {
  if (!currentRound || roundLocked) return;

  const input = document.getElementById("answerInput");
  const guess = normalizeAnswer(input?.value);
  const answer = normalizeAnswer(currentRound.answer);
  const aliases = (currentRound.aliases || []).map(normalizeAnswer);

  if (!guess) {
    setResult("Type a guess first.", "wrong");
    return;
  }

  tries += 1;

  const correct = guess === answer || aliases.includes(guess);

  if (correct) {
    score += 1;
    played += 1;
    roundLocked = true;
    setInputLocked(true);
    setResult(`Correct. The answer was ${currentRound.answer}.`, "correct");
    updateScore();
    return;
  }

  if (tries >= MAX_TRIES) {
    played += 1;
    roundLocked = true;
    setInputLocked(true);
    setResult(`Out of tries. The answer was ${currentRound.answer}.`, "wrong");
    updateScore();
    return;
  }

  const triesLeft = MAX_TRIES - tries;

  if (triesLeft === 1 && currentRound.finalHint) {
    setText("helperText", currentRound.finalHint);
    setResult(`Wrong. Last try left, so here is a stronger hint.`, "warning");
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

function initGamePage() {
  const root = document.querySelector("[data-game-mode]");
  if (!root) return;

  currentMode = root.dataset.gameMode;

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