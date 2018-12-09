const AWS = require('aws-sdk');
const region = AWS.config.region;
let domain = 'search-es-testdomain-gucqhfplkzl4ny5yhbbxwdg24q.us-east-2.es.amazonaws.com'; 
let index = 'movies';
let type = '_doc';

function indexDocument(document) {
  let endpoint = new AWS.Endpoint(domain);
  let request = new AWS.HttpRequest(endpoint, region);

  request.method = 'PUT';
  request.path += index + '/' + type + '/' + id;
  request.body = JSON.stringify(document);
  request.headers['host'] = domain;
  request.headers['Content-Type'] = 'application/json';
  request.headers["Content-Length"] = request.body.length;

  let credentials = AWS.config.credentials;
  let signer = new AWS.Signers.V4(request, 'es');
  signer.addAuthorization(credentials, new Date());
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
      console.log('error =>', error)
      reject(error);
    });
  })
}

exports.handler = async (event) => {
  let records = event.Records;
  let promises = [];
  records.forEach(r => {
    promises.push(indexDocument(r))
  });
  // TODO implement
  let res = await Promise.all(promises);
  const response = {
    statusCode: 200,
    body: JSON.stringify(res),
  };
  console.log('res ===>', res);
  return response;
};