let db = new AWS.DynamoDB()

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

const main = async () => {
  let estTableResponse;
  let evenTableResponse;
  try {
    estTableResponse = await createTableWithPromise(establishmentsTableParams)
    console.log('Creating table', estTableResponse.TableDescription.TableName)
    global.aws_vars = {
      establishmentsTableArn: estTableResponse.TableDescription.TableArn,
      ...global.aws_vars
    }
  } catch (err) {
    console.log('[Error]', err.message)
  };

  try {
    evenTableResponse = await createTableWithPromise(eventsTableParams);
    console.log('Creating table', evenTableResponse.TableDescription.TableName)
    global.aws_vars = {
      eventsTableArn: evenTableResponse.TableDescription.TableArn,
      ...global.aws_vars
    }
  } catch (err) {
    console.log('[Error]', err.message)
  };

}

module.exports = main;