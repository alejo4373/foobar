# FooBar

## Introduction
Welcome to **FooBar** a Full-Stack Web App that enables sports fanatics to find bars that will be showing the game or fight of their interest, and it does so by encouraging establishments to post the games/fights they will be showing in their profile page on our platform. 

Built with ReactJS in the front-end and an array of Amazon Web Services including AppSync, Lambda, DynamoDB and Cognito as the back-end.

## Features

- [Material Design](https://material.io/) principles.
- Google Maps integration.
- Business names autocompletion.
- Team names autocompletion.
- Sign-up + account confirmation & Log-in.


**Foobar** is intended to be used by two different kinds of users, mainly establishments and sports fanatics. Its graphic interface is visually consistent but on the establishment side it exposes a few more controls to allow the establishment's management of sporting events.

### _From The Establishment perspective_

- Create and manage sporting events that will be shown in your establishments.
  
It is required an establishment be registered by its management onto **Foobar** in order for the establishment to advertise/post sporting events they will be showing at their venue.

Upon registration and login the management of an establishment is welcomed with the landing page shown above, where, integrated in the search bar there are two link icons: Profile and Logout.

Now management can register one or more of their establishments by going to their profile.

![business-perspective](assets/images/business_perspective.gif) 
##### fig 1. Adding a business and an event flow.

### _From The Fan perspective_

- Search by establishment name or by team/fighter involved in the sporting event. (currently partially working)
- Map integration to find establishments near me. 

A regular user doesn't need an account. **Foobar** is a public website where a user can find the bar that will be showing the game of their interest. To accomplish this task the user is offered a search bar where they can search for an establishment, as well as the map view where they can see establishments near them or explore new areas of the map and their offers.

![user-perspective](assets/images/user_perspective.gif) 
##### fig 2. A user looking for the Patriots vs Giants game

## Setup

### TL;DR 

Clone this repo:

`git clone git@github.com:alejo4373/foobar.git`

Deploy AWS back-end services:

`npm install && npm run setup`

Check the terminal logs to see that everything went smoothly.

Launch React App (Front-end)

`cd react-app && npm install && npm start`

### Longer, manual setup of Amazon Web Services (AWS)
**Note**:
The steps outlined here are to be followed using the [AWS web console](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ConsoleDynamoDB.html). However `awscli` can be used to perform the same steps faster. Regardless you will need to have a basic knowledge of how AWS works as the instructions given here are rather high level. If you have any problems setting up please make sure you read and follow the associated links to the AWS documentation.

We need:
* [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html): As a database service
* [AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html): As a GraphQL API
* [Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html): As user management and credentials granting service 
* [Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html): As data-source for AppSync to get 'fresh' google places photos.
* [AWS Amplify](https://aws-amplify.github.io/amplify-js/media/quick_start): To help us manage and integrate our AWS resources in our App

#### DynamoDB 

We will need to create two tables, go to [Dynamo's Dashboard](https://us-east-2.console.aws.amazon.com/dynamodb/home?region=us-east-2) and create: `foobar_establishments_table` and `foobar_events_table`

For `foobar_establishments_table` we will have 
`id`(String) as Primary partition key and `managerUsername`(String) as Primary sort key. Leave the rest as it is by default and hit create.

For `foobar_events_table` we will have 
`id`(String) as Primary partition key and `league_id`(String) as Primary sort key. Leave the rest as it is by default and hit create.

**Note**: The primary key will be used to retrieve the items directly by id, while the sort key will allow us to have those items 'sorted' sort to speak, letting us retrieve all the establishments a user manages more easily and efficiently.

#### Cognito

From Amazon Cognito we will use *User Pools* which will allows to sign-up users* and serve us as a user directory/management system. Besides user pools we will also use *Identity Pools*, which will grant those users who signed-up permissions to access other AWS resources in our case specifically *AppSync API*.

**\*** When I'm talking of users in this context I am refereeing to **Establishment Managers** and  not **Regular Users**. 

![Auth flow with cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/images/scenario-cup-cib2.png)
##### fig 3. Auth Flow representation with AWS Cognito

We want to be careful here as in this set-up relies a big part of the security of our app. We want to make sure we are granting users only the permissions required for them to use our app as we intend them to use it and no more. I will explain in more detail as we walk through.

There is three parts to this setup, User Pools, Identity Pools and IAM [Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) and [Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), this last one not really part directly of AWS Cognito but regarding the security of the app and which will happen implicitly as we define roles and policies. Let's start.

##### User Pools

1. Go to *User Pools* in the [Cognito Dashboard](https://us-east-2.console.aws.amazon.com/cognito/home?region=us-east-2) and hit `Create a user pool`
2. Name your user pool `foobar_user_pool` and click `Review defaults` since we can go with the defaults but will make some changes. 
3. Review the defaults and try to make sense of some of them, like **Required attributes**: email and **Minimum password length**: 8. For this app I decided that the user will sign-up with an email, username and password but as you can see there are lots of other options.
4. Locate the [**App clients**](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) section in the defaults. Click *Add app client*. This is to tell our User Pool that the users that will log-in and sign-up with this user pool come from our app **Foobar**. Now give the client a name like `foobar_app`. Deselect the *Generate client secret* checkbox. [Here](https://stackoverflow.com/questions/41277968/securize-aws-cognito-user-pool-client-id-in-a-static-web/52154106#52154106) and [here](https://stackoverflow.com/questions/47916034/what-is-a-cognito-app-client-secret/52153995#52153995) is why. Lastly make sure to select the box that says `USER_PASSWORD_AUTH`, since we want to allow our users to authenticate with a username and password. Hit *Create app client* 
5. On the left menu go back to *review* and hit *Create pool*. You should see something like [this](/assets/images/user-pool-review.png) once finished. From here take note of the **Pool Id** as well as the **App client id** which you can get in the *App clients** section of your pool. We will use this info later.

Now we can move to *Identity Pools* also known as *Federated Identities*

##### Identity Pools

1. Go to the [*Identity Pool* dashboard](https://us-east-2.console.aws.amazon.com/cognito/federated?region=us-east-2) from Cognito, and hit `Create new identity pool`.
2. Name it `foobar_identity_pool`
3. Check the box for `Enable access to unauthenticated identities` in the *Unauthenticated identities* section. We want to provide access to **Regular Users** without the need of an account.
4. In the Section *Authentication providers* we will select **Cognito** and here we are referring to our User Pool created earlier. We want to fill in **User Pool ID** and **App client id** with the information we got when creating our user pool. Hit `Create Pool`.
5. Once you hit `Create Pool` AWS may complain with the message: **Your Cognito identities require access to your resources** and it does. We need to give this Identity Pool permissions for the identities(users) belonging to it to access AWS resources in our case **AppSync**.
6. We want to modify the defaults so hit `View Details` and you will see *Role Summary*. Here we have 2 roles, first: `Cognito_foobar_identity_pool2Auth_Role` It's a role which will be impersonated by identities who are validated by **User Pools** meaning it's a role that will be given to a user who logged-in in the app, in our case **Establishment Managers**. We want this role to have the following *Policy*(permission) which specifies what the role can do. 
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "appsync:GraphQL",
            "Resource": "arn:aws:appsync:us-east-2:*:apis/ho6jbea5yje3yhuzqux654ga5e/types/*/fields/*"
        }
    ]
}
```
> This policy is saying, whoever has the role `Cognito_foobar_identity_pool2Auth_Role` and therefore this policy attached to it, has access i.e(`"Effect: "Allow"`) to the GraphQL subset of AppSync i.e(`"Action": "appsync:GraphQL"`). What parts of the GraphQL API specifically? `"Resource": "arn:aws:appsync:us-east-2:*:apis/<API_ID>/types/*/fields/*"` Which says it has access to the API with id `<API_ID>` and to all the types `/types/*/` defined in that API's GraphQL schema among which are `Query`, `Mutation` and `Subscription`. It also grants access to all the fields in those types. An authenticated user has the permission to query the API, add new Establishments and Events etc.
7. Click `View Policy Document` and then `edit`. Copy the policy above and replace the default by pasting it into the *Policy Document* box.
8. Do the same for `Cognito_foobar_identity_pool2Unauth_Role` replacing the policy content with the following: 
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "appsync:GraphQL",
            "Resource": "arn:aws:appsync:us-east-2:*:apis/ho6jbea5yje3ritzqux654ga5e/types/Query/fields/*"
        }
    ]
}
```
> Here we are saying, an unauthorized user has only access to the `Query` type and all the fields of that type `/Query/filds/*` of our GraphQL schema and therefore the user who assumes this role i.e(**Regular Users**) can only query the API and cannot add events or establishments since they do not have access to the `Mutation` nor `Subscription` types of our schema. Note the differences between this policy and the one for Authorized identities on step 6.
9. Once you completed the previous steps you should be seeing [this](/assets/images/identity-pool-roles.png). Hit the `Allow` button and we will have our *Identity Pool* created. 
10. Lastly click on your Identity Pool `foobar_identity_pool` and in the top right corner hit `Edit identity pool`. What we are interested in is the **Identity pool ID** which should look something like: `us-east-2:c83c963e-fd03-440d-8504-d0b178d34632`. Take note of it, we will need it for later.

**Note:** If you missed any of the steps above you can always go back to your Identity Pool and edit it. [Here](https://docs.aws.amazon.com/appsync/latest/devguide/security.html) is some valuable information regarding what we just did. 

#### Lambda 

We will use a Lambda Function to retrieve a photo reference that will be the `googlePhotoReference` property of an `Establishment` object in our schema. This reference (which is just a random string of characters and numbers) will be used to  get a 'fresh' url to an establishment image to display in the App. I say 'fresh' because Google doesn't allow us to store information like urls to their images for [more than 30 days](https://developers.google.com/places/web-service/policies#pre-fetching-caching-or-storage-of-content), so we cannot store a permanent url in our database. To work with this constraint we employ this function. The function will act as a resolver for the `googlePhotoReference` field of the `Establishment` type in the GraphQL Schema.

> Note: If we think about it, this function will run every time the client requests an `Establishment` object with the `googlePhotoReference` field in any of its queries. It will even run as many times as `Establishment` objects in a query that returns a list of them. If the user load in our app was heavy this could become an expense that we might not want to afford. This functionality could be moved to the client itself with some hard work, allowing us to get rid of it in the back-end. I use this function here not only to get around [Google's less than 30 days policy](https://developers.google.com/places/web-service/policies#pre-fetching-caching-or-storage-of-content) constraint, but also to demonstrate how a Lambda Function can be used as a data source for custom work you might need to do. 

Let's create our Lambda Function.

1. Go to the [Lambda dashboard](https://us-east-2.console.aws.amazon.com/lambda/home).
2. Hit `[Create Function]` and select **Author from Scratch**.
3. In the Name filed, give the function the name `getGooglePhotoReference`.
4. In the Runtime field select `Node.js 8.10`
5. From the Role list select `Create a custom role`. A new tab will open with a wizard to create a new role. you can run with the defaults, it should look like [this](/assets/images/iam-lambda-role-wizard.png). Go ahead and hit `Allow`.
6. By the end of these steps your Lambda creation wizard should look like [this](/assets/images/lambda-create-function.png). You can hit `[Create Function]`.
7. Now to edit the actual function you should have been redirected and should see a text editor. Replace the content of the editor with the content of [AWS/Lambda/getGooglePhotoReference.js](/AWS/Lambda/getGooglePhotoReference.js) 
8. For the Lambda function to access our Google Maps API we need to set the `GOOGLE_MAPS_API_KEY` environment variable. In the current page, locate the **_Environment Variables_** section and set the key field to `GOOGLE_MAPS_API_KEY` and in the value field put your actual Google Maps Api key.
9. Everything should look somewhat like [this](/assets/images/lambda-text-editor.png). Hit the orange button `[Save]`.

#### AppSync

Access [AppSync's Dashboard](https://us-east-2.console.aws.amazon.com/appsync/home?region=us-east-2) and hit create API. We will create an API called `foobar_API`, pick the option `Author from scratch` since we don't want any defaults. Once created you will be in your API Page where you can see a `API URL`, `API ID` and a `Auth mode` as seen [here](/assets/images/app-sync-api-page.png). Please take note of this info as it will be used later in [`aws-config.js`](/react-app/src/aws-config.js). We will come back to this file and learn what it should contain later.

##### Data Sources

A Data Source is where the data will come from and/or go to when we interact with the API. A Data Source can be a Lambda Function or a DynamoDB database among other options. As our main Data Source we will have the two DynamoDB tables we created earlier `foobar_events_table` and `foobar_establishments`. We will also have the Lambda Function we created earlier.
 
To create a data source, notice the [menu](/assets/images/app-sync-api-page.png) to the left and hit `Data Sources`. Let's start with Dynamo and then Lambda.

##### ⟶  Dynamo as Data Source
1. Once in the Data Sources page hit `New` and fill in the *Data source name* field with `foobar_establishments_table`. 
2. *Data source type* should be `Amazon DynamoDB Table`. 
3. *Region* the region where you have your DynamoDB table, mine is `us-east-2`. 
4. A new drop down list called *Table Name* should have appeared when you picked the region, here you can pick your actual DynamoDB table in our case `foobar_establishments_table`. If no tables appear make sure you selected the right region.
5. Now a new section *Create or use an existing role* should have appeared with two radio buttons. Pick `New Role`, this will create a new role for AppSync that allows it to interact with DynamoDB more specifically with the table we specified. Here the default are actually pretty good so we can run with them.
6. Your setup should look something like [this](/assets/images/app-sync-data-source.png). Hit `Create`. 
7. Repeat for table `foobar_events_table`. At the end your Data Sources page should look like [this](/assets/images/app-sync-data-sources-list.png)


##### ⟶  Lambda Function as Data Source

Very much like setting a DynamoDB table as data source we set our Lambda Function, with some variations.

1. One more time go to the Data Sources page and hit `New`. Fill in the *Data source name* field with `getGooglePhotoReference`. 
2. *Data source type* should be `AWS Lambda Function`. 
3. *Region* the region where you have your Lambda function, mine is `us-east-2`. 
4. A new drop down list called *Function ARN* should have appeared when you picked the region, here you can pick your actual Lambda Function. Check in the name for `function:getGooglePhotoReference`. If the function does not appear make sure you selected the right region.
5. Now a new section *Create or use an existing role* should have appeared with two radio buttons. Pick `New Role`, this will create a new role for AppSync that allows it to call our Lambda Function with the necessary permissions.
6. This setup should look something like [this](/assets/images/app-sync-lambda-data-source.png). Hit `Create`. 

##### Schema
In the left menu seen before now go to `Schema`. You will see [this screen](/assets/images/app-sync-schema-page.png). To the left a text editor: **Schema** . Replace its content with the content of [`schema.graphql`](/AWS/AppSync/schema.graphql), then hit `Save Schema`. 

In the right side: **Resolvers** once the schema was saved you will notice a list with our queries and mutations from the schema, here is where we will set up our [*Resolvers*](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference.html). Resolvers are a way for us to tell our GraphQL server(AppSync) where and how to get/put the information our queries or mutations use. In other words resolvers are the messengers between AppSync and DynamoDB.

Let's setup one of our resolvers, the rest will follow the same pattern: 

1. First locate the Query `getEvents(...): PaginatedEvents!` on your *Resolvers* list and hit the button next to it `Attach`.
2. You will be redirected to the resolver page where you will need to pick a Data Source from the list. If we did set up our data sources correctly you should see your tables here. Select `foobar_events_table` since this is where the information for this particular Query is going to come from.
3. Note that in this page you have two text editors one called **Configure the request mapping template.** and the other **Configure the response mapping template.** We will fill/replace the content of this editors with the content of the files in [`/AWS/AppSync/Resolvers`](/AWS/AppSync/Resolvers). 
4. For this Query we will use [`getEvents.vtl`](/AWS/AppSync/Resolvers/getEvents.vtl) since we are mapping the request and response for the `getEvents(...): PaginatedEvents!` Query.
5. Note the format with which I keep this files. Lines starting with `##` are comments. I stored the the *Request Template* under the `## Request template` comment and the *Response Template* under the `## Response template` comment. Some files might have an additional comment like `## Expected result` or `## Response` which is as it says the expected result of both templates once we execute a Query.

```vtl
## Request template
{
    "version" : "2017-02-28",
    "operation" : "Query",
    "limit": $util.defaultIfNull(${ctx.args.limit}, 20),
    "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.args.nextToken, null)),
    "index" : "establishmentId-startTime-index",
    "query" : {
        "expression": "establishmentId = :estId",
        "expressionValues" : {
            ":estId" : {
                "S" : "$ctx.args.establishmentId"
            }
        }
    }
}


## Response template
#**
    Scan and Query operations return a list of items and a nextToken. Pass them
    to the client for use in pagination.
*#
{
    "events": $util.toJson($ctx.result.items),
    "nextToken": $util.toJson($util.defaultIfNullOrBlank($context.result.nextToken, null))
}
```
6. Replace the content of the **first** editor *Request Mapping Template* with the content of the file under the comment `## Request template`.
7. Replace the content of the **second** editor *Response Mapping Template* with the content of the file under the comment `## Response template`. The third comment if present can be ignored.
8. At the end your resolver should look like [this](/assets/images/app-sync-first-resolver.png). Hit `Save Resolver`
9. Repeat for all the Queries in your **Resolvers** list in the *Schema* page as well as for the Mutations. Also do not forget the resolver for the `googlePhotoReference` in the `Establishment` type. Each of them have a file with the Request and Response template in [/AWS/AppSync/Resolvers](/AWS/AppSync/Resolvers) to set them up.

**Note:** What the Request and Response template are doing is translating a request that comes to the GraphQL API into a request that DynamoDB can understand, same is true for the response, translating the Response from DynamoDB into something GraphQL can work with. This mapping templates are written in a language called VTL(Velocity Template Language) and there is more info about it [here](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-overview.html) and [here](http://velocity.apache.org/engine/2.0/vtl-reference.html).


#### AWS Amplify config

Phew that was a lot, luckily we are almost there. Do you remember everything I asked you to keep note of? We will need all that so that our front-end app knows where the back-end is and how to interact with it. 

This information is sensitive and we do not want to publicly expose it, so we will set it using environment variables. In our case as this is a React App and we will use [this](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables) method to set up the following info in the environment.

Here's a list of the info we need at hand:

* GraphQL URL endpoint
* Identity Pool ID
* User Pool ID
* User Pool Client ID

Make sure you have all of this from the steps that we performed earlier. Now the file [`aws-config`](/react-app/src/aws-config.js) has this:
```js
export default {
  //AppSync conf
  "aws_appsync_graphqlEndpoint": process.env.REACT_APP_GRAPHQL_ENDPOINT,
  "aws_appsync_region": "us-east-2",
  "aws_appsync_authenticationType": "AWS_IAM",
  Auth: {
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
    region: 'us-east-2', 
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID, 
  } 
}
```
This file will be given to aws-amplify like so in [`App.js`](/react-app/src/App.js):

```js
//Amplify setup
import Amplify, { Auth } from 'aws-amplify';
import awsConfig from './aws-config';
Amplify.configure(awsConfig);
```

Note that `aws-config.js` refers to stuff like `process.env.REACT_APP_GRAPHQL_ENDPOINT`. This will be read from an environment variable at runtime, more specifically a variable named `REACT_APP_GRAPHQL_ENDPOINT`.  We want to make sure that the variable was defined in the environment when we fire our App.
To set up the variables navigate the `/react-app` directory and create a file called `.env`. It should look like this but with your information:
```
REACT_APP_GRAPHQL_ENDPOINT=https://unoodauf7fh2ri2jir5lmofydu.appsync-api.us-east-2.amazonaws.com/graphql
REACT_APP_IDENTITY_POOL_ID=us-east-2:c83c963e-fd03-440d-8504-d0b177d34632
REACT_APP_USER_POOL_ID=us-east-2_nsJtg4dFi
REACT_APP_USER_POOL_CLIENT_ID=1s6rjgjqm5d2ojbhgka26sak33
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyAulk5PFU6VTLLaBMnENrJGrKNlGjKnzhE
```
Make sure to save the file.

#### Fire Up
The very last step, finally `cd /react-app` if you are not in this directory already and `npm install && npm start` after some time a new browser tab will pop up and the app will be running.
