// const USE_MOCK = true;
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DATA_DIR = path.join(__dirname, "../data/idn");
const API_URL = "https://mobile-api.idntimes.com/v3/livestreams";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  Referer: "https://www.idn.app",
};

const MEMBERS = [
  "jkt48_aralie",
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
  "aru_57i7hf1p",
  "jkt48-official",
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
  log("IDN fetch started");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let id = lastId();
  let changed = false;
  let page = 1;

  while (page <= 5) {
    log(`Fetching page ${page}`);

    const res = await axios.get(API_URL, {
      headers: HEADERS,
      params: { page },
    });

    const rooms = res.data?.data || [];
    // let rooms = [];

    // if (USE_MOCK) {
    //   rooms = require("../mock/response.json").data;
    // } else {
    //   const res = await axios.get(API_URL, {
    //     headers: HEADERS,
    //     params: { page },
    //   });
    //   rooms = res.data?.data || [];
    // }

    if (!rooms.length) {
      log(`No data on page ${page}, stopping pagination`);
      break;
    }

    for (const r of rooms) {
      if (!MEMBERS.includes(r.creator?.username)) {
        log(`Skip non-member: ${r.creator?.username || "unknown"}`);
        continue;
      }

      if (!r.live_at) continue;

      const file = path.join(DATA_DIR, `${monthKey(r.live_at)}.json`);
      const data = read(file);

      const key = `${r.creator.username}-${r.live_at}`;
      if (data.some((x) => `${x.username}-${x.live_at_unix}` === key)) {
        log(`Duplicate skipped: ${key}`);
        continue;
      }

      id++;
      log(`New live recorded: ${key}`);

      data.push({
        id,
        username: r.creator.username,
        creator_name: r.creator.name,
        title: r.title || "-",
        live_at: wib(r.live_at),
        live_at_unix: r.live_at,
        image_url: r.image_url || null,
        playback_url: r.playback_url || null,
      });

      write(file, data);
      changed = true;
    }

    page++;
  }

  log("IDN fetch finished");
  return changed;
};
