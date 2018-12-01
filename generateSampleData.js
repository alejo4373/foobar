require('dotenv').config();
const { networkRequest } = require('./utils');

const usMajorCities = [
  "seattle",
  "portland",
  "san francisco",
  "los angeles",
  "phoenix",
  "san diego",
  "salt lake city",
  "denver",
  "dallas",
  "austin",
  "houston",
  "minneapolis",
  "chicago",
  "detroit",
  "new york city",
  "baltimore",
  "washington dc",
  "miami"
]

//                 NHL,  NFL,  NBA,  MLS,  MLB
const leagueIds = [4380, 4391, 4387, 4346, 4424];

const fetchLeagueTeams = async (leagueId) => {
  try {
    let { teams } = await networkRequest(`https://www.thesportsdb.com/api/v1/json/1/lookup_all_teams.php?id=${leagueId}`);
    return teams
  } catch (err) {
    throw err;
  }
}

const mapLeaguesToTeams = async () => {
  let map = {}
  for (let i = 0; i < leagueIds.length; i++) {
    let teams;
    try {
      teams = await fetchLeagueTeams(leagueIds[i]);
      map[leagueIds[i].toString()] = teams;
      console.log('map =>', map[leagueIds[i].toString()][0].strTeam);
    } catch (err) {
      console.log('[Error] => ', err)
    }
  }
  return map;
}


mapLeaguesToTeams();