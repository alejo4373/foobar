# FooBar

## Introduction
Welcome to **FooBar** a Full-Stack Web App that enables sports fanatics to find bars that will be showing the game or fight of their interest, and it does so by encouraging establishments to post the games/fights they will be showing in their profile page on our platform. 

Built with ReactJS in the front-end and an array of Amazon Web Services including AppSync, DynamoDB, Lambda and Cognito as the back-end.

## Features
**Foobar** is intended to be used by two different kinds of users, mainly establishments and sports fanatics. Its graphic interface is visually consistent but on the establishment side it exposes a few more controls to allow the establishment's management of sporting events.

### _As an Establishment_
It is required an establishment be registered by its management onto **Foobar** in order for the establishment to advertise/post sporting events they will be showing at their venue.

Upon registration and login the management of an establishment is welcomed with the landing page shown above where, integrated in the search bar there are two link icons: Profile and Logout.

Now management can register one or more of their establishments by going to their profile.

![business-perspective](assets/images/business_perspective.gif) 
##### fig 1. Adding a business and an event flow.

### _As an regular User_
A regular user doesn't need an account. **Foobar** is a public website where a user can find the bar that will be showing the game of their interest. To accomplish this task the user is offered a search bar where they can search for an establishment, as well as the map view where they can see establishments near them or explore new areas of the map and their offers.

![user-perspective](assets/images/user_perspective.gif) 
##### fig 2. A user looking for the Patriots vs Giants game

## Setup

### Amazon Web Services (AWS)
**Note**:
The steps outlined here are to be followed using the [AWS web console](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ConsoleDynamoDB.html). However ```awscli``` can be used to perform the same steps faster. Regardless you will need to have a basic knowledge of how AWS works as the instructions given here are rather high level. If you have any problems setting up please make sure you read and follow the associated links to the AWS documentation.

