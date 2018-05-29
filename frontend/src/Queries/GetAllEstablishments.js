export default 
  `query GetAllEstablishments {
    allEstablishments(count: 10){
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
  }
`;