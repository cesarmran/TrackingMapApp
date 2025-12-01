// src/services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LOGS: '@activity_logs',
  LAST_STATS: '@last_session_stats',
  TOTAL_STATS: '@total_stats',
  ROUTES: '@saved_routes',
};

export class StorageService {
  // ----- LOGS -----
  static async saveLogs(logs) {
    try {
      await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs || []));
    } catch (e) {
      console.warn('Error guardando logs', e);
    }
  }

  static async getLogs() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Error leyendo logs', e);
      return [];
    }
  }

  // ----- STATS DE SESIÓN + TOTALES -----
  static async saveStats(stats) {
    try {
      await AsyncStorage.setItem(KEYS.LAST_STATS, JSON.stringify(stats));

      const totals = await this.getTotalStats();

      const updatedTotals = {
        totalSessions: (totals.totalSessions || 0) + 1,
        totalDistance: (totals.totalDistance || 0) + (stats.totalDistance || 0),
        totalDuration: (totals.totalDuration || 0) + (stats.duration || 0),
        totalCalories: (totals.totalCalories || 0) + (stats.calories || 0),
        totalSteps: (totals.totalSteps || 0) + (stats.steps || 0),
      };

      await AsyncStorage.setItem(KEYS.TOTAL_STATS, JSON.stringify(updatedTotals));
      return updatedTotals;
    } catch (e) {
      console.warn('Error guardando stats', e);
      return null;
    }
  }

  static async getLastStats() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.LAST_STATS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Error leyendo last stats', e);
      return null;
    }
  }

  static async getTotalStats() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.TOTAL_STATS);
      if (!raw) {
        return {
          totalSessions: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalCalories: 0,
          totalSteps: 0,
        };
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error leyendo total stats', e);
      return {
        totalSessions: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalSteps: 0,
      };
    }
  }

  // ----- RUTAS -----
  static async getRoutes() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.ROUTES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Error leyendo rutas', e);
      return [];
    }
  }

  static async saveRoutes(routes) {
    try {
      await AsyncStorage.setItem(KEYS.ROUTES, JSON.stringify(routes || []));
    } catch (e) {
      console.warn('Error guardando rutas', e);
    }
  }
}
