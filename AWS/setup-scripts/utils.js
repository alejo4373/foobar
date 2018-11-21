const fs = require('fs');

const setGlobalVar = (name, value) => {
  global.aws_vars = {
    [name]: value,
    ...global.aws_vars
  }
}

const addToCreatedInGlobalVar = (name, value) => {
  let prevAws_vars = global.aws_vars
  let prevCreated = prevAws_vars.created
  global.aws_vars = {
    ...prevAws_vars,
    created: {
      ...prevCreated,
      [name]: value
    }
  }
}

const exportEnvVarsFile = () => {
  let prefix = 'REACT_APP_' // Since the .env file will be used by a React App bootstrapped with create-react-app
  let cognito = global.aws_vars.cognito;
  let apiEndpoint = '';
  if (aws_vars.api) {
    apiEndpoint = global.aws_vars.api.GRAPHQL_ENDPOINT;
  }

  let fileLines = [
    `${prefix}GRAPHQL_ENDPOINT=${apiEndpoint}`,
    `${prefix}GOOGLE_MAPS_API_KEY=${process.env.GOOGLE_MAPS_API_KEY}`, //Bring google maps api key to this other .env file as well
    `${prefix}AWS_REGION=${global.AWS.config.region}`
  ]

  for (key in cognito) {
    fileLines.push(`${prefix + key}=${cognito[key]}`)
  }

  // Format and write to file
  let fileContent = fileLines.join('\n');
  fs.writeFileSync('./react-app/.env.new', fileContent, 'utf8')
}

const exportCreatedResourcesAsJson = () => {
  let fileContent = JSON.stringify(global.aws_vars.created);
  fs.writeFileSync('./awsResourcesCreated.json', fileContent, 'utf8')
}

module.exports = {
  setGlobalVar,
  exportEnvVarsFile,
  addToCreatedInGlobalVar,
  exportCreatedResourcesAsJson
}