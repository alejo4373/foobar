var AWS = require('aws-sdk');
var region = 'us-east-2'; // e.g. us-west-1
var domain = 'search-es-testdomain-gucqhfplkzl4ny5yhbbxwdg24q.us-east-2.es.amazonaws.com'; // e.g. search-domain.region.es.amazonaws.com
var index = 'movies';
var type = '_doc';
var id = '123';
var json = {
  "director": "Alejandro", "genre": ["Drama", "Romance"], "year": 1955, "actor": ["Hopper, Dennis", "Wood, Natalie", "Dean, James", "Mineo, Sal", "Backus, Jim", "Platt, Edward", "Ray, Nicholas", "Hopper, William", "Allen, Corey", "Birch, Paul", "Hudson, Rochelle", "Doran, Ann", "Hicks, Chuck", "Leigh, Nelson", "Williams, Robert", "Wessel, Dick", "Bryar, Paul", "Sessions, Almira", "McMahon, David", "Peters Jr., House"], "title": "Rebel Without a Cause"
}

function indexDocument(document) {
  var endpoint = new AWS.Endpoint(domain);
  var request = new AWS.HttpRequest(endpoint, region);

  request.method = 'PUT';
  request.path += index + '/' + type + '/' + id;
  request.body = JSON.stringify(document);
  request.headers['host'] = domain;
  request.headers['Content-Type'] = 'application/json';
  // Content-Length is only needed for DELETE requests that include a request
  // body, but including it for all requests doesn't seem to hurt anything.
  request.headers["Content-Length"] = request.body.length;
  console.log('http req ==>', request)

  var credentials = AWS.config.credentials;
  console.log('credentials ==>', credentials);
  var signer = new AWS.Signers.V4(request, 'es');
  signer.addAuthorization(credentials, new Date());
  var client = new AWS.HttpClient();

  return new Promise((resolve, reject) => {
    client.handleRequest(request, null, function (response) {
      console.log('http response ===>', response);
      var responseBody = '';
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
  // TODO implement
  let res = await indexDocument(json);
  const response = {
    statusCode: 200,
    body: JSON.stringify(res),
  };
  console.log('res ===>', res);
  return response;
};

