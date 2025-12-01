// src/services/LocationService.js
import * as Location from 'expo-location';

export class LocationService {
  static async requestPermissions() {
    try {
      console.log('Solicitando permisos de ubicación...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Status de permisos de ubicación:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de ubicación:', error);
      return false;
    }
  }

  static startTracking(callback) {
    console.log('Iniciando tracking de ubicación...');
    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1
      },
      callback
    );

    return () => {
      subscription.then(sub => {
        console.log('Deteniendo tracking de ubicación...');
        sub.remove();
      });
    };
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}