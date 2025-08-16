export function verifyGeofence(centerLat: number, centerLng: number, radiusMeters: number, lat: number, lng: number) {
  function toRad(x: number) {
    return (x * Math.PI) / 180;
  }
  const R = 6378137;
  const dLat = toRad(lat - centerLat);
  const dLon = toRad(lng - centerLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(centerLat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d <= radiusMeters;
}