const AWS = require('aws-sdk');
const region = AWS.config.region;
const domain = process.env.ES_DOMAIN_ENDPOINT
const mapType = process.env.ES_MAP_TYPE
const index = process.env.ES_INDEX

const manageIndex = (record, eventName) => {
  let endpoint = new AWS.Endpoint(domain);
  let request = new AWS.HttpRequest(endpoint, region);
  let document = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
  let keys = record.dynamodb.Keys;
  let id;
  // If the item/record coming in is an Establishment it will have an id on its keys,
  // otherwise (i.e it's an event) combine its atEstablishmentId with a hex representation
  // of the startTime, joined by '_' (underscore) to create a unique id 
  if (keys.id) {
    id = keys.id.S;
  } else {
    id = keys.atEstablishmentId.S + '_' + Buffer.from(keys.startTime.S).toString('hex');
  }
  if (eventName == 'REMOVE') {
    request.method = 'DELETE';
  } else {
    request.method = 'PUT';
  }
  request.path += index + '/' + mapType + '/' + id;
  request.body = JSON.stringify(document);
  request.headers['host'] = domain;
  request.headers['Content-Type'] = 'application/json';
  request.headers["Content-Length"] = request.body.length;

  //Get and credentials and sign request
  let credentials = AWS.config.credentials;
  let signer = new AWS.Signers.V4(request, 'es');
  signer.addAuthorization(credentials, new Date());

  // Send the request
  let client = new AWS.HttpClient();
  return new Promise((resolve, reject) => {
    client.handleRequest(request, null, function (response) {
      let responseBody = '';
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', (chunk) => {
        resolve(responseBody);
      });
    }, (error) => {
      reject(error);
    });
  })
}

exports.handler = async (event) => {
  const { Records } = event;
  let res;
  let promises = [];
  Records.forEach(record => {
    const { eventName } = record;
    promises.push(manageIndex(record, eventName))
  });
  try {
    res = await Promise.all(promises);
    const response = {
      statusCode: 200,
      body: JSON.stringify(res),
    };
    console.log('response ===>', res);
    return response;
  } catch (err) {
    console.log('Error ===>', err);
    return null;
  }
};
