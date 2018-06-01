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
 * Gets 10 (set on resolver) establishments a manager type user manages 
 * @param {Function} callback  - Handles the response 
 */
export async function getEstablishmentsUserManages(callback) {
  try {
    const res = await API.graphql(graphqlOperation(
      `query GetEstablishmentsUserManages{
        getEstablishmentsUserManages{
          establishments{
            id
            managerUsername
            googlePlaceId
            googlePhotoUrl
            name
            address
            phone
            lat
            lng
          }
        }
      }`))
      const { establishments } = res.data.getEstablishmentsUserManages
      callback(null, establishments)
  } catch (err) {
    callback(err, null)
  }
}

/**
 * Adds a new establishment to establishments table
 * @param {object} newEstablishment - An object containing the new establishment to be added
 * @param {Function} callback  - Handles the addEstablishment response 
 */
export async function addEstablishment(newEstablishment, callback) {
  try {
    const res = await API.graphql(graphqlOperation(
      `mutation PutEstablishment(
          $googlePlaceId: String!,
          $googlePhotoUrl: String!,
          $name: String!,
          $address: String!,
          $phone: String!,
          $lat: String!,
          $lng: String!,
        ){
            putEstablishment(
              googlePlaceId: $googlePlaceId,
              googlePhotoUrl: $googlePhotoUrl,
              name: $name,
              address: $address,
              phone: $phone,
              lat: $lat,
              lng: $lng,
            ){
              id
              managerUsername
              googlePlaceId
              googlePhotoUrl
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

/**
 * Gets events by establishment
 * @param {String} establishmentId - A string identifying the establishment to get events from
 * @param {Function} callback  - Handles response and error
 */
export async function getEvents(establishmentId, callback) {
  try {
    const res = await API.graphql(graphqlOperation(`
      query GetEventsFromEstablishment($establishmentId: String!) {
        getEvents(establishmentId: $establishmentId){
          events {
            id
            sportsDbId
            leagueId
            homeTeam
            awayTeam
            startTime
            coverCharge
            description
          }
        }
      }`, { establishmentId: establishmentId })
    )
    const { events } = res.data.getEvents
    callback(null, events)

  } catch (err) {
    callback(err, null)
  }
}

/**
 * Gets establishment complete information by establishmentId
 * @param {String} establishmentId - A string identifying to query the establishments table for
 * @param {Function} callback  - Handles response and error
 */
export async function getEstablishmentById(establishmentId, callback) {
  try {
    const res = await API.graphql(graphqlOperation(`
      query GetEstablishmentById($id: String!) {
        getEstablishmentById(id: $id){
          id
          managerUsername
          googlePlaceId
          googlePhotoUrl
          name
          address
          phone
          lat
          lng
        }
      }`, { id: establishmentId })
    )
    const establishment = res.data.getEstablishmentById
    callback(null, establishment)

  } catch (err) {
    callback(err, null)
  }
}