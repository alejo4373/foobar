export default 
  `query GetAllEstablishments {
    allEstablishments(count: 10){
      establishments{
        id
        managerUsername
        address
      }
    }
  }
`;