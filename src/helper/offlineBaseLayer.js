
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import * as extent from 'ol/extent';

export const loadOfflineBaseLayer = (zoom, minX, maxX, minY, maxY) => {

  console.log("_____________FETCHED TILE INFO_______________");
  console.log(zoom, minX, maxX, minY, maxY);

  let container_name = localStorage.getItem("container_name");
  
  const minTile = [zoom, minX, minY]; // [z, x, min_y]
  const maxTile = [zoom, maxX, maxY]; // [z, x, max_y]

  function tile2lon(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
  }

  function tile2lat(y, z) {
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  }

  const minLon = tile2lon(minTile[1], minTile[0]);
  const maxLon = tile2lon(maxTile[1], minTile[0]);
  const maxLat = tile2lat(minTile[2], minTile[0]);
  const minLat = tile2lat(maxTile[2], minTile[0]);
  const layerExtent = [minLon, minLat, maxLon, maxLat];

  const tileLayer = new TileLayer({
    source: new XYZ({
      tileUrlFunction: (tileCoord) => {
        if (!tileCoord) return undefined;
        const z = tileCoord[0];
        const x = tileCoord[1];
        const y = tileCoord[2];

        // Check if the requested tile is within our downloaded range
        if (z === 17 &&
            x >= minTile[1] && x <= maxTile[1] &&
            y >= minTile[2] && y <= maxTile[2]) {
          // Use directory structure format
          return `${window.location.origin}/containers/${container_name}/base_map_tiles/${z}/${x}/${y}.png`;
        }
        return undefined;
      },
      wrapX: false,
      minZoom: 17,
      maxZoom: 17,
      extent: layerExtent
    }),
    extent: layerExtent,
    visible: true
  });

  // Add error handling
  tileLayer.getSource().on('tileloaderror', (event) => {
    const [z, x, y] = event.tile.getTileCoord();
    console.warn('Tile load error:', z, x, y);
  });

  return {
    layer: tileLayer,
    extent: layerExtent
  };
};

// Also add a default export
export default loadOfflineBaseLayer;

// Export helper functions if needed elsewhere
export const tile2lon = (x, z) => (x / Math.pow(2, z) * 360 - 180);
export const tile2lat = (y, z) => {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
};
