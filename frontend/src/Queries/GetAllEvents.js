import gql from 'graphql-tag';

export default gql`
  query GetAllEvents {
    allEvents(count: 10){
      events {
        id
      }
    }
  }
`;