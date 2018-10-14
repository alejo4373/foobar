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

const main = async (tables) => {
  let deletePromises = tables.map(t => deleteTable(t))
  try {
    await Promise.all(deletePromises);
  } catch (err) {
    console.log('[Error] => Deleting tables', err)
  }
}

module.exports = main;