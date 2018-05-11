import gql from 'graphql-tag';

export default gql`
 	mutation PutEvent {
    putEvent(
      #id: ID => is being handled in the request mapping template so no need to include it here
      sportsDbId: "sports-db-id"
      leagueId: "alejoLeague",
      homeTeam: "teamA",
      awayTeam: "teamB",
      startTime: "09:pm"){
      id
      sportsDbId
      leagueId
      homeTeam
      awayTeam
      startTime
    }
  }
`; 
