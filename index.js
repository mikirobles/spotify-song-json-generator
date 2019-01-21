require("dotenv").config();

var inquirer = require("inquirer");
var generator = require("./lib/generator");
var helpers = require("./lib/helpers");

helpers.getExistingPlaylists("./dist").then(playlists => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "playlistId",
        message: "Enter the playlistId to copy the songs from"
      },
      {
        type: "input",
        name: "jsonName",
        message: "Enter the name of the genre/json to output (e.g.: alt-rock)"
      }
    ])
    .then(async ({ playlistId, jsonName, ...answers }) => {
      const tracks = await generator.getSongsFromPlaylist(playlistId);
      await helpers.saveObjectToFile(tracks, `./dist/${jsonName}.json`);
      console.log("Finished!");
    });
});
