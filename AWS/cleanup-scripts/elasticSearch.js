// AWS must be in the global scope
const ES = new AWS.ES({ apiVersion: '2015-01-01' })

const isDomainFullyDeleted = (domainName) => {
  console.log('Fully deleting ES domain. Please wait.');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      ES.describeElasticsearchDomain({ DomainName: domainName }, (err, data) => {
        if (err) {
          // if error saying resource was not found we know that the domain has been
          // fully deleted
          if (err.code === 'ResourceNotFoundException') {
            resolve(true);
          } else {
            reject(err)
          }
        } else {
          resolve(false);
        }
      });
    }, 1000 * 60);
  });
}

// Ask if domain is being deleted every 2 minutes
const waitUntilDomainFullyDeleted = async (domainName) => {
  console.log(`Waiting for domain '${domainName}' to be fully deleted...`);
  console.log('[Note] Deleting a domain can take a up to 10 minutes.');
  let domainFullyDeleted = false;
  while (!domainFullyDeleted) {
    try {
      domainFullyDeleted = await isDomainFullyDeleted(domainName);
    } catch (err) {
      throw err;
    }
  }
  console.log('Domain has been deleted completely.');
}

/**
 * Deletes an Elasticsearch domain
 * @param {string} domainName The domain name to be deleted
 **/
const deleteESDomain = async (domainName) => {
  const params = {
    DomainName: domainName,
  };
  try {
    console.log('=== Starting ES domain deletion ====');
    await ES.deleteElasticsearchDomain(params).promise();
    await waitUntilDomainFullyDeleted(domainName);
    console.log('==== ES domain fully deleted =====');
  } catch (err) {
    if (err.code === 'ResourceNotFoundException') {
      console.log('=== ES domain does not exist ====');
    } else {
      throw err;
    }
  }
}

const main = async ({ esDomain }) => {
  try {
    await deleteESDomain(esDomain);
  } catch (err) {
    console.log('[Error] ==>', err);
  }
}

module.exports = main;
