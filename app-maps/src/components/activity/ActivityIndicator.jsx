// src/components/activity/ActivityIndicator.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

const getActivityName = (activity) => {
  switch (activity) {
    case ActivityType.IDLE: return 'Quieto';
    case ActivityType.WALKING: return 'Caminando';
    case ActivityType.RUNNING: return 'Corriendo';
    case ActivityType.VEHICLE: return 'Vehículo';
    default: return 'Desconocido';
  }
};

export const ActivityIndicator = ({
  currentActivity,
  confidence,
  speed,
  acceleration
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{getActivityEmoji(currentActivity)}</Text>
      <Text style={styles.activityName}>{getActivityName(currentActivity)}</Text>
      <Text>Confianza: {(confidence * 100).toFixed(1)}%</Text>
      <Text>Velocidad: {speed ? speed.toFixed(1) : '0'} m/s</Text>
      <Text>Aceleración: {acceleration ? acceleration.toFixed(2) : '0'} m/s²</Text>
      <View style={styles.confidenceBar}>
        <View style={[styles.confidenceFill, { width: `${confidence * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  emoji: {
    fontSize: 50
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5
  },
  confidenceBar: {
    height: 10,
    width: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10
  },
  confidenceFill: {
    height: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5
  }
});