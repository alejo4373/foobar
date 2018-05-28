import { API, graphqlOperation } from 'aws-amplify';

//Graphql Operations
export async function fetchEstablishmentsInBounds(bounds, callback){
  try {
    const res = await API.graphql(graphqlOperation(
      `query GetAllEstablishmentsInBounds(
        $latMin: String!,
        $latMax: String!,
        $lngMin: String!,
        $lngMax: String!
        ){
        getEstablishmentsInBounds(
          latMin: $latMin
          latMax: $latMax
          lngMin: $lngMin 
          lngMax: $lngMax
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
