let { setGlobalVar } = require('./utils');

let db = new AWS.DynamoDB()

// Just so that we can use await instead of nesting callbacks
const awsCreateTable = (tableParams) => {
  return new Promise((resolve, reject) => {
    db.createTable(tableParams, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.TableDescription)
      }
    })
  })
}

const awsDescribeTable = (params) => {
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
    table = await awsDescribeTable({ TableName: tableName });
  } catch (err) {
    return null
  }
  return table;
}

const createTable = (tableParams) => {
  return new Promise((resolve, reject) => {
    tableAlreadyExists(tableParams.TableName)
      .then(table => {
        console.log(`Table with name ${table.TableName} already exists. Skipping...`)
        setGlobalVar([`${table.TableName}Arn`], table.TableArn)
        resolve(true);
      })
      .catch(err => {
        awsCreateTable(tableParams)
          .then(table => {
            console.log('Creating table', table.TableName)
            setGlobalVar([`${table.TableName}Arn`], table.TableArn)
            resolve(true);
          })
          .catch(err => {
            console.log('[Error]', err)
            reject(err)
          });
      })
  })
}

const main = async () => {
  let establishmentsTablePromise = createTable(establishmentsTableParams)
  let eventsTablePromise = createTable(eventsTableParams)

  try {
    // Concurrently create tables
    await Promise.all([establishmentsTablePromise, eventsTablePromise])
  } catch (err) {
    console.log('Promise.all err:', err);
  }
}

module.exports = main;