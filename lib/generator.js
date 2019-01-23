const SpotifyWebApi = require("spotify-web-api-node");
const fetch = require("isomorphic-fetch");
const btoa = require("btoa");
const qs = require("qs");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN
});

const self = (module.exports = {
  getPlaylistTracks: async (playlistId, offset = 0) => {
    try {
      let nextTracks = [];
      let {
        body: { items: fetchedTracks, next }
      } = await spotifyApi.getPlaylistTracks(playlistId, { offset });
      if (next) {
        nextTracks = await self.getPlaylistTracks(playlistId, offset + 100);
      }
      return [...fetchedTracks, ...nextTracks];
    } catch (e) {
      console.log("getPlaylistTracks error ", e);
    }
  },
  getSongsFromPlaylist: async playlistId => {
    try {
      const accessToken = await self.getAccessToken();
      spotifyApi.setAccessToken(accessToken);
      let tracks = await self.getPlaylistTracks(playlistId);
      tracks = self.cleanSongs(tracks);
      return tracks;
    } catch (e) {
      console.log("Error while fetching songs from playlist", e);
    }
  },
  cleanSongs: tracks =>
    tracks.map(item => {
      const track = item.track ? item.track : item;
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        uri: track.uri,
        preview_url: track.preview_url
        // images: track.album.images
      };
    }),
  getAccessToken: async () => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          )}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: qs.stringify({
          grant_type: "refresh_token",
          refresh_token: process.env.REFRESH_TOKEN
        })
      });

      const responseJson = await response.json();
      return responseJson.access_token;
    } catch (err) {
      console.log("Error obtaining access token ", err);
      return err;
    }
  }
});
