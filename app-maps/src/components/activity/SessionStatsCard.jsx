// src/components/activity/SessionStatsCard.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SessionStatsCard = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas de Sesión</Text>
      <Text>Duración: {stats.duration.toFixed(0)} s</Text>
      <Text>Distancia: {stats.totalDistance.toFixed(2)} m</Text>
      <Text>Calorías: {stats.calories.toFixed(2)}</Text>
      <Text>Pasos: {stats.steps.toFixed(0)}</Text>
      <Text>Velocidad Promedio: {stats.averageSpeed.toFixed(2)} m/s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  }
});