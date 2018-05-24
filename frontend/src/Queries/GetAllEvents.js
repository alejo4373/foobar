export default `query GetAllEvents {
    allEvents(count: 10){
      events {
        id
        awayTeam
        homeTeam
        leagueId
        sportsDbId
        startTime
      }
    }
  }
`;