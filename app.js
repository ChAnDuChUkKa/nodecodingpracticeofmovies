//importing express and instance creation
const express = require("express");
const app = express();

//importing path sqlite and sqlite3
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

//use of json in js script
app.use(express.json());

//initailizing database and creating path
const dataPath = path.join(__dirname, "cricketMatchDetails.db");
let dataBase = null;

//initializing database and Server
const initializingDatabaseAndServer = async () => {
  try {
    dataBase = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at localhost 3000");
    });
  } catch (error) {
    console.log("error");
    process.exit(1);
  }
};
initializingDatabaseAndServer();

//creating result in given output formats
const outputFormatPlayer = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const outputFormatForMatch = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

//creating API1
app.get("/players/", async (request, response) => {
  const query = `
    select * from player_details
    `;
  const result = await dataBase.all(query);
  response.send(result.map((eachPlayer) => outputFormatPlayer(eachPlayer)));
});

//creating API2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
  select * from player_details where
  player_id=${playerId}
  `;
  const responseData = await dataBase.get(playerQuery);
  response.send(outputFormatPlayer(responseData));
});

//creating API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQuery = `
  update player_details
  set 
  player_name='${playerName}'
  where player_id=${playerId}
  `;
  const updateResponse = await dataBase.run(updateQuery);
  response.send("Player Details Updated");
});

//creating API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    select * from match_details where 
    match_id=${matchId}
    `;
  const resultingResponse = await dataBase.get(matchQuery);
  response.send(outputFormatForMatch(resultingResponse));
});

//creating API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerDetailsQuery = `
  select 
  *
  from 
  player_match_score natural join match_details 
  
  where
  player_id=${playerId}
  `;
  const player = await dataBase.all(playerDetailsQuery);
  response.send(player.map((eachMatch) => outputFormatForMatch(eachMatch)));
});

//creating API6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    select * from player_match_score natural join
    player_details
    where
    match_id=${matchId} 
    `;
  const match = await dataBase.all(matchQuery);
  response.send(match.map((eachPlayer) => outputFormatPlayer(eachPlayer)));
});

//creating API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerScoreQuery = `
  select player_id as playerId,
  player_name as playerName,
  sum(score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes
  from player_match_score  natural join player_details
  where
  player_id=${playerId}
  `;
  const playerResponse = await dataBase.get(playerScoreQuery);
  response.send(playerResponse);
});
module.exports = app;
