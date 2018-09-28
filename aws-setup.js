const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-config.json');

let db = new AWS.DynamoDB({ apiVersion: '2012-08-10' })

// Just so that we can use await instead of nesting callbacks
const createTableWithPromise = (tableParams) => {
  return new Promise((resolve, reject) => {
    db.createTable(tableParams, (err, data) => {
      if (err) { reject(err) }
      resolve(data)
    })
  })
}

let establishmentsTableParams = {
  TableName: 'foobar_establishments_table',
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'managerUsername',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'managerUsername',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
}

let eventsTableParams = {
  TableName: 'foobar_events_table',
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'leagueId',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'leagueId',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
}

const main = () => {
  // let estTableCheck = await checkTable('foobar_establishments_table')
  createTableWithPromise(establishmentsTableParams)
    .then(data => {
      console.log('Creating table', data.TableDescription.TableName)
    })
    .catch(err => {
      console.log('[Error]', err.message)
    });

  createTableWithPromise(eventsTableParams)
    .then(data => {
      console.log('Creating table', data.TableDescription.TableName)
    })
    .catch(err => {
      console.log('[Error]', err.message)
    });

  // if(estTableCheck
  // let eventsTable = createTableWithPromises(eventsTableParams);
}

main();