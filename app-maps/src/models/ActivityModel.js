// src/models/ActivityModel.js

export const ActivityType = {
  IDLE: 'idle',
  WALKING: 'walking',
  RUNNING: 'running',
  VEHICLE: 'vehicle',
  UNKNOWN: 'unknown'
};

export const DEFAULT_CLASSIFIER_CONFIG = {
  speedThresholds: {
    walking: 1,
    running: 3,
    vehicle: 6.5
  },
  accelerationThresholds: {
    walking: 0.5,
    running: 1.5,
    vehicle: 0.2
  }
};