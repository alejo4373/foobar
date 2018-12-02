require('dotenv').config();
const uuidv1 = require('uuid/v1');
const { networkRequest } = require('./utils');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

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

const fetchEstablishmentsForCity = async (city) => {
  let establishments = [];
  try {
    let { json } = await googleMapsClient.places({ query: `sports bars in ${city}` }).asPromise()
    establishments = json.results;
    return (establishments);
  } catch (err) {
    throw err
  }
}

const createEstablishmentObj = (place) => {
  const establishment = {
    id: uuidv1(),
    managerUsername: 'sample',
    googlePlaceId: place.id,
    name: place.name.toLowerCase(),
    displayName: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number || 'none',
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }
  return establishment;
}

const main = async () => {
  let nycEst = await fetchEstablishmentsForCity('new york city');
  let establishments = nycEst.map(e => createEstablishmentObj(e));
  console.log(establishments);
};

main();