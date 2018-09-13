import React from 'react';

const UserContext = React.createContext({
  user: {},
  fetchCurrentUser: () => {}
});

export default UserContext;
