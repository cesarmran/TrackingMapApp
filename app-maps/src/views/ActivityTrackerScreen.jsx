// src/views/ActivityTrackerScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useActivityClassifier } from '../hooks/useActivityClassifier';
import { ActivityIndicator } from '../components/activity/ActivityIndicator';
import { SessionStatsCard } from '../components/activity/SessionStatsCard';
import { ActivityLogList } from '../components/activity/ActivityLogList';
import { RouteService } from '../services/RouteService';
import { StorageService } from '../services/StorageService';

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
    requestPermissions,
  } = useActivityClassifier();

  const [showLogs, setShowLogs] = useState(false);
  const [totalStats, setTotalStats] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const loadDashboard = async () => {
    const totals = await StorageService.getTotalStats();
    const savedRoutes = await RouteService.getRoutes();
    setTotalStats(totals);
    setRoutes(savedRoutes.reverse());
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStartTracking = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permisos requeridos',
        'La app necesita ubicación y acelerómetro para funcionar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Solicitar permisos', onPress: requestPermissions },
        ]
      );
      return;
    }
    startTracking();
  };

  const handleStopTracking = async () => {
    const finalStats = await stopTracking();
    const route = await RouteService.saveRoute(activityLogs, finalStats);
    await loadDashboard();

    if (route) {
      Alert.alert('Ruta guardada', `Se guardó "${route.name}".`);
      setSelectedRoute(route);
    } else {
      Alert.alert(
        'Sin puntos',
        'No se generaron coordenadas suficientes para guardar la ruta.'
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.appTitle}>Senda Segura · Tracker</Text>
      <Text style={styles.appSubtitle}>Tu sesión en tiempo real</Text>
    </View>
  );

  const renderLocationCard = () => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Text style={styles.locationTitle}>Ubicación actual</Text>
        <View
          style={[
            styles.liveBadge,
            { backgroundColor: isActive ? '#ff4b4b' : '#9e9e9e' },
          ]}
        >
          <Text style={styles.liveBadgeText}>
            {isActive ? 'EN VIVO' : 'Pausado'}
          </Text>
        </View>
      </View>

      {location ? (
        <>
          <Text style={styles.locationCoords}>
            Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationCoords}>
            Lon: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationNote}>
            Precisión:{' '}
            {location.accuracy ? `${location.accuracy.toFixed(1)} m` : 'N/A'}
          </Text>
        </>
      ) : (
        <View style={styles.locationUnknown}>
          <Text style={styles.locationUnknownIcon}>?</Text>
          <Text style={styles.locationUnknownText}>
            Aún no hay señales de GPS. Muévete o espera unos segundos…
          </Text>
        </View>
      )}
    </View>
  );

  const renderTotalStats = () => {
    if (!totalStats) return null;

    return (
      <View style={styles.totalCard}>
        <Text style={styles.sectionTitle}>Estadísticas Totales</Text>
        <View style={styles.totalRow}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Distancia total</Text>
            <Text style={styles.totalValue}>
              {(totalStats.totalDistance / 1000).toFixed(2)} km
            </Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Sesiones</Text>
            <Text style={styles.totalValue}>{totalStats.totalSessions}</Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Calorías</Text>
            <Text style={styles.totalValue}>
              {totalStats.totalCalories.toFixed(1)}
            </Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Pasos</Text>
            <Text style={styles.totalValue}>
              {totalStats.totalSteps.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRoutesSection = () => (
    <View style={styles.routesCard}>
      <View style={styles.routesHeader}>
        <Text style={styles.sectionTitle}>Rutas guardadas</Text>
        <Text style={styles.routesCount}>{routes.length} rutas</Text>
      </View>

      {routes.length === 0 ? (
        <Text style={styles.routesEmpty}>
          Aún no tienes rutas guardadas. Inicia una sesión para registrar tu
          primera vuelta.
        </Text>
      ) : (
        routes.slice(0, 5).map(route => (
          <TouchableOpacity
            key={route.id}
            style={styles.routeItem}
            onPress={() => setSelectedRoute(route)}
          >
            <View style={styles.routeLeft}>
              <Text style={styles.routeName}>{route.name}</Text>
              <Text style={styles.routeMeta}>
                {(route.stats.distance / 1000).toFixed(2)} km ·{' '}
                {route.stats.duration.toFixed(0)} s
              </Text>
            </View>
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>Ver mapa</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Permisos requeridos</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu ubicación y movimiento para detectar tu
            actividad y guardar tus rutas.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermissions}
          >
            <Text style={styles.primaryButtonText}>OTORGAR PERMISOS</Text>
          </TouchableOpacity>
          <Text style={styles.permissionHint}>
            Si ya aceptaste y sigue sin funcionar, revisa los permisos de la app
            en la configuración de tu celular.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {renderHeader()}
        {renderLocationCard()}

        <ActivityIndicator
          currentActivity={currentActivity}
          confidence={confidence}
          speed={location?.speed || 0}
          acceleration={acceleration?.magnitude || 0}
        />

        <SessionStatsCard stats={sessionStats} />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.primaryButton, isActive && styles.stopButton]}
            onPress={isActive ? handleStopTracking : handleStartTracking}
          >
            <Text style={styles.primaryButtonText}>
              {isActive ? 'DETENER SESIÓN' : 'INICIAR SESIÓN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowLogs(true)}
          >
            <Text style={styles.secondaryButtonText}>Ver logs</Text>
          </TouchableOpacity>
        </View>

        {renderTotalStats()}
        {renderRoutesSection()}
      </ScrollView>

      {/* Modal de logs */}
      <Modal visible={showLogs} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLogs(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Historial de actividad</Text>
            <View style={{ width: 60 }} />
          </View>
          <ActivityLogList logs={activityLogs} />
        </SafeAreaView>
      </Modal>

      {/* Modal del mapa de ruta */}
      <Modal
        visible={!!selectedRoute}
        animationType="slide"
        onRequestClose={() => setSelectedRoute(null)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedRoute(null)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Mapa de ruta</Text>
            <View style={{ width: 60 }} />
          </View>
          {selectedRoute && (
            <WebView
              style={{ flex: 1 }}
              originWhitelist={['*']}
              source={{ html: RouteService.generateMapHtml(selectedRoute) }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Header
  header: {
    marginTop: 8,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  // Location card
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  locationCoords: {
    fontSize: 13,
    color: '#555',
  },
  locationNote: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  locationUnknown: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationUnknownIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffe4e6',
    textAlign: 'center',
    lineHeight: 26,
    marginRight: 8,
    color: '#ff4b4b',
    fontWeight: '700',
  },
  locationUnknownText: {
    flex: 1,
    fontSize: 12,
    color: '#777',
  },
  // Buttons
  actionsRow: {
    marginTop: 10,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#ff4b4b',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#222222',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c5c5c5',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  // Totals
  totalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalItem: {
    flex: 1,
    marginRight: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  // Routes
  routesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routesCount: {
    fontSize: 11,
    color: '#999',
  },
  routesEmpty: {
    fontSize: 12,
    color: '#777',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  routeLeft: {
    flex: 1,
  },
  routeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
  },
  routeMeta: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  routeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#222',
  },
  routeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  // Permisos
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionHint: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  // Modals
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  modalClose: {
    fontSize: 13,
    color: '#007aff',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
});
