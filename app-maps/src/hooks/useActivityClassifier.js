// src/hooks/useActivityClassifier.js
import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { LocationService } from '../services/LocationService';
import { ActivityClassifierService } from '../services/ActivityClassifierService';
import { StorageService } from '../services/StorageService';
import { ActivityType } from '../models/ActivityModel';

export const useActivityClassifier = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(ActivityType.UNKNOWN);
  const [confidence, setConfidence] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    startTime: 0,
    endTime: 0,
    duration: 0,
    totalDistance: 0,
    steps: 0,
    calories: 0,
    averageSpeed: 0,
    activityLogs: []
  });
  const [location, setLocation] = useState(null);
  const [acceleration, setAcceleration] = useState(null);

  const classifier = useRef(new ActivityClassifierService()).current;
  const stopLocationTracking = useRef(null);
  const lastLocation = useRef(null);
  const accelerometerSubscription = useRef(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('Solicitando permisos...');
      
      // Solicitar permisos de ubicación
      let locationStatus = await LocationService.requestPermissions();
      console.log('Estado permisos ubicación:', locationStatus);
      
      // Solicitar permisos de acelerómetro
      let accelerometerStatus = await Accelerometer.requestPermissionsAsync();
      console.log('Estado permisos acelerómetro:', accelerometerStatus);
      
      const permissionsGranted = locationStatus && accelerometerStatus.status === 'granted';
      
      setHasPermission(permissionsGranted);
      
      if (!permissionsGranted) {
        console.warn('Permisos no otorgados');
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  };

  // ... resto del código permanece igual
  const startTracking = () => {
    if (!hasPermission) {
      alert('No permissions granted. Please enable location and motion permissions.');
      return;
    }

    setIsActive(true);
    setActivityLogs([]);
    setSessionStats(prev => ({
      ...prev,
      startTime: Date.now(),
      totalDistance: 0,
      steps: 0,
      calories: 0,
      averageSpeed: 0
    }));

    // Iniciar seguimiento de ubicación
    stopLocationTracking.current = LocationService.startTracking((location) => {
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };

      setLocation(newLocation);

      // Calcular distancia
      if (lastLocation.current) {
        const distance = LocationService.calculateDistance(
          lastLocation.current.latitude,
          lastLocation.current.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        setSessionStats(prev => ({
          ...prev,
          totalDistance: prev.totalDistance + distance
        }));
      }
      lastLocation.current = newLocation;
    });

    // Iniciar acelerómetro
    Accelerometer.setUpdateInterval(1000);
    accelerometerSubscription.current = Accelerometer.addListener((accelData) => {
      const magnitude = classifier.calculateMagnitude(accelData.x, accelData.y, accelData.z);
      const newAcceleration = {
        ...accelData,
        magnitude,
        timestamp: Date.now()
      };
      setAcceleration(newAcceleration);

      // Clasificar actividad
      if (location) {
        const { type, confidence: conf } = classifier.getActivity(location.speed, magnitude);
        setCurrentActivity(type);
        setConfidence(conf);

        // Crear ActivityLog
        const log = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          location,
          acceleration: newAcceleration,
          activityType: type,
          confidence: conf,
          speed: location.speed
        };

        setActivityLogs(prev => [...prev, log]);

        // Actualizar stats
        setSessionStats(prev => {
          const duration = (Date.now() - prev.startTime) / 1000;
          const averageSpeed = duration > 0 ? prev.totalDistance / duration : 0;
          let steps = prev.steps;
          let calories = prev.calories;
          const distanceIncrement = lastLocation.current ? 0.1 : 0; // Pequeño incremento

          if (type === ActivityType.WALKING || type === ActivityType.RUNNING) {
            steps += 1;
          }
          
          if (type === ActivityType.RUNNING) {
            calories += 0.1;
          } else if (type === ActivityType.WALKING) {
            calories += 0.05;
          }

          return {
            ...prev,
            duration,
            averageSpeed,
            steps: Math.round(steps),
            calories: parseFloat(calories.toFixed(2))
          };
        });
      }
    });

    return () => {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
    };
  };

  const stopTracking = async () => {
    setIsActive(false);
    if (stopLocationTracking.current) {
      stopLocationTracking.current();
    }
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
    }
    
    const stats = {
      ...sessionStats,
      endTime: Date.now(),
      activityLogs
    };
    setSessionStats(stats);
    await StorageService.saveLogs(activityLogs);
    await StorageService.saveStats(stats);
  };

  return {
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
    requestPermissions // Exportamos esta función para poder llamarla desde la UI
  };
};