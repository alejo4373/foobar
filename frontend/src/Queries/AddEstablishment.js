export default `
  mutation PutEstablishment(
    $googlePlaceId: String!
    $name: String!
    $address: String!
    $phone: String!
    $lat: String!
    $lng: String!
   ){
    putEstablishment(
      googlePlaceId: $googlePlaceId
      name: $name
      address: $address
      phone: $phone
      lat: $lat
      lng: $lng
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
  }
`;