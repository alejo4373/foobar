const EventList = ( eventList ) => {
  return(
    <div>
      <h3>This is event list </h3>
    {
      eventList.map(event => (
        <div>
          <div>{event.homeTeam}</div>
          VS
          <div>{event.awayTeam}</div>
        </div>
      ))
   }</div>
  )
}