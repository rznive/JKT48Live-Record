const fetchIDN = require("./src/fetchLIVEIDN");
const fetchShowroom = require("./src/fetchLIVESR");
const gen = require("./src/generate-readme");
(async () => {
  let changed = false;
  changed = (await fetchIDN()) || changed;
  changed = (await fetchShowroom()) || changed;

  gen();
})();
