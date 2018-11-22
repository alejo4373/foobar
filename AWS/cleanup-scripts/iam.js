/*
 * This script first detaches all policies from all the roles created,
 * then it deletes the said policies and lastly it deletes all the roles
 * 
*/

const iam = new AWS.IAM();

const detachRolePolicy = (params) => {
  return new Promise((resolve, reject) => {
    iam.detachRolePolicy(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    })
  })
}

const deletePolicy = (params) => {
  return new Promise((resolve, reject) => {
    iam.deletePolicy(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    })
  })
}

const deleteRole = (params) => {
  return new Promise((resolve, reject) => {
    iam.deleteRole(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    })
  })
}

const detachPoliciesFromRoles = async (IAMRolesAndPolicies) => {
  let detachPromises = IAMRolesAndPolicies.map(elem => detachRolePolicy(elem));
  try {
    await Promise.all(detachPromises);
    console.log('Detached all policies from all roles.');
  } catch (err) {
    throw err;
  }
}

const deletePolicies = async (policies) => {
  let deletePolicesPromises = policies.map(elem => deletePolicy(elem));
  try {
    await Promise.all(deletePolicesPromises);
    console.log('Deleted all policies.');
  } catch (err) {
    throw err;
  }
}

const deleteRoles = async (roles) => {
  let deleteRolesPromises = roles.map(elem => deleteRole(elem));
  try {
    await Promise.all(deleteRolesPromises);
    console.log('Deleted all roles.');
  } catch (err) {
    throw err;
  }
}

const main = async ({ IAMRolesAndPolicies }) => {
  if (IAMRolesAndPolicies !== undefined && IAMRolesAndPolicies.length) {
    let policies = IAMRolesAndPolicies.map(elem => ({ PolicyArn: elem.PolicyArn }));
    let roles = IAMRolesAndPolicies.map(elem => ({ RoleName: elem.RoleName }));
    try {
      await detachPoliciesFromRoles(IAMRolesAndPolicies);
      await deletePolicies(policies);
      await deleteRoles(roles);
    } catch (err) {
      if (err.code === 'NoSuchEntity') {
        console.log('[Error] => Cleaning up IAM roles and policies.', err.message);
      } else {
        console.log('[Error] => Cleaning up IAM roles and policies.', err);
      }
    }
  } else {
    console.log('[Warning] => Nothing to clean-up. Is awsResourcesCreated.json empty or with no IAM roles and policies?.');
  }
}
module.exports = main;