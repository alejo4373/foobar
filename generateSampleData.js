require('dotenv').config();
const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const { networkRequest } = require('./utils');
const awsResourcesCreated = require('./awsResourcesCreated.json');
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

const DDB = new AWS.DynamoDB();
const { marshall } = AWS.DynamoDB.Converter; // To Convert a JavaScript object into a DynamoDB record

const usMajorCities = [
  "new york city",
  "miami",
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
  "baltimore",
  "washington dc",
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
    } catch (err) {
      console.log('[Error] => ', err)
    }
  }
  return map;
}

const createEstablishmentObj = (place) => {
  const establishment = {
    id: uuidv1(),
    managerUsername: Math.floor(Math.random() * 6) === 3 ? 'AnEstablishmentManagerUser' : 'SampleManager' ,
    googlePlaceId: place.place_id,
    name: place.name.toLowerCase(),
    displayName: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number || '(123) 456-7890',
    location: {
      lat: place.geometry.location.lat.toString(),
      lon: place.geometry.location.lng.toString(),
    }
  }
  return establishment;
}

const fetchEstablishmentsForCity = async (city) => {
  let establishments = [];
  try {
    let { json } = await googleMapsClient.places({ query: `sports bars in ${city}` }).asPromise()
    establishments = json.results.map(place => createEstablishmentObj(place))
    return (establishments);
  } catch (err) {
    throw err
  }
}

const insertItemToTable = (item, table) => {
  const params = {
    TableName: table,
    Item: marshall(item),
    ReturnConsumedCapacity: 'TOTAL'
  }
  return new Promise((resolve, reject) => {
    DDB.putItem(params, (err, data) => {
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
      homeTeam: teams[i],
      awayTeam: teams[j]
    }
  }
  return pickRandomTeams(teams);
}

const generateRandomEvent = (atEstablishmentId, leagueId, teams) => {
  let { homeTeam, awayTeam } = pickRandomTeams(teams);
  let event = {
    atEstablishmentId,
    leagueId,
    homeTeam: homeTeam.strTeam,
    awayTeam: awayTeam.strTeam,
    homeTeamBadge: homeTeam.strTeamBadge,
    awayTeamBadge: awayTeam.strTeamBadge,
    startTime: generateRandomDate().toISOString(),
    coverCharge: false,
    description: '[Sample event], description of event/show or additional notes.'
  }
  return event;
}

const seedEventsForEstablishments = async (allEstablishments) => {
  try {
    const leaguesAndTeams = await mapLeaguesToTeams();
    const leagues = Object.keys(leaguesAndTeams);
    const eventsTable = awsResourcesCreated.dynamoDBTables[1];
    for (let i = 0; i < allEstablishments.length; i++) {
      const est = allEstablishments[i];
      console.log('=> ', est.displayName);
      // Generate 3 random events per establishment
      for (let i = 0; i < 3; i++) {
        const leagueId = leagues[Math.floor(Math.random() * leagues.length)];
        const teams = leaguesAndTeams[leagueId];
        const event = generateRandomEvent(est.id, leagueId, teams);
        console.log(event.awayTeam, 'vs', event.homeTeam);
        await insertItemToTable(event, eventsTable);
      }
    }
  } catch (err) {
    throw err;
  }
}

const seedEstablishments = async (establishments) => {
  let estTable = awsResourcesCreated.dynamoDBTables[0];
  for (let i = 0; i < establishments.length; i++) {
    try {
      // Inserting items could happen concurrently, but I'm afraid that could 
      // throttle the database and exceed my 5 WCU provisioned on the table
      await insertItemToTable(establishments[i], estTable);
    } catch (err) {
      throw err;
    }
  }
}

const main = async () => {
  try {
    let allEstablishments = [];
    for (let i = 0; i < usMajorCities.length; i++) {
      const city = usMajorCities[i];
      let establishments = await fetchEstablishmentsForCity(city);
      await seedEstablishments(establishments);
      allEstablishments = allEstablishments.concat(establishments);
      console.log(`Generated ${establishments.length} establishments for ${city}.`);
    }
    await seedEventsForEstablishments(allEstablishments);
    console.log('=== Generated sample data. Success... ===');
  } catch (err) {
    console.log('error =>', err);
  }
};

main();
