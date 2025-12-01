// App.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityTrackerScreen } from './src/views/ActivityTrackerScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <ActivityTrackerScreen />
    </SafeAreaProvider>
  );
}