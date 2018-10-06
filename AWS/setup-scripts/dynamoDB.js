let { setGlobalVar } = require('./utils');

let db = new AWS.DynamoDB()

// Just so that we can use await instead of nesting callbacks
const createTableWithPromise = (tableParams) => {
  return new Promise((resolve, reject) => {
    db.createTable(tableParams, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.TableDescription)
      }
    })
  })
}

const describeTable = (params) => {
  return new Promise((resolve, reject) => {
    db.describeTable(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.Table)
      }
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

// Find if a table with same name already exists
const tableAlreadyExists = async (tableName) => {
  let table;
  try {
    table = await describeTable({ TableName: tableName });
  } catch (err) {
    return null
  }
  return table;
}

const main = async () => {
  let establishmentsTable = await tableAlreadyExists(establishmentsTableParams.TableName);
  let eventsTable = await tableAlreadyExists(eventsTableParams.TableName);

  if (!establishmentsTable) {
    try {
      establishmentsTable = await createTableWithPromise(establishmentsTableParams)
      console.log('Creating table', establishmentsTable.TableName)
      setGlobalVar('establishmentsTableArn', establishmentsTable.TableArn)
    } catch (err) {
      console.log('[Error]', err)
    };
  } else {
    console.log(`Table with name ${establishmentsTable.TableName} already exists. Skipping...`)
    setGlobalVar('establishmentsTableArn', establishmentsTable.TableArn)
  }

  if (!eventsTable) {
    try {
      eventsTable = await createTableWithPromise(eventsTableParams);
      console.log('Creating table', eventsTable.TableName)
      setGlobalVar('eventsTableArn', eventsTable.TableArn)
    } catch (err) {
      console.log('[Error]', err)
    };
  } else {
    console.log(`Table with name ${eventsTable.TableName} already exists. Skipping...`)
    setGlobalVar('eventsTableArn', eventsTable.TableArn)
  }
}

module.exports = main;