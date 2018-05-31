import { API, graphqlOperation } from 'aws-amplify';

/**
 * Gets establishments that are with in the bounds provided  
 * @param {object} bounds - An object containing latMin, latMax, lngMin, lngMax boundaries of a map instance
 * @param {Function} callback  - Handles the fetch response 
 */
export async function getEstablishmentsInBounds(bounds, callback){
  try {
    const res = await API.graphql(graphqlOperation(
      `query GetAllEstablishmentsInBounds(
        $latMin: String!,
        $latMax: String!,
        $lngMin: String!,
        $lngMax: String!
        ){
        getEstablishmentsInBounds(
          latMin: $latMin,
          latMax: $latMax,
          lngMin: $lngMin, 
          lngMax: $lngMax,
        ){
          establishments{
            id
            googlePlaceId
            managerUsername
            name
            address
            phone
            lat
            lng
          }
        }
      }`, bounds)
    )
    const { establishments } = res.data.getEstablishmentsInBounds
    callback(null, establishments)
  } catch (err) {
    callback(err, null)
  }
}

/**
 * Adds event to events table
 * @param {object} event - An object containing the event to be added
 * @param {Function} callback  - Handles the addEvent response 
 */
export async function addEvent(newEvent, callback){
  try {
    const res = await API.graphql(graphqlOperation(
      `mutation AddEvent(
        $establishmentId: String!
        $awayTeam: String!,
        $homeTeam: String!,
        $leagueId: String!,
        $sportsDbId: String,
        $startTime: String!,
        $coverCharge: Boolean!,
        $description: String!
      ){
        putEvent(
          establishmentId: $establishmentId
          awayTeam: $awayTeam,
          homeTeam: $homeTeam,
          leagueId: $leagueId,
          sportsDbId: $sportsDbId,
          startTime: $startTime,
          coverCharge: $coverCharge,
          description: $description,
        ){
          id
          establishmentId
          awayTeam
          homeTeam
          leagueId
          sportsDbId
          startTime
          coverCharge
          description
        }
      }`, newEvent))
    const event  = res.data.putEvent
    callback(null, event)

  } catch (err) {
    callback(err, null)
  }
}

/**
 * Gets establishments a manager type user manages 
 * @param {Function} callback  - Handles the response 
 */
export async function getManagerEstablishments(callback) {
  console.log('getManagerEstablishments ====>')
  try {
    const { data } = await API.graphql(graphqlOperation(
      `query GetAllEstablishments {
        allEstablishments(limit: 10){
          establishments{
            id
            managerUsername
            googlePlaceId
            name
            address
            phone
            lat
            lng
          }
        }
      }`))
      const { establishments } = data.allEstablishments
      callback(null, establishments)
  } catch (err) {
    callback(err, null)
  }
}

export async function addEstablishment(newEstablishment, callback) {
  try {
    const res = await API.graphql(graphqlOperation(
      `mutation PutEstablishment(
          $googlePlaceId: String!,
          $name: String!,
          $address: String!,
          $phone: String!,
          $lat: String!,
          $lng: String!,
        ){
            putEstablishment(
              googlePlaceId: $googlePlaceId,
              name: $name,
              address: $address,
              phone: $phone,
              lat: $lat,
              lng: $lng,
            ){
              id
              managerUsername
              googlePlaceId
              name
              address
              phone
              lat
              lng
            }
          }`, newEstablishment)
    ) 
    const establishment  = res.data.putEstablishment
    callback(null, establishment)

  } catch (err) {
    callback(err, null)
  }
}