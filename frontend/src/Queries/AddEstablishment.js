import gql from 'graphql-tag';

export default gql`
  mutation PutEstablishment {
    putEstablishment(
      #id: ID => is being handled in the request mapping template so no need to include it here
      managerUsername: "alejooooooo"
      googlePlaceId: "EisxMyBNYXJrZXQgU3RyZWV0LCBXaWxtaW5ndG9uLCBOQyAyODQwMSwgVVNB"
      name: "Kabu"
      address: "3140 87th street, east elmhurst"
      phone: "917-573-6025"
    ){
      id
      managerUsername
      googlePlaceId
      name
      address
      phone
    }
  }
`;