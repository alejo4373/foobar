require('dotenv').config();
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const { networkRequest } = require('./utils');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});
const ddb = new AWS.DynamoDB();
const awsResourcesCreated = JSON.parse(
  fs.readFileSync(
    './awsResourcesCreated.json',
    'utf8'
  )
)
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
    googlePlaceId: place.place_id,
    name: place.name.toLowerCase(),
    displayName: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number || '(123) 456-7890',
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
  }
  return establishment;
}

const toDynamoDBJson = (obj) => {
  let output = {}
  let keys = Object.keys(obj);
  keys.forEach(k => output[k] = { 'S': obj[k].toString() })
  return output;
}

const insertItemToTable = (item, table) => {
  const params = {
    TableName: table,
    Item: item,
    ReturnConsumedCapacity: 'TOTAL'
  }
  return new Promise((resolve, reject) => {
    ddb.putItem(params, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    })
  })
}

const generateRandomDate = () => {
  let start = new Date();
  let aMonthInMilliseconds = 1000 * 60 * 60 * 24 * 30;
  let end = new Date(start.getTime() + aMonthInMilliseconds);
  return new Date(start.getTime() + (Math.random() * (end.getTime() - start.getTime())));
}

const pickRandomTeams = (teams) => {
  let i = Math.floor(Math.random() * teams.length);
  let j = Math.floor(Math.random() * teams.length);
  if (i != j) {
    return {
      homeTeam: teams[i].strTeam,
      awayTeam: teams[j].strTeam
    }
  }
  pickRandomTeams(teams);
}

const generateRandomEvent = (atEstablishment, leagueId, teams) => {
  let { homeTeam, awayTeam } = pickRandomTeams(teams);
  let event = {
    atEstablishment,
    leagueId,
    homeTeam,
    awayTeam,
    startTime: generateRandomDate().toISOString(),
    coverCharge: false,
    description: 'Some description of the event/show or additional notes.'
  }
  return event;
}

const seedEstablishmentsForCity = async (city) => {
  let nycEst = await fetchEstablishmentsForCity(city);
  let estTable = awsResourcesCreated.dynamoDBTables[0];
  let establishments = nycEst.map(e => toDynamoDBJson(createEstablishmentObj(e)));
  console.log('establishments length:', establishments.length);
  for (let i = 0; i < establishments.length; i++) {
    await insertItemToTable(establishments[i], estTable);
  }
}

const main = async () => {
  // await seedEstablishmentsForCity('new york city');
  let leaguesAndTeams = await mapLeaguesToTeams()
  let event = generateRandomEvent('1234', 4380, leaguesAndTeams['4380'])
  console.log(event);
};

main();