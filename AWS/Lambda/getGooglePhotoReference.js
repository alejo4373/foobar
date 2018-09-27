const https = require('https');
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const sendHttpRequest = async(url) => {
  let response = [];
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => { response.push(chunk); });
      res.on('end', () => {
        let formatedRes = response.join('');
        let parsedRes = JSON.parse(formatedRes);
        resolve(parsedRes);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

// Get the reference to retrieve first google photo
const getGooglePhotoReference = async(placeId) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&fields=photo&key=${API_KEY}`
  let res = await sendHttpRequest(url)
  let photoReference = res.result.photos[0].photo_reference;
  console.log(photoReference)
  return photoReference;
};

exports.handler = getGooglePhotoReference; 