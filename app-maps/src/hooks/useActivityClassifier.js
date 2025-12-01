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
    activityLogs: [],
  });

  const [location, setLocation] = useState(null);
  const [acceleration, setAcceleration] = useState(null);

  const classifier = useRef(new ActivityClassifierService()).current;
  const stopLocationTracking = useRef(null);
  const lastLocation = useRef(null);
  const accelerometerSubscription = useRef(null);

  // ───────────────────────────────────────────────
  // PERMISOS
  // ───────────────────────────────────────────────
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      let locationStatus = await LocationService.requestPermissions();
      let accelerometerStatus = await Accelerometer.requestPermissionsAsync();

      const ok =
        locationStatus && accelerometerStatus.status === 'granted';

      setHasPermission(ok);

      if (!ok) console.warn('Permisos NO otorgados');
    } catch (e) {
      console.error('Error solicitando permisos:', e);
    }
  };

  // ───────────────────────────────────────────────
  // INICIAR TRACKING
  // ───────────────────────────────────────────────
  const startTracking = () => {
    if (!hasPermission) {
      alert('Permite ubicación y movimiento para iniciar.');
      return;
    }

    setIsActive(true);
    setActivityLogs([]);

    setSessionStats({
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      totalDistance: 0,
      steps: 0,
      calories: 0,
      averageSpeed: 0,
      activityLogs: [],
    });

    lastLocation.current = null;

    // ─── GPS ─────────────────────────────────────────
    stopLocationTracking.current = LocationService.startTracking(gps => {
      const now = Date.now();

      const newLoc = {
        latitude: gps.coords.latitude,
        longitude: gps.coords.longitude,
        accuracy: gps.coords.accuracy,
        timestamp: gps.timestamp,
      };

      // Cálculo de velocidad manual
      if (lastLocation.current) {
        const dt = (now - lastLocation.current.timestamp) / 1000;
        const dist = LocationService.calculateDistance(
          lastLocation.current.latitude,
          lastLocation.current.longitude,
          newLoc.latitude,
          newLoc.longitude
        );

        const speed = dist / dt;
        newLoc.speed = isFinite(speed) ? speed : 0;

        setSessionStats(prev => ({
          ...prev,
          totalDistance: prev.totalDistance + (isFinite(dist) ? dist : 0),
        }));
      } else {
        newLoc.speed = 0;
      }

      lastLocation.current = newLoc;
      setLocation(newLoc);
    });

    // ─── ACELERÓMETRO ──────────────────────────────
    Accelerometer.setUpdateInterval(1000);
    accelerometerSubscription.current = Accelerometer.addListener(accel => {
      const magnitude = classifier.calculateMagnitude(
        accel.x,
        accel.y,
        accel.z
      );

      const accelData = {
        ...accel,
        magnitude,
        timestamp: Date.now(),
      };

      setAcceleration(accelData);

      if (location?.latitude && location?.longitude) {
        // Clasificación con velocidad manual
        const { type, confidence: conf } = classifier.getActivity(
          location.speed ?? 0,
          magnitude
        );

        setCurrentActivity(type);
        setConfidence(conf);

        // Crear log válido
        const log = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          location: location,
          acceleration: accelData,
          activityType: type,
          confidence: conf,
          speed: location.speed,
        };

        setActivityLogs(prev => [...prev, log]);

        // Calcular stats
        setSessionStats(prev => {
          const duration = (Date.now() - prev.startTime) / 1000;
          const avg = prev.totalDistance / (duration || 1);

          let steps = prev.steps;
          let calories = prev.calories;

          if (type === ActivityType.WALKING || type === ActivityType.RUNNING)
            steps += 1;

          if (type === ActivityType.RUNNING) calories += 0.1;
          if (type === ActivityType.WALKING) calories += 0.05;

          return {
            ...prev,
            duration,
            averageSpeed: avg,
            steps,
            calories,
          };
        });
      }
    });
  };

  // ───────────────────────────────────────────────
  // DETENER TRACKING
  // ───────────────────────────────────────────────
  const stopTracking = async () => {
    setIsActive(false);

    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
    }

    if (stopLocationTracking.current) {
      stopLocationTracking.current();
    }

    const finalStats = {
      ...sessionStats,
      endTime: Date.now(),
      activityLogs,
    };

    setSessionStats(finalStats);

    await StorageService.saveLogs(activityLogs);
    await StorageService.saveStats(finalStats);

    return finalStats;
  };

  // ───────────────────────────────────────────────
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
    requestPermissions,
  };
};
