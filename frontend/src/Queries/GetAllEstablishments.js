import gql from 'graphql-tag';

export default gql`
  query GetAllEstablishments {
    allEstablishments(count: 10){
      establishments{
        id
        managerUsername
        address
      }
    }
  }
`;