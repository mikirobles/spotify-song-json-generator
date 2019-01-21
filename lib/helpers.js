const fs = require("fs");
const util = require("util");

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
    } catch (e) {
      fileExists = false;
      json = [];
    }

    if (!Array.isArray(json)) {
      throw new Error("JSON is not an array that we can append the songs to.");
    }
    json = [...json, ...object];

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
  }
};
