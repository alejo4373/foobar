The .zip file in which this file and accompanying `<lambda_function_name>.js` is in is known as a [Lambda Deployment Package](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html). It is used to upload the Lambda function through the Node.js `aws-sdk`.

This .zip file was created manually with a tool such as the `zip` command in a Unix-like OS, executing: `zip ./<lambda_function_name>.zip <lambda_function_name>.js README.md`. 

If `<lambda_function_name>.js` is modified in any way this .zip file must be regenerated before attempting to execute `npm run setup` again, so that the changes take effect in AWS Lambda. 
