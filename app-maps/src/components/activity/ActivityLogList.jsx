// src/components/activity/ActivityLogList.jsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ActivityType } from '../../models/ActivityModel';

const getActivityEmoji = (activity) => {
  switch (activity) {
    case ActivityType.IDLE: return '🛑';
    case ActivityType.WALKING: return '🚶';
    case ActivityType.RUNNING: return '🏃';
    case ActivityType.VEHICLE: return '🚗';
    default: return '❓';
  }
};

const LogItem = ({ item }) => (
  <View style={styles.logItem}>
    <Text style={styles.emoji}>{getActivityEmoji(item.activityType)}</Text>
    <View style={styles.logDetails}>
      <Text>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      <Text>Vel: {item.speed ? item.speed.toFixed(1) : '0'} m/s</Text>
      <Text>Conf: {(item.confidence * 100).toFixed(0)}%</Text>
    </View>
  </View>
);

export const ActivityLogList = ({ logs }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Actividad</Text>
      <FlatList
        data={logs.slice(-10).reverse()} // Últimos 10 logs
        renderItem={({ item }) => <LogItem item={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  emoji: {
    fontSize: 24,
    marginRight: 15
  },
  logDetails: {
    flex: 1
  }
});