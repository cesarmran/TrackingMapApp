// src/services/RouteService.js
import { StorageService } from './StorageService';

export class RouteService {
  static async getRoutes() {
    return await StorageService.getRoutes();
  }

  static async saveRoute(activityLogs, stats) {
    if (!activityLogs || activityLogs.length === 0) {
      return null;
    }

    const routes = await StorageService.getRoutes();

    const id = `route-${Date.now()}`;
    const start = stats.startTime ? new Date(stats.startTime) : new Date();
    const name = `Ruta ${start.toLocaleDateString()} ${start.toLocaleTimeString()}`;

    const cleanPoints = activityLogs
      .filter(l => l.location && l.location.latitude && l.location.longitude)
      .map(l => ({
        lat: l.location.latitude,
        lon: l.location.longitude,
        speed: l.speed || 0,
        ts: l.timestamp,
      }));

    const route = {
      id,
      name,
      createdAt: start.getTime(),
      stats: {
        duration: stats.duration,
        distance: stats.totalDistance,
        calories: stats.calories,
        steps: stats.steps,
        averageSpeed: stats.averageSpeed,
      },
      points: cleanPoints,
    };

    routes.push(route);
    await StorageService.saveRoutes(routes);
    return route;
  }

  static generateMapHtml(route) {
    if (!route || !route.points || route.points.length === 0) {
      return `
        <html>
          <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="display:flex;align-items:center;justify-content:center;font-family:sans-serif;background:#111;color:#fff;">
            <div>No hay puntos suficientes para mostrar la ruta.</div>
          </body>
        </html>
      `;
    }

    const centerLat =
      route.points.reduce((sum, p) => sum + p.lat, 0) / route.points.length;
    const centerLon =
      route.points.reduce((sum, p) => sum + p.lon, 0) / route.points.length;

    const segments = [];
    for (let i = 0; i < route.points.length - 1; i++) {
      const p1 = route.points[i];
      const p2 = route.points[i + 1];
      const speed = p2.speed || p1.speed || 0;
      segments.push([p1.lat, p1.lon, p2.lat, p2.lon, speed]);
    }

    const start = route.points[0];
    const end = route.points[route.points.length - 1];

    const segmentsJson = JSON.stringify(segments);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <style>
        html, body, #map {
          height: 100%;
          margin: 0;
          padding: 0;
          background: #0b1020;
        }
        .info-panel {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(10, 10, 10, 0.85);
          color: #fff;
          padding: 10px 14px;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 12px;
        }
        .legend {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(10, 10, 10, 0.85);
          color: #fff;
          padding: 8px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-family: system-ui;
        }
        .legend-bar {
          height: 8px;
          width: 120px;
          background: linear-gradient(90deg, #00e1ff, #00ff85, #ffe700, #ff6f00, #ff0033);
          border-radius: 4px;
          margin-bottom: 4px;
        }
      </style>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <div class="info-panel">
        <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${route.name}</div>
        <div style="opacity:0.8;">Distancia: ${(route.stats.distance / 1000).toFixed(2)} km</div>
        <div style="opacity:0.8;">Duración: ${route.stats.duration.toFixed(0)} s</div>
        <div style="opacity:0.8;">Vel. Promedio: ${route.stats.averageSpeed.toFixed(2)} m/s</div>
      </div>
      <div class="legend">
        <div class="legend-bar"></div>
        <div>Bajo &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Alto</div>
        <div style="opacity:0.7;">Color indica velocidad del tramo</div>
      </div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([${centerLat}, ${centerLon}], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        function speedToColor(speed) {
          // speed en m/s
          if (speed < 1) return '#00e1ff';    // muy lento
          if (speed < 2.5) return '#00ff85';  // caminando
          if (speed < 4) return '#ffe700';    // trote
          if (speed < 7) return '#ff6f00';    // rápido
          return '#ff0033';                   // muy rápido / vehículo
        }

        var segments = ${segmentsJson};

        segments.forEach(function(seg) {
          var latlngs = [
            [seg[0], seg[1]],
            [seg[2], seg[3]]
          ];
          var color = speedToColor(seg[4]);
          L.polyline(latlngs, {
            color: color,
            weight: 6,
            opacity: 0.9,
            lineCap: 'round'
          }).addTo(map);
        });

        var startIcon = L.circleMarker([${start.lat}, ${start.lon}], {
          radius: 7,
          color: '#00ff85',
          fillColor: '#00ff85',
          fillOpacity: 1
        }).addTo(map).bindPopup('Inicio');

        var endIcon = L.circleMarker([${end.lat}, ${end.lon}], {
          radius: 7,
          color: '#ff0033',
          fillColor: '#ff0033',
          fillOpacity: 1
        }).addTo(map).bindPopup('Fin');

        var bounds = L.latLngBounds(segments.map(function(seg){
          return [[seg[0], seg[1]], [seg[2], seg[3]]];
        }).flat());
        map.fitBounds(bounds, { padding: [30, 30] });
      </script>
    </body>
    </html>
    `;
  }
}
