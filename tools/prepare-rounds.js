// tools/prepare-rounds.js
// Safe one-time/helper script:
// - reads old assets/data/rounds.json if it exists
// - creates assets/data/rounds/<mode>.json if missing
// - appends missing rounds by id
// - does NOT delete or overwrite existing split JSON rounds
// - adds isNew: true to every round
// - updates old wiki image fields to characterType + characterId where known

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OLD_ROUNDS_PATH = path.join(ROOT, "assets", "data", "rounds.json");
const SPLIT_DIR = path.join(ROOT, "assets", "data", "rounds");

const MODES = ["classic", "killer", "emoji", "perk", "quote", "lore"];

const CHARACTER_LOOKUP = {
  "yui kimura": { characterType: "survivor", characterId: "yui" },
  "yun-jin lee": { characterType: "survivor", characterId: "yunjinlee" },
  "yun jin lee": { characterType: "survivor", characterId: "yunjinlee" },
  "nea karlsson": { characterType: "survivor", characterId: "neakarlsson" },
  "feng min": { characterType: "survivor", characterId: "fengmin" },
  "mikaela reid": { characterType: "survivor", characterId: "mikela" },
  "dwight fairfield": { characterType: "survivor", characterId: "dwightfairfield" },
  "meg thomas": { characterType: "survivor", characterId: "megthomas" },
  "claudette morel": { characterType: "survivor", characterId: "claudettemorel" },
  "ashley j williams": { characterType: "survivor", characterId: "ashleyjwilliams" },
  "ash williams": { characterType: "survivor", characterId: "ashleyjwilliams" },
  "nicolas cage": { characterType: "survivor", characterId: "nicolascage" },
  "sable ward": { characterType: "survivor", characterId: "sableward" },

  "huntress": { characterType: "killer", characterId: "huntress" },
  "the huntress": { characterType: "killer", characterId: "huntress" },
  "trickster": { characterType: "killer", characterId: "trickster" },
  "the trickster": { characterType: "killer", characterId: "trickster" },
  "legion": { characterType: "killer", characterId: "legion" },
  "the legion": { characterType: "killer", characterId: "legion" },
  "artist": { characterType: "killer", characterId: "artist" },
  "the artist": { characterType: "killer", characterId: "artist" },
  "onryo": { characterType: "killer", characterId: "onryo" },
  "the onryo": { characterType: "killer", characterId: "onryo" },
  "sadako": { characterType: "killer", characterId: "onryo" },
  "pig": { characterType: "killer", characterId: "pig" },
  "the pig": { characterType: "killer", characterId: "pig" },
  "ghost face": { characterType: "killer", characterId: "ghostface" },
  "the ghost face": { characterType: "killer", characterId: "ghostface" },
  "nightmare": { characterType: "killer", characterId: "nightmare" },
  "the nightmare": { characterType: "killer", characterId: "nightmare" },
  "spirit": { characterType: "killer", characterId: "spirit" },
  "the spirit": { characterType: "killer", characterId: "spirit" },
  "nurse": { characterType: "killer", characterId: "nurse" },
  "the nurse": { characterType: "killer", characterId: "nurse" },
  "first": { characterType: "killer", characterId: "first" },
  "the first": { characterType: "killer", characterId: "first" },
  "animatronic": { characterType: "killer", characterId: "animatronic" },
  "the animatronic": { characterType: "killer", characterId: "animatronic" }
};

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRound(round) {
  const copy = { ...round };

  copy.isNew = true;

  if (copy.answer === "Yun-Jin Lee") {
    copy.answer = "Yun Jin Lee";
  }

  if (copy.answer === "This Is Not Happening") {
    copy.hintAfterTry = 1;
    copy.hints = [
      "This is a trick question.",
      "The answer is a survivor perk, not a character."
    ];
  }

  const lookup = CHARACTER_LOOKUP[normalize(copy.answer)];

  if (lookup) {
    copy.characterType = copy.characterType || lookup.characterType;
    copy.characterId = copy.characterId || lookup.characterId;
    delete copy.image;
  }

  return copy;
}

function mergeById(existing, incoming) {
  const byId = new Map();

  for (const round of existing) {
    const safeRound = normalizeRound(round);
    byId.set(safeRound.id, safeRound);
  }

  for (const round of incoming) {
    const safeRound = normalizeRound(round);

    if (!safeRound.id) continue;

    if (!byId.has(safeRound.id)) {
      byId.set(safeRound.id, safeRound);
    }
  }

  return [...byId.values()];
}

function main() {
  fs.mkdirSync(SPLIT_DIR, { recursive: true });

  const oldRounds = readJson(OLD_ROUNDS_PATH, {});

  for (const mode of MODES) {
    const splitPath = path.join(SPLIT_DIR, `${mode}.json`);
    const existing = readJson(splitPath, []);
    const incoming = Array.isArray(oldRounds[mode]) ? oldRounds[mode] : [];

    const merged = mergeById(existing, incoming);
    writeJson(splitPath, merged);

    console.log(`${mode}.json: ${existing.length} existing, ${incoming.length} old, ${merged.length} final`);
  }

  console.log("");
  console.log("Done. Check assets/data/rounds/*.json.");
  console.log("After the site works with split files, you can delete assets/data/rounds.json.");
}

main();