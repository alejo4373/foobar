const fs = require('fs');
const https = require('https');

class DataSourceManager {
  constructor() {
    // dataSources represent an indexed by type collection of data-sources
    this.dataSources = {
      'AMAZON_DYNAMODB': [],
      'AWS_LAMBDA': [],
      'AMAZON_ELASTICSEARCH': []
    };
  }

  /**
   * Add data-source to the collection of its type
   * @param {string} type Data-source type "AMAZON_DYNAMODB" || "AMAZON_ELASTICSEARCH" || "AWS_LAMBDA"
   * @param {object} dataSource Name and ARN of data-source
   * @param {object} dataSource.name Name of the data-source/resource
   * @param {object} dataSource.arn ARN of the resource
   */
  add(type, dataSource) {
    this.dataSources[type].push(dataSource)
  }

  /**
   * Retrieve runtime saved data-source of specified type if pattern 
   * found in its name 
   * @param {string} type Data-source type "AMAZON_DYNAMODB" || "AMAZON_ELASTICSEARCH" || "AWS_LAMBDA"
   * @param {string} namePattern Data-source name patter or substring to find it
   * @returns Data-source information object
   */
  get(type, namePattern) {
    return this.dataSources[type].find(r => {
      return r.name.includes(namePattern);
    });
  }
}


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

const addFunctionToCreated = (name) => {
  let lambdaFunctions = aws_vars.created.lambdaFunctions || [];
  lambdaFunctions.push(name);
  aws_vars.created.lambdaFunctions = lambdaFunctions;
}

/**
 * Adds newIAMRoleAndPolicy object to array kept in aws_vars global var
 * if role with same name hasn't been previously added
 * @param {object} newIAMRoleAndPolicy 
 */
const addIAMRoleAndPolicyToCreated = (newIAMRoleAndPolicy) => {
  let IAMRolesAndPolicies = global.aws_vars.created.IAMRolesAndPolicies || [];
  let prevAws_vars = global.aws_vars;
  let prevCreated = prevAws_vars.created;
  //If role not already in IAMRolesAndPolicies added it 
  if (!IAMRolesAndPolicies.some(elem => newIAMRoleAndPolicy.RoleName === elem.RoleName)) {
    global.aws_vars = {
      ...prevAws_vars,
      created: {
        ...prevCreated,
        IAMRolesAndPolicies: [...IAMRolesAndPolicies, newIAMRoleAndPolicy]
      }
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
  fs.writeFileSync('./.env-react-app', fileContent, 'utf8')
}

const exportCreatedResourcesAsJson = () => {
  let fileContent = JSON.stringify(global.aws_vars.created);
  fs.writeFileSync('./awsResourcesCreated.json', fileContent, 'utf8')
}

const networkRequest = (url) => {
  let buffer = [];
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {

      res.on('data', (chunk) => buffer.push(chunk))
      res.on('end', () => resolve(JSON.parse(buffer.join(''))))
    })
    req.on('error', (err) => reject(err))
    req.end();
  })
};

module.exports = {
  dataSourceManager: new DataSourceManager(),
  setGlobalVar,
  exportEnvVarsFile,
  addToCreatedInGlobalVar,
  addIAMRoleAndPolicyToCreated,
  addFunctionToCreated,
  exportCreatedResourcesAsJson,
  networkRequest
}
