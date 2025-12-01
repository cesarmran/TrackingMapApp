// src/services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = 'activity_logs';
const STATS_KEY = 'session_stats';
const ROUTES_KEY = 'saved_routes';

export class StorageService {
  static async saveLogs(logs) {
    try {
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }

  static async getLogs() {
    try {
      const logs = await AsyncStorage.getItem(LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }

  static async saveStats(stats) {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  static async getStats() {
    try {
      const stats = await AsyncStorage.getItem(STATS_KEY);
      return stats ? JSON.parse(stats) : null;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  static async saveRoute(route) {
    try {
      const routes = await this.getRoutes();
      routes.push(route);
      await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
    } catch (error) {
      console.error('Error saving route:', error);
    }
  }

  static async getRoutes() {
    try {
      const routes = await AsyncStorage.getItem(ROUTES_KEY);
      return routes ? JSON.parse(routes) : [];
    } catch (error) {
      console.error('Error getting routes:', error);
      return [];
    }
  }
}