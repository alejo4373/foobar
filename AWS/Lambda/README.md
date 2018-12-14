The .zip file in which this file and accompanying `foobar_establishments_DDB_ES_indexer.js` is in, is used to upload the Lambda function through the Node.js `aws-sdk`.

This .zip file was created manually with a tool such as the `zip` command in a Unix-like OS, executing: `zip ./<function_name>.zip <function_name>.js README.md`. 

If `<function_name>.js` is modified in any way this .zip file must be regenerated before attempting to execute `npm run setup` again, so that the changes take effect in AWS Lambda. 
