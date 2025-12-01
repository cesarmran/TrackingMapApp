// src/views/ActivityTrackerScreen.jsx
import React, { useState } from 'react';
import { View, Button, Modal, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivityClassifier } from '../hooks/useActivityClassifier';
import { ActivityIndicator } from '../components/activity/ActivityIndicator';
import { SessionStatsCard } from '../components/activity/SessionStatsCard';
import { ActivityLogList } from '../components/activity/ActivityLogList';
import { RouteService } from '../services/RouteService';

export const ActivityTrackerScreen = () => {
  const {
    currentActivity,
    confidence,
    activityLogs,
    sessionStats,
    isActive,
    startTracking,
    stopTracking,
    location,
    acceleration,
    hasPermission,
    requestPermissions
  } = useActivityClassifier();

  const [showLogs, setShowLogs] = useState(false);

  const handleStartTracking = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permisos Requeridos',
        'Esta aplicación necesita permisos de ubicación y acelerómetro para funcionar. ¿Quieres solicitar los permisos ahora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Solicitar Permisos', onPress: requestPermissions }
        ]
      );
      return;
    }
    startTracking();
  };

  const handleStopTracking = async () => {
    await stopTracking();
    // Guardar la ruta
    const route = await RouteService.saveRoute(activityLogs, sessionStats);
    Alert.alert('Ruta Guardada', `Ruta "${route.name}" guardada exitosamente.`);
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Permisos Requeridos</Text>
          <Text style={styles.permissionText}>
            Esta aplicación necesita acceso a tu ubicación y acelerómetro para detectar actividad física.
          </Text>
          <Button
            title="OTORGAR PERMISOS"
            onPress={requestPermissions}
            color="#4caf50"
          />
          <Text style={styles.permissionHint}>
            Si los permisos no se solicitan automáticamente, ve a Configuración → Aplicaciones → Activity Tracker → Permisos
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ActivityIndicator
          currentActivity={currentActivity}
          confidence={confidence}
          speed={location?.speed || null}
          acceleration={acceleration?.magnitude || null}
        />
        
        <SessionStatsCard stats={sessionStats} />
        
        <View style={styles.buttonContainer}>
          <Button
            title={isActive ? "DETENER SEGUIMIENTO" : "INICIAR SEGUIMIENTO"}
            onPress={isActive ? handleStopTracking : handleStartTracking}
            color={isActive ? "#ff4444" : "#4caf50"}
          />
          
          <View style={styles.spacer} />
          
          <Button
            title="VER HISTORIAL"
            onPress={() => setShowLogs(true)}
            color="#2196f3"
          />

          <View style={styles.spacer} />

          <Button
            title="SOLICITAR PERMISOS NUEVAMENTE"
            onPress={requestPermissions}
            color="#ff9800"
          />
        </View>

        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>Última Ubicación:</Text>
            <Text>Lat: {location.latitude.toFixed(6)}</Text>
            <Text>Lon: {location.longitude.toFixed(6)}</Text>
            <Text>Precisión: {location.accuracy ? location.accuracy.toFixed(1) + 'm' : 'N/A'}</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showLogs} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button title="Cerrar" onPress={() => setShowLogs(false)} />
          </View>
          <ActivityLogList logs={activityLogs} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22
  },
  permissionHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontStyle: 'italic'
  },
  buttonContainer: {
    padding: 20
  },
  spacer: {
    height: 10
  },
  locationContainer: {
    padding: 15,
    margin: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  locationTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2196f3'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});