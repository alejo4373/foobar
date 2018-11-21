const db = new AWS.DynamoDB()

const deleteTable = (tableName) => {
  return new Promise((resolve, reject) => {
    let params = { TableName: tableName };
    db.deleteTable(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const main = async ({ dynamoDBTables }) => {
  let tables = dynamoDBTables;
  if (tables !== undefined && tables.length) {
    let deletePromises = tables.map(t => deleteTable(t))
    try {
      await Promise.all(deletePromises);
      tables.forEach(table => {
        console.log('Removing table:', table);
      });
    } catch (err) {
      console.log('[Error] => Deleting tables', err)
    }
  } else {
    console.log('No tables to delete')
  }
}

module.exports = main;