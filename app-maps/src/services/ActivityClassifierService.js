// src/services/ActivityClassifierService.js
import { ActivityType, DEFAULT_CLASSIFIER_CONFIG } from '../models/ActivityModel';

export class ActivityClassifierService {
  constructor(config = DEFAULT_CLASSIFIER_CONFIG) {
    this.config = config;
  }

  calculateMagnitude(x, y, z) {
    return Math.sqrt(x * x + y * y + z * z);
  }

  getActivity(speed, acceleration) {
    if (speed === null || speed < 0) {
      return { type: ActivityType.UNKNOWN, confidence: 0 };
    }

    const { speedThresholds, accelerationThresholds } = this.config;

    let type = ActivityType.IDLE;
    let confidence = 0;

    if (speed < speedThresholds.walking) {
      type = ActivityType.IDLE;
      confidence = 0.8;
    } else if (speed < speedThresholds.running) {
      if (acceleration > accelerationThresholds.walking) {
        type = ActivityType.WALKING;
        confidence = 0.7;
      } else {
        type = ActivityType.IDLE;
        confidence = 0.5;
      }
    } else if (speed < speedThresholds.vehicle) {
      if (acceleration > accelerationThresholds.running) {
        type = ActivityType.RUNNING;
        confidence = 0.8;
      } else {
        type = ActivityType.WALKING;
        confidence = 0.6;
      }
    } else {
      if (acceleration < accelerationThresholds.vehicle) {
        type = ActivityType.VEHICLE;
        confidence = 0.9;
      } else {
        type = ActivityType.RUNNING;
        confidence = 0.7;
      }
    }

    return { type, confidence };
  }
}