require("dotenv").config();

var inquirer = require("inquirer");
var generator = require("./lib/generator");
var helpers = require("./lib/helpers");
let playlists;
const choices = {
  createAdd: "Create/Add songs to playlist",
  analyze: "Analyze existing playlist",
  other: "Other (create a new one)"
};

async function askName() {
  const { jsonName } = await inquirer.prompt([
    {
      type: "input",
      name: "jsonName",
      message: "Enter the name of the genre/json to output (e.g.: alt-rock)"
    }
  ]);
  return jsonName;
}

async function askPlaylistId() {
  const { playlistId } = await inquirer.prompt([
    {
      type: "input",
      name: "playlistId",
      message: "Enter the playlistId to copy the songs from"
    }
  ]);
  return playlistId;
}

async function addSongsToPlaylist() {
  let jsonName;
  if (playlists.length) {
    let answers = await inquirer.prompt([
      {
        type: "list",
        name: "jsonName",
        message: "Choose an existing genre/name or create a new one",
        choices: [...playlists, choices.other]
      }
    ]);
    if (answers.jsonName === choices.other) {
      jsonName = await askName();
    } else {
      jsonName = answers.jsonName;
    }
  } else {
    jsonName = await askName();
  }

  const playlistId = await askPlaylistId();
  const tracks = await generator.getSongsFromPlaylist(playlistId);
  await helpers.saveObjectToFile(tracks, `./dist/${jsonName}.json`);
  console.log("Finished!");
}

async function countLettersInPlaylist() {
  if (playlists.length === 0) {
    console.log(
      "There is no playlists available to analyze, create one first."
    );
    return;
  }
  let { jsonName } = await inquirer.prompt([
    {
      type: "list",
      name: "jsonName",
      message: "Choose one genre/name",
      choices: playlists
    }
  ]);
  const letterCount = helpers.getLetterCount(`./dist/${jsonName}.json`);
}

async function init() {
  playlists = await helpers.getExistingPlaylists("./dist");
  if (playlists.length === 0) {
    addSongsToPlaylist();
  } else {
    let { whatToDo } = await inquirer.prompt([
      {
        type: "list",
        name: "whatToDo",
        message: "What do you want to do?",
        choices: [choices.createAdd, choices.analyze]
      }
    ]);
    if (whatToDo === choices.createAdd) {
      addSongsToPlaylist();
    } else if (whatToDo === choices.analyze) {
      countLettersInPlaylist();
    }
  }
}

init();
