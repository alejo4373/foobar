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
The steps outlined here can be followed using the AWS web console or ```awscli```. Nonetheless you will need to have a basic knowledge of how AWS works as the instructions given here are rather high level. If you have any problems setting up please make sure you read and follow the associated links to the AWS documentation.

We need:
* DynamoDB: As a database service
* AppSync: As a GraphQL API
* Cognito: As user management service
* Lambda: For adding establishment's managers to admin group

#### DynamoDB 
We will need to create two tables in DynamoDB: ```foobar_establishments``` and ```foobar_events```

At the moment of creation ```foobar_establishments``` will need to have 
```id```(String) as Primary partition and ```league_id```(String) as Primary sort key.

**Note**: Make sure to add a sort key and leave the rest as default
