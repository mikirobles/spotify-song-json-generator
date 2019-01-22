const fs = require("fs");
const util = require("util");
const _ = require("lodash");

const readFileAsync = util.promisify(fs.readFile);
const readDirAsync = util.promisify(fs.readdir);
const writeFileAsync = util.promisify(fs.writeFile);
const createFileAsync = util.promisify(fs.writeFile);

module.exports = {
  saveObjectToFile: async (object, filePath) => {
    let fileExists = true;
    let json;
    try {
      json = await readFileAsync(filePath);
      json = JSON.parse(json);
      json = json || [];
    } catch (e) {
      fileExists = false;
      json = [];
    }

    if (!Array.isArray(json)) {
      throw new Error("JSON is not an array that we can append the songs to.");
    }
    json = [...json, ...object];
    json = _.uniqBy(json, "id");

    if (fileExists) {
      await writeFileAsync(filePath, JSON.stringify(json));
    } else {
      await createFileAsync(filePath, JSON.stringify(json));
    }
    return true;
  },
  getExistingPlaylists: async dirPath => {
    let files = await readDirAsync(dirPath);
    files = files
      .filter(file => file.indexOf(".json") > 0)
      .map(file => file.slice(0, file.indexOf(".json")));
    return files;
  },
  getLetterCount: async filePath => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let letterMap = {};
    letters.split("").forEach(letter => (letterMap[letter] = 0));
    try {
      json = await readFileAsync(filePath);
      json = JSON.parse(json);
      json.forEach(({ name }) => {
        if (typeof letterMap[name[0].toLowerCase()] !== "undefined") {
          letterMap[name[0].toLowerCase()]++;
        }
      });
      console.table(letterMap);
    } catch (e) {
      console.log("Error while getting letter count", e);
    }
  }
};
