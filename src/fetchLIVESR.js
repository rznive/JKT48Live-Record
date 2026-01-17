const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DATA_DIR = path.join(__dirname, "../data/showroom");
const API_URL = "https://www.showroom-live.com/api/live/onlives";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  Referer: "https://www.showroom-live.com/",
};

const MEMBERS = [
  "jkt48_delynn",
  "jkt48_alya",
  "jkt48_christy",
  "jkt48_amanda",
  "jkt48_anindya",
  "jkt48_virgi",
  "jkt48_auwia",
  "jkt48_lia",
  "jkt48_lana",
  "jkt48_rilly",
  "jkt48_erine",
  "jkt48_cathy",
  "jkt48_elin",
  "jkt48_chelsea",
  "jkt48_oniel",
  "jkt48_cynthia",
  "jkt48_danella",
  "jkt48_daisy",
  "jkt48_olla",
  "jkt48_feni",
  "jkt48_fiony",
  "jkt48_freya",
  "jkt48_fritzy",
  "jkt48_ella",
  "jkt48_gendis",
  "jkt48_gita",
  "jkt48_gracie",
  "jkt48_greesel",
  "jkt48_giaa",
  "jkt48_eli",
  "jkt48_lily",
  "jkt48_maira",
  "jkt48_indah",
  "jkt48_ekin",
  "jkt48_trisha",
  "jkt48_jemima",
  "jkt48_jessi",
  "jkt48_lyn",
  "jkt48_official",
  "jkt48_kathrina",
  "jkt48_marsha",
  "jkt48_michie",
  "jkt48_levi",
  "jkt48_mikaela",
  "jkt48_muthe",
  "jkt48_nayla",
  "jkt48_nachia",
  "jkt48_intan",
  "jkt48_oline",
  "jkt48_raisha",
  "jkt48_ribka",
  "jkt48_nala",
  "jkt48_gracia",
  "jkt48_kimmy",
];

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}
function monthKey(unix) {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function wib(unix) {
  return (
    new Date(unix * 1000).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIB"
  );
}
function read(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function lastId() {
  if (!fs.existsSync(DATA_DIR)) return 0;
  let max = 0;
  for (const f of fs.readdirSync(DATA_DIR)) {
    for (const x of read(path.join(DATA_DIR, f))) {
      if (x.id > max) max = x.id;
    }
  }
  return max;
}

module.exports = async () => {
  log("SHOWROOM fetch started");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  let id = lastId();
  let changed = false;
  try {
    const res = await axios.get(API_URL, { headers: HEADERS });
    const onlives = res.data?.onlives || [];
    for (const genre of onlives) {
      for (const live of genre.lives || []) {
        if (!MEMBERS.includes(live.room_url_key)) continue;
        const username = live.room_url_key;
        const live_at_unix = live.started_at;
        const key = `${username}-${live_at_unix}`;
        const file = path.join(DATA_DIR, `${monthKey(live_at_unix)}.json`);
        const data = read(file);
        if (data.some((x) => `${x.username}-${x.live_at_unix}` === key)) {
          log(`Duplicate skipped: ${key}`);
          continue;
        }
        id++;
        log(`New live recorded: ${key}`);
        data.push({
          id,
          username,
          creator_name: live.main_name || "-",
          title: live.telop || "-",
          live_at: wib(live_at_unix),
          live_at_unix,
          image_url: live.image || live.image_square || null,
          playback_url: live.streaming_url_list?.[0]?.url || null,
        });
        write(file, data);
        changed = true;
      }
    }
    log("SHOWROOM fetch finished");
    return changed;
  } catch (err) {
    log(`Error fetching SHOWROOM: ${err.message}`);
    return false;
  }
};
