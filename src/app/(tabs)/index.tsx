import { Redirect } from 'expo-router';
import React from 'react';

const HomePage = () => {
  return <Redirect href="/(tabs)/chats" />;
}

export default HomePage