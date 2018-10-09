// This file contains a JavaScript object that maps data sources to types to fields.
// Where the fields are also the prefix of the request and response resolvers file

// The names here must match the name of the data sources, types and fields in the 
// GraphQL schema as well as the names of the request and response mapping files
// in this directory. If the names don't match the appSync.js script will fail
// to attach the resolver.

module.exports = {
  foobar_establishments_table: {
    Query: [
      "getEstablishmentById",
      "getEstablishmentsInBounds",
      "getEstablishmentSuggestions",
      "getEstablishmentsUserManages",
    ],
    Mutation: [
      "putEstablishment",
    ],

  },

  foobar_events_table: {
    Query: [
      "getEvents",
    ],
    Mutation: [
      "putEvent"
    ],
  },

  getGooglePhotoReference_function: {
    Establishment: [
      'googlePhotoReference'
    ]
  }
}
