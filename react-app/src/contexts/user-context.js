import React from 'react';

const UserContext = React.createContext({
  user: {},
  fetchingUser: true,
});

export default UserContext;
