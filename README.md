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
* [Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html): As user management service
* [Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html): For adding establishment's managers to admin group
* [AWS Amplify](https://aws-amplify.github.io/amplify-js/media/quick_start): To help us manage and integrate our AWS resources in our App

#### DynamoDB 

We will need to create two tables, go to [Dynamo's Dashboard](https://us-east-2.console.aws.amazon.com/dynamodb/home?region=us-east-2) and create: ```foobar_establishments``` and ```foobar_events```

For ```foobar_establishments``` we will have 
```id```(String) as Primary partition key and ```managerUsername```(String) as Primary sort key. Leave the rest as it is by default and hit create.

For ```foobar_events``` we will have 
```id```(String) as Primary partition key and ```league_id```(String) as Primary sort key. Leave the rest as it is by default and hit create.

**Note**: The primary key will be used to retrieve the items directly by id, while the sort key will allow us to have those items 'sorted' sort to speak, letting us retrieve all the establishments a user manages more easily and efficiently.


#### AppSync

Access [AppSync's Dashboard](https://us-east-2.console.aws.amazon.com/appsync/home?region=us-east-2) and hit create API. We will create an API called ```foobar_API```, pick the option ```Author from scratch``` since we don't want any defaults. Once created you will be in your API Page where you can see a ```API URL```, ```API ID``` and a ```Auth mode``` as seen [here](/assets/images/app-sync-api-page.png). Please take note of this info as it will be used later in [```aws-config.js```](/react-app/src/aws-config.js). We will come back to this file and learn what it should contain later.

As seen in the [screenshot](/assets/images/app-sync-api-page.png), to the left you have a menu which we will use to set up our API. First go to ```Schema```, in the left you will see a text editor: **Schema** where you we are going to copy the content of [```schema.graphql```](/AWS/AppSync/schema.graphql), once copied hit ```Save Schema```. 

In the right side: **Resolvers** now you will notice a list with our queries and mutations from the schema, and here is where we will set up our [*Resolvers*](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference.html). Resolvers are a way for us to tell our GraphQL server(AppSync) where and how to get/put the information our queries or mutations use. In other words resolvers are the messengers between AppSync and DynamoDB.

Let's set up our resolvers one by one: First locate the Query ```getEvents(...): PaginatedEvents!``` and hit the button next to it ```Atach```, you will be redirected to the resolver page which looks like [this](/assets/images/app-sync-resolver-page.png). Here we will pick as our Data Source the DynamoDB table we created earlier ```foobar_events_table```