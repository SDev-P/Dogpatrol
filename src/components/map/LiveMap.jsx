import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { usePawPatrol } from '../../context/PawPatrolContext';
import { SOCIETY_INFO, SOCIETY_GEOFENCE } from '../../data/keralaSocietyData';

// Map tile providers
const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, DigitalGlobe, GeoEye, Earthstar Geographics'
  },
  dark: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian Team'
  }
};

export default function LiveMap() {
  const {
    robotState,
    dogs,
    selectedDog,
    setSelectedDog,
    hoveredDogId,
    setHoveredDogId,
    tileLayer,
    radius,
    mapInstanceRef,
    isDrawingWaypoints,
    customWaypoints,
    handleMapClick,
    alertZones,
    scrubberHour,
    activeTab,
    isRelocatingMode,
    setIsRelocatingMode
  } = usePawPatrol();

  const mapContainerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const robotMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const pathPolylineRef = useRef(null);
  const dogMarkersGroupRef = useRef(null);
  const alertZonesGroupRef = useRef(null);
  const waypointsGroupRef = useRef(null);
  const geofenceRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SOCIETY_INFO.center,
      zoom: SOCIETY_INFO.zoom,
      zoomControl: false, // Custom position
      attributionControl: false
    });

    // Add initial tile layer
    tileLayerRef.current = L.tileLayer(TILE_LAYERS.street.url, {
      maxZoom: 19,
      attribution: TILE_LAYERS.street.attribution
    }).addTo(map);

    // Create layer groups
    geofenceRef.current = L.polygon(SOCIETY_GEOFENCE, {
      color: '#0d9488',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#0d9488',
      fillOpacity: 0.05
    }).addTo(map);

    pathPolylineRef.current = L.polyline([], {
      color: '#0d9488',
      weight: 4,
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '1, 6'
    }).addTo(map);

    radiusCircleRef.current = L.circle([robotState.lat, robotState.lng], {
      radius: radius,
      color: '#14b8a6',
      weight: 1.5,
      fillColor: '#2dd4bf',
      fillOpacity: 0.12,
      dashArray: '4, 4'
    }).addTo(map);

    dogMarkersGroupRef.current = L.layerGroup().addTo(map);
    alertZonesGroupRef.current = L.layerGroup().addTo(map);
    waypointsGroupRef.current = L.layerGroup().addTo(map);

    // Robot Custom DivIcon
    const robotIcon = L.divIcon({
      className: 'custom-robot-icon',
      html: `
        <div class="robot-marker-container">
          <div class="robot-radar-pulse"></div>
          <div style="
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #0d9488 0%, #042f2e 100%);
            border: 2.5px solid #5eead4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 18px rgba(13, 148, 136, 0.5), 0 0 10px rgba(94, 234, 212, 0.4);
            transform: rotate(${robotState.heading || 0}deg);
            transition: transform 0.4s ease;
            position: relative;
          ">
            <!-- Robot Dog SVG Face / Antenna -->
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="4" width="14" height="12" rx="3"></rect>
              <line x1="12" y1="2" x2="12" y2="4"></line>
              <circle cx="9" cy="9" r="1.5" fill="#5eead4" stroke="none"></circle>
              <circle cx="15" cy="9" r="1.5" fill="#5eead4" stroke="none"></circle>
              <path d="M10 13c.6.4 1.4.6 2 .6s1.4-.2 2-.6"></path>
              <path d="M3 8l2 2"></path>
              <path d="M21 8l-2 2"></path>
            </svg>
            <!-- Heading indicator tip -->
            <div style="
              position: absolute;
              top: -6px;
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-bottom: 7px solid #5eead4;
            "></div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    robotMarkerRef.current = L.marker([robotState.lat, robotState.lng], {
      icon: robotIcon,
      zIndexOffset: 1000
    }).addTo(map);

    robotMarkerRef.current.bindTooltip(
      `<strong>${robotState.robotId}</strong><br/><span style="color:#2dd4bf">${robotState.mode} • ${robotState.battery}%</span>`,
      { className: 'custom-leaflet-tooltip', direction: 'top', offset: [0, -22] }
    );

    // Click handler for drawing custom waypoints
    map.on('click', (e) => {
      handleMapClick(e.latlng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = TILE_LAYERS[tileLayer] || TILE_LAYERS.street;
    tileLayerRef.current.setUrl(config.url);
  }, [tileLayer]);

  // Update Robot Marker, Path Trail & Detection Radius
  useEffect(() => {
    if (!robotMarkerRef.current || !radiusCircleRef.current || !pathPolylineRef.current) return;

    // Update position
    const newLatLng = [robotState.lat, robotState.lng];
    robotMarkerRef.current.setLatLng(newLatLng);
    radiusCircleRef.current.setLatLng(newLatLng);
    radiusCircleRef.current.setRadius(radius);

    // Update robot rotation icon
    const iconContainer = robotMarkerRef.current.getElement()?.querySelector('.robot-marker-container > div:last-child');
    if (iconContainer) {
      iconContainer.style.transform = `rotate(${robotState.heading || 0}deg)`;
    }

    // Update tooltip
    robotMarkerRef.current.setTooltipContent(
      `<strong>${robotState.robotId}</strong><br/><span style="color:#2dd4bf">${robotState.mode} • ${Math.round(robotState.battery)}%</span>`
    );

    // Update trail
    if (robotState.pathHistory && robotState.pathHistory.length > 0) {
      pathPolylineRef.current.setLatLngs(robotState.pathHistory);
    }
  }, [robotState.lat, robotState.lng, robotState.heading, robotState.battery, robotState.mode, radius, robotState.pathHistory]);

  // Render Dog Markers
  useEffect(() => {
    if (!dogMarkersGroupRef.current) return;
    dogMarkersGroupRef.current.clearLayers();

    dogs.forEach((dog) => {
      const isSelected = selectedDog?.id === dog.id;
      const isHovered = hoveredDogId === dog.id;
      const inRadius = dog.inRadius;

      // Color scheme according to dog category
      let badgeBg = '#10b981'; // Green for known
      let borderColor = '#059669';
      let tagLabel = 'Known';

      if (dog.category === 'stray') {
        badgeBg = '#ef4444'; // Red/Coral for stray
        borderColor = '#b91c1c';
        tagLabel = 'Stray';
      } else if (dog.category === 'unknown') {
        badgeBg = '#f59e0b'; // Amber for unknown
        borderColor = '#d97706';
        tagLabel = 'Visitor';
      }

      // Dynamic Paw Marker
      const dogIcon = L.divIcon({
        className: `dog-marker-icon ${isSelected || isHovered ? 'dog-marker-pulse' : ''}`,
        html: `
          <div style="
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
            transform: ${isSelected || isHovered ? 'scale(1.25)' : 'scale(1)'};
          ">
            <!-- Pulsing ring if in detection radius -->
            ${inRadius ? `
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                background: ${badgeBg}33;
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
            ` : ''}

            <!-- Circular Dog Marker Frame -->
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: #ffffff;
              border: 3px solid ${isSelected ? '#38bdf8' : borderColor};
              box-shadow: 0 4px 14px rgba(0,0,0,0.25);
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <img 
                src="${dog.photo}" 
                alt="${dog.name}" 
                style="width: 100%; height: 100%; object-fit: cover;"
                onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'"
              />
            </div>

            <!-- Paw print mini badge -->
            <div style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: ${badgeBg};
              border: 1.5px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <!-- Paw print mini icon -->
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff" stroke="none">
                <circle cx="8" cy="9" r="2.2"></circle>
                <circle cx="16" cy="9" r="2.2"></circle>
                <circle cx="5" cy="14" r="1.8"></circle>
                <circle cx="19" cy="14" r="1.8"></circle>
                <path d="M12 11c-2.8 0-4.5 2-4.5 4.5 0 2 1.8 3.5 4.5 3.5s4.5-1.5 4.5-3.5c0-2.5-1.7-4.5-4.5-4.5z"></path>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([dog.lat, dog.lng], {
        icon: dogIcon,
        zIndexOffset: isSelected ? 900 : (inRadius ? 800 : 700)
      });

      marker.bindTooltip(
        `<strong>${dog.name}</strong> • ${dog.breed}<br/><span style="color:${badgeBg}">${tagLabel} • ${Math.round(dog.confidence * 100)}% match</span>`,
        { className: 'custom-leaflet-tooltip', direction: 'top', offset: [0, -18] }
      );

      marker.on('click', () => {
        setSelectedDog(dog);
      });

      marker.on('mouseover', () => {
        setHoveredDogId(dog.id);
      });

      marker.on('mouseout', () => {
        setHoveredDogId(null);
      });

      dogMarkersGroupRef.current.addLayer(marker);
    });
  }, [dogs, selectedDog, hoveredDogId]);

  // Render Alert & Aggression Zones
  useEffect(() => {
    if (!alertZonesGroupRef.current) return;
    alertZonesGroupRef.current.clearLayers();

    alertZones.forEach(zone => {
      const circle = L.circle(zone.center, {
        radius: zone.radius,
        color: '#ef4444',
        weight: 2,
        fillColor: '#dc2626',
        fillOpacity: 0.22,
        dashArray: '5, 5'
      });

      circle.bindTooltip(
        `<strong style="color:#ef4444">⚠️ Aggression / Barking Zone</strong><br/>${zone.name}<br/><span style="font-size:10px; color:#cbd5e1">${zone.reason}</span>`,
        { className: 'custom-leaflet-tooltip', direction: 'top' }
      );

      alertZonesGroupRef.current.addLayer(circle);
    });
  }, [alertZones]);

  // Render Waypoint Lines & Checkpoints (Custom or Standard)
  useEffect(() => {
    if (!waypointsGroupRef.current) return;
    waypointsGroupRef.current.clearLayers();

    if (isDrawingWaypoints && customWaypoints.length > 0) {
      // Draw custom points line
      const points = customWaypoints.map(wp => [wp.lat, wp.lng]);
      const line = L.polyline(points, {
        color: '#f97316',
        weight: 3,
        dashArray: '6, 6'
      });
      waypointsGroupRef.current.addLayer(line);

      customWaypoints.forEach((wp, idx) => {
        const wpIcon = L.divIcon({
          className: 'wp-icon',
          html: `<div style="
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #f97316;
            color: white;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${idx + 1}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const marker = L.marker([wp.lat, wp.lng], { icon: wpIcon });
        waypointsGroupRef.current.addLayer(marker);
      });
    }
  }, [isDrawingWaypoints, customWaypoints]);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-900 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Waypoint Drawing Overlay Hint */}
      {isDrawingWaypoints && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-amber-500/90 text-slate-950 font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur text-sm flex items-center gap-2 animate-bounce">
          <span>📍 Click anywhere on society roads to place patrol checkpoints</span>
        </div>
      )}

      {/* Robot Relocation Mode Banner */}
      {isRelocatingMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur text-sm flex items-center gap-3 animate-pulse border-2 border-white">
          <span>🎯 Click anywhere on the map to drop & deploy Sparky there</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRelocatingMode(false);
            }}
            className="bg-black/30 hover:bg-black/50 text-xs px-2 py-1 rounded-full transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

