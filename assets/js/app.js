const DEMO_ROUNDS = {
  classic: [
    {
      clue: "A ranged killer who hums and throws hatchets.",
      helper: "This one is mostly known by sound before you even see her.",
      answer: "Huntress",
      aliases: ["the huntress", "anna"]
    },
    {
      clue: "A survivor connected to motorcycles, racing, and the All-Kill chapter.",
      helper: "She is one of the more stylish survivor picks.",
      answer: "Yun-Jin Lee",
      aliases: ["yun jin", "yun-jin", "yun-jin lee", "yunjin"]
    }
  ],

  killer: [
    {
      clue: "This killer places traps and punishes survivors who do not watch their step.",
      helper: "Old-school, simple, and still annoying when the basement is involved.",
      answer: "Trapper",
      aliases: ["the trapper", "evan", "evan macmillan"]
    },
    {
      clue: "This killer stalks survivors and can expose them before attacking.",
      helper: "The mask is doing a lot of work here.",
      answer: "Ghost Face",
      aliases: ["ghostface", "the ghost face", "danny", "jed"]
    }
  ],

  emoji: [
    {
      clue: "🪓🎵🌲",
      helper: "A song, a forest, and something flying at your head.",
      answer: "Huntress",
      aliases: ["the huntress", "anna"]
    },
    {
      clue: "📺💀🕯️",
      helper: "You probably do not want to take too many tapes.",
      answer: "Onryo",
      aliases: ["the onryo", "sadako"]
    }
  ],

  perk: [
    {
      clue: "After stunning or blinding the killer, you break into a sprint.",
      helper: "A classic survivor exhaustion perk.",
      answer: "Lithe",
      aliases: ["lithe"]
    },
    {
      clue: "When a generator is close to completion, survivors face a chain of difficult skill checks.",
      helper: "Storm warning.",
      answer: "Merciless Storm",
      aliases: ["merciless storm"]
    }
  ],

  quote: [
    {
      clue: "\"Death is not an escape.\"",
      helper: "The line most players know from the game itself.",
      answer: "The Entity",
      aliases: ["entity", "the entity"]
    },
    {
      clue: "\"I want to play a game.\"",
      helper: "Not originally DbD, but very tied to one licensed killer.",
      answer: "Pig",
      aliases: ["the pig", "amanda", "amanda young"]
    }
  ],

  lore: [
    {
      clue: "A young woman pulled into darkness after surviving a cursed videotape and spreading fear through screens.",
      helper: "TVs are not your friend here.",
      answer: "Onryo",
      aliases: ["the onryo", "sadako"]
    },
    {
      clue: "A man from a wealthy family who became obsessed with control, punishment, and steel traps.",
      helper: "One of the original killers.",
      answer: "Trapper",
      aliases: ["the trapper", "evan macmillan", "evan"]
    }
  ],

  terror: [
    {
      clue: "A lullaby reaches you before the actual terror radius becomes the main problem.",
      helper: "The audio warning is almost more iconic than the chase music.",
      answer: "Huntress",
      aliases: ["the huntress", "anna"]
    },
    {
      clue: "A sudden stealthy reveal can make the terror radius feel like it arrived too late.",
      helper: "You may only notice him when the expose is already a problem.",
      answer: "Ghost Face",
      aliases: ["ghostface", "the ghost face", "danny", "jed"]
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

let currentMode = null;
let currentRound = null;
let score = 0;
let played = 0;

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickRound(mode) {
  const rounds = DEMO_ROUNDS[mode] || [];
  if (!rounds.length) return null;
  return rounds[Math.floor(Math.random() * rounds.length)];
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setResult(message, isCorrect) {
  const result = document.getElementById("result");
  if (!result) return;

  result.classList.add("show");
  result.textContent = message;
  result.style.border = isCorrect
    ? "1px solid rgba(98, 220, 127, 0.45)"
    : "1px solid rgba(255, 55, 55, 0.45)";
}

function updateScore() {
  setText("scoreText", `Score: ${score}`);
  setText("playedText", `Played: ${played}`);
}

function loadRound() {
  currentRound = pickRound(currentMode);

  const input = document.getElementById("answerInput");
  const result = document.getElementById("result");

  if (input) {
    input.value = "";
    input.disabled = false;
    input.focus();
  }

  if (result) {
    result.classList.remove("show");
    result.textContent = "";
  }

  if (!currentRound) {
    setText("clueText", "No demo rounds found for this mode yet.");
    setText("helperText", "");
    return;
  }

  setText("clueText", currentRound.clue);
  setText("helperText", currentRound.helper || "Type your guess below.");
}

function checkAnswer() {
  if (!currentRound) return;

  const input = document.getElementById("answerInput");
  const guess = normalizeAnswer(input?.value);
  const answer = normalizeAnswer(currentRound.answer);
  const aliases = (currentRound.aliases || []).map(normalizeAnswer);

  if (!guess) {
    setResult("Type a guess first.", false);
    return;
  }

  played += 1;

  const correct = guess === answer || aliases.includes(guess);

  if (correct) {
    score += 1;
    setResult(`Correct. The answer was ${currentRound.answer}.`, true);
  } else {
    setResult(`Wrong. The answer was ${currentRound.answer}.`, false);
  }

  if (input) input.disabled = true;
  updateScore();
}

function initGamePage() {
  const root = document.querySelector("[data-game-mode]");
  if (!root) return;

  currentMode = root.dataset.gameMode;
  setText("modeTitle", MODE_TITLES[currentMode] || "DBD Mini Game");
  updateScore();
  loadRound();

  const submit = document.getElementById("submitBtn");
  const next = document.getElementById("nextBtn");
  const input = document.getElementById("answerInput");

  if (submit) submit.addEventListener("click", checkAnswer);
  if (next) next.addEventListener("click", loadRound);

  if (input) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") checkAnswer();
    });
  }
}

document.addEventListener("DOMContentLoaded", initGamePage);