const AWS = require('aws-sdk');
const region = AWS.config.region;
const domain = process.env.ES_DOMAIN_ENDPOINT
const type = '_doc';
const index = 'foobar-est-index'

const manageIndex = (record, eventName) => {
  let endpoint = new AWS.Endpoint(domain);
  let request = new AWS.HttpRequest(endpoint, region);
  let document = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
  let id = record.dynamodb.Keys.id.S;
  if (eventName == 'REMOVE') {
    request.method = 'DELETE';
  } else {
    request.method = 'PUT';
  }
  request.path += index + '/' + type + '/' + id;
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
    return response;
  } catch (err) {
    console.log('Error ===>', res);
    return null;
  }
};
