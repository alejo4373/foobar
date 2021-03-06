const { dataSourceManager, addToCreatedInGlobalVar } = require('../../utils');
const db = new AWS.DynamoDB()
const { envPrefix } = global

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
  TableName: `${envPrefix}foobar_establishments_table`,
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
  GlobalSecondaryIndexes: [
    { 
      IndexName: 'managerUsername-index',
      KeySchema: [
        {
          AttributeName: 'managerUsername',
          KeyType: 'HASH'
        }
      ],
      Projection: {
        NonKeyAttributes: [
          'address',
          'googlePlaceId',
          'displayName'
        ],
        ProjectionType: "INCLUDE"
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_IMAGE'
  }
}

let eventsTableParams = {
  TableName: `${envPrefix}foobar_events_table`,
  AttributeDefinitions: [
    {
      AttributeName: 'atEstablishmentId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'startTime',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'atEstablishmentId',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'startTime',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_IMAGE'
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
        resolve(table);
      })
      .catch(err => {
        awsCreateTable(tableParams)
          .then(table => {
            console.log('Creating table', table.TableName)
            resolve(table);
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
    let [
      establishmentsTable,
      eventsTable
    ] = await Promise.all([establishmentsTablePromise, eventsTablePromise])

    //Add to data source manager because they will be used by AppSync
    dataSourceManager.add('AMAZON_DYNAMODB', { name: establishmentsTable.TableName, arn: establishmentsTable.TableArn })
    dataSourceManager.add('AMAZON_DYNAMODB', { name: eventsTable.TableName, arn: eventsTable.TableArn })
    //Add to aws_vars.created to export as json and delete when cleaning up
    addToCreatedInGlobalVar('dynamoDBTables',
      [establishmentsTable.TableName, eventsTable.TableName]
    )
  } catch (err) {
    console.log('Promise.all err:', err);
  }
}

module.exports = main;
