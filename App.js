/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes';
import React from 'react';


const App = () => {

  return (
    <NavigationContainer>
      <Routes />
    </NavigationContainer>
  );
};

export default App;
