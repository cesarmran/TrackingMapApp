// src/services/RouteService.js
import { StorageService } from './StorageService';

export class RouteService {
  static async saveRoute(logs, stats) {
    const route = {
      id: Date.now().toString(),
      name: `Ruta ${new Date().toLocaleString()}`,
      stats: stats,
      logs: logs,
      createdAt: Date.now()
    };

    await StorageService.saveRoute(route);
    return route;
  }

  static generateMapHTML(route) {
    // Simple HTML para mostrar el mapa (puedes mejorarlo con Leaflet)
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ruta</title>
        <style>
          #map { height: 400px; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Aquí iría el código de Leaflet para mostrar el mapa
          console.log('Ruta:', ${JSON.stringify(route)});
        </script>
      </body>
      </html>
    `;
  }
}