We need:
* [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html): As a database service
* [AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html): As a GraphQL API
* [Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html): As user management and credentials granting service 
* [Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html): For adding establishment's managers to admin group
* [AWS Amplify](https://aws-amplify.github.io/amplify-js/media/quick_start): To help us manage and integrate our AWS resources in our App

#### DynamoDB 

We will need to create two tables, go to [Dynamo's Dashboard](https://us-east-2.console.aws.amazon.com/dynamodb/home?region=us-east-2) and create: ```foobar_establishments``` and ```foobar_events```

For ```foobar_establishments``` we will have 
```id```(String) as Primary partition key and ```managerUsername```(String) as Primary sort key. Leave the rest as it is by default and hit create.

For ```foobar_events``` we will have 
```id```(String) as Primary partition key and ```league_id```(String) as Primary sort key. Leave the rest as it is by default and hit create.

**Note**: The primary key will be used to retrieve the items directly by id, while the sort key will allow us to have those items 'sorted' sort to speak, letting us retrieve all the establishments a user manages more easily and efficiently.

#### Cognito

From Amazon Cognito we will use *User Pools* which will allows to sign-up users* and serve us as a user directory/management system. Besides user pools we will also use *Identity Pools*, which will grant those users who signed-up permissions to access other AWS resources in our case specifically *AppSync API*.

**\*** When I'm talking of users in this context I am refereeing to **Establishment Managers** and  not **Regular Users**. 

![Auth flow with cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/images/scenario-cup-cib2.png)
##### fig 3. Auth Flow representation with AWS Cognito

We want to be careful here as in this set-up relies a big part of the security of our app. We want to make sure we are granting users only the permissions required for them to use our app as we intend them to use it and no more. I will explain in more detail as we walk through.

There is three parts to this setup, User Pools, Identity Pools and IAM [Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) and [Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), this last one not really part directly of AWS Cognito but regarding the security of the app and which will happen implicitly as we define roles and policies. Let's start.

##### User Pools

1. Go to *User Pools* in the [Cognito Dashboard](https://us-east-2.console.aws.amazon.com/cognito/home?region=us-east-2) and hit ```Create a user pool```
2. Name your user pool ```foobar_user_pool``` and click ```Review defaults``` since we can go with the defaults but will make some changes. 
3. Review the defaults and try to make sense of some of them, like **Required attributes**: email and **Minimum password length**: 8. For this app I decided that the user will sign-up with an email, username and password but as you can see there are lots of other options.
4. Locate the [**App clients**](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html) section in the defaults. Click *Add app client*. This is to tell our User Pool that the users that will log-in and sign-up with this user pool come from our app **Foobar**. Now give the client a name like ```foobar_app```. Deselect the *Generate client secret* checkbox. [Here](https://stackoverflow.com/questions/41277968/securize-aws-cognito-user-pool-client-id-in-a-static-web/52154106#52154106) and [here](https://stackoverflow.com/questions/47916034/what-is-a-cognito-app-client-secret/52153995#52153995) is why. Lastly make sure to select the box that says ```USER_PASSWORD_AUTH```, since we want to allow our users to authenticate with a username and password. Hit *Create app client* 
5. On the left menu go back to *review* and hit *Create pool*. You should see something like [this](/assets/images/user-pool-review.png) once finished. From here take note of the **Pool Id** as well as the **App client id** which you can get in the *App clients** section of your pool. We will use this info later.

Now we can move to *Identity Pools* also known as *Federated Identities*

##### Identity Pools

1. Go to the [*Identity Pool* dashboard](https://us-east-2.console.aws.amazon.com/cognito/federated?region=us-east-2) from Cognito, and hit ```Create new identity pool```.
2. Name it ```foobar_identity_pool```
3. Check the box for ```Enable access to unauthenticated identities``` in the *Unauthenticated identities* section. We want to provide access to **Regular Users** without the need of an account.
4. In the Section *Authentication providers* we will select **Cognito** and here we are referring to our User Pool created earlier. We want to fill in **User Pool ID** and **App client id** with the information we got when creating our user pool. Hit ```Create Pool```.
5. Once you hit ```Create Pool``` AWS may complain with the message: **Your Cognito identities require access to your resources** and it does. We need to give this Identity Pool permissions for the identities(users) belonging to it to access AWS resources in our case **AppSync**.
6. We want to modify the defaults so hit ```View Details``` and you will see *Role Summary*. Here we have 2 roles, first: ```Cognito_foobar_identity_pool2Auth_Role``` It's a role which will be impersonated by identities who are validated by **User Pools** meaning it's a role that will be given to a user who logged-in in the app, in our case **Establishment Managers**. We want this role to have the following *Policy*(permission) which specifies what the role can do. 
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
> This policy is saying, whoever has the role ```Cognito_foobar_identity_pool2Auth_Role``` and therefore this policy attached to it, has access i.e(```"Effect: "Allow"```) to the GraphQL subset of AppSync i.e(```"Action": "appsync:GraphQL"```). What parts of the GraphQL API specifically? ```"Resource": "arn:aws:appsync:us-east-2:*:apis/<API_ID>/types/*/fields/*"``` Which says it has access to the API with id ```<API_ID>``` and to all the types ```/types/*/``` defined in that API's GraphQL schema among which are ```Query```, ```Mutation``` and ```Subscription```. It also grants access to all the fields in those types. An authenticated user has the permission to query the API, add new Establishments and Events etc.
7. Click ```View Policy Document``` and then ```edit```. Copy the policy above and replace the default by pasting it into the *Policy Document* box.
8. Do the same for ```Cognito_foobar_identity_pool2Unauth_Role``` replacing the policy content with the following: 
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
> Here we are saying, an unauthorized user has only access to the ```Query``` type and all the fields of that type ```/Query/filds/*``` of our GraphQL schema and therefore the user who assumes this role i.e(**Regular Users**) can only query the API and cannot add events or establishments since they do not have access to the ```Mutation``` nor ```Subscription``` types of our schema. Note the differences between this policy and the one for Authorized identities on step 6.
9. Once you completed the previous steps you should be seeing [this](/assets/images/identity-pool-roles.png). Hit the ```Allow``` button and we will have our *Identity Pool* created. 
10. Lastly click on your Identity Pool ```foobar_identity_pool``` and in the top right corner hit ```Edit identity pool```. What we are interested in is the **Identity pool ID** which should look something like: ```us-east-2:c83c963e-fd03-440d-8504-d0b178d34632```. Take note of it, we will need it for later.

**Note:** If you missed any of the steps above you can always go back to your Identity Pool and edit it. [Here](https://docs.aws.amazon.com/appsync/latest/devguide/security.html) is some valuable information regarding what we just did. 

#### AppSync

Access [AppSync's Dashboard](https://us-east-2.console.aws.amazon.com/appsync/home?region=us-east-2) and hit create API. We will create an API called ```foobar_API```, pick the option ```Author from scratch``` since we don't want any defaults. Once created you will be in your API Page where you can see a ```API URL```, ```API ID``` and a ```Auth mode``` as seen [here](/assets/images/app-sync-api-page.png). Please take note of this info as it will be used later in [```aws-config.js```](/react-app/src/aws-config.js). We will come back to this file and learn what it should contain later.

As seen in the [screenshot](/assets/images/app-sync-api-page.png), to the left you have a menu which we will use to set up our API. First go to ```Schema```, in the left you will see a text editor: **Schema** where you we are going to copy the content of [```schema.graphql```](/AWS/AppSync/schema.graphql), once copied hit ```Save Schema```. 

In the right side: **Resolvers** now you will notice a list with our queries and mutations from the schema, and here is where we will set up our [*Resolvers*](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference.html). Resolvers are a way for us to tell our GraphQL server(AppSync) where and how to get/put the information our queries or mutations use. In other words resolvers are the messengers between AppSync and DynamoDB.

Let's set up our resolvers one by one: First locate the Query ```getEvents(...): PaginatedEvents!``` and hit the button next to it ```Atach```, you will be redirected to the resolver page which looks like [this](/assets/images/app-sync-resolver-page.png). Here we will pick as our Data Source the DynamoDB table we created earlier ```foobar_events_table```