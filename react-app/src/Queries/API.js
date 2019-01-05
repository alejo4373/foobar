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
            googlePhotoReference
            managerUsername
            name
            displayName
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
        $atEstablishmentId: String!
        $awayTeam: String!,
        $awayTeamBadge: String,
        $homeTeam: String!,
        $homeTeamBadge: String,
        $leagueId: String!,
        $sportsDbId: String,
        $startTime: String!,
        $coverCharge: Boolean!,
        $description: String
      ){
        putEvent(
          atEstablishmentId: $atEstablishmentId
          awayTeam: $awayTeam,
          awayTeamBadge: $awayTeamBadge,
          homeTeam: $homeTeam,
          homeTeamBadge: $homeTeamBadge,
          leagueId: $leagueId,
          sportsDbId: $sportsDbId,
          startTime: $startTime,
          coverCharge: $coverCharge,
          description: $description,
        ){
          id
          atEstablishmentId
          awayTeam
          awayTeamBadge
          homeTeam
          homeTeamBadge
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
 * @param {Number} limit  - number of records to retrieve from database
 * @param {Function} callback  - Handles the response 
 */
export async function getEstablishmentsUserManages(limit, callback) {
  try {
    const res = await API.graphql(graphqlOperation(
      `query GetEstablishmentsUserManages($limit: Int!){
        getEstablishmentsUserManages(limit: $limit){
          establishments{
            id
            managerUsername
            googlePlaceId
            googlePhotoReference
            name
            displayName
            address
            phone
            lat
            lng
          }
        }
      }`, {limit: limit}))
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
          $name: String!,
          $displayName: String!,
          $address: String!,
          $phone: String,
          $lat: String!,
          $lng: String!,
        ){
            putEstablishment(
              googlePlaceId: $googlePlaceId,
              name: $name,
              displayName: $displayName,
              address: $address,
              phone: $phone,
              lat: $lat,
              lng: $lng,
            ){
              id
              managerUsername
              googlePlaceId
              googlePhotoReference
              name
              displayName
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
 * @param {String} atEstablishmentId - A string identifying the establishment to get events from
 * @param {Function} callback  - Handles response and error
 */
export async function getEvents(atEstablishmentId, callback) {
  try {
    const res = await API.graphql(graphqlOperation(`
      query GetEventsFromEstablishment($atEstablishmentId: String!) {
        getEvents(atEstablishmentId: $atEstablishmentId){
          events {
            id
            sportsDbId
            leagueId
            homeTeam
            homeTeamBadge
            awayTeam
            awayTeamBadge
            startTime
            coverCharge
            description
          }
        }
      }`, { atEstablishmentId: atEstablishmentId })
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
          googlePhotoReference
          name
          displayName
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

/**
 * Gets establishment suggestions when user is searching for one
 * @param {String} pattern - A string pattern to search for in establishments name
 * @param {Function} callback  - Handles response and error
 */
export async function getEstablishmentSuggestions(pattern, callback) {
  try {
    const res = await API.graphql(graphqlOperation(
      `query GetEstablishmentSuggestions($pattern: String!){
        getEstablishmentSuggestions(pattern: $pattern){
          establishments{
            id
            name
            displayName
          }
        }
      }`, { pattern: pattern })
    )
    const matches = res.data.getEstablishmentSuggestions.establishments
    callback(null, matches)

  } catch (err) {
    callback(err, null)
  }
}


//Basically the same as above but asking for slightly different attributes 
/**
 * Gets establishment that match query string 
 * @param {String} pattern - A string pattern to search for in establishments name
 * @param {Function} callback  - Handles response and error
 */
export async function searchEstablishments(pattern, callback) {
  try {
    const res = await API.graphql(graphqlOperation(
      `query GetEstablishmentSuggestions($pattern: String!){
        getEstablishmentSuggestions(pattern: $pattern){
          establishments{
            id
            displayName
            phone
            googlePhotoReference
          }
        }
      }`, { pattern: pattern })
    )
    const matches = res.data.getEstablishmentSuggestions.establishments
    callback(null, matches)

  } catch (err) {
    callback(err, null)
  }
}