const fs = require("fs");
const path = require("path");

const DIR_IDN = path.join(__dirname, "../data/idn");
const DIR_SHOWROOM = path.join(__dirname, "../data/showroom");
const README = path.join(__dirname, "../README.md");

module.exports = () => {
  function loadData(DIR) {
    if (!fs.existsSync(DIR)) return [];
    let all = [];
    for (const f of fs.readdirSync(DIR)) {
      all.push(...JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
    }
    return all.sort((a, b) => b.live_at_unix - a.live_at_unix).slice(0, 50);
  }

  const dataIDN = loadData(DIR_IDN);
  const dataShowroom = loadData(DIR_SHOWROOM);

  const tableIDN = dataIDN
    .map(
      (x) =>
        `| ${x.id} | <img src="${x.image_url}" width="170"> | ${x.creator_name} | ${x.title} | ${x.live_at} |`,
    )
    .join("\n");

  const tableShowroom = dataShowroom
    .map(
      (x) =>
        `| ${x.id} | <img src="${x.image_url}" width="170"> | ${x.creator_name} | ${x.title} | ${x.live_at} |`,
    )
    .join("\n");

  const content = `
## 🔴 IDNLIVE JKT48

| No | Image | Member | Judul | Waktu |
|----|--------|-------------|-------|-------|
${tableIDN}

## 🔴 SHOWROOMLIVE JKT48

| No | Image | Member | Judul | Waktu |
|----|--------|-------------|-------|-------|
${tableShowroom}
`;

  fs.writeFileSync(README, content.trim() + "\n", "utf8");
};

if (require.main === module) {
  module.exports();
}
