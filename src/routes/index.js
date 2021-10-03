import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Home from '../pages/Home';

const Stack = createStackNavigator();

export default function Routes(){
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                options={{headerShown: false}}
                component={Home}
            />
        </Stack.Navigator>
    )
}