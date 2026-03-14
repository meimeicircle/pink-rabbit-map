
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { EstateProject } from '../types';
import { getVerdictStyle, RABBIT_AVATAR_URL, SUNGLASSES_URL, MRT_STATIONS } from '../constants';
import { ThemeColor } from '../App';
import { getFluentEmojiHtml, FluentEmoji } from '../utils/fluentEmoji';

// Fix for default leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RabbitMapProps {
  projects: EstateProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mobileView?: 'list' | 'map';
  compareList: EstateProject[];
  onAddToCompare: (project: EstateProject) => void;
  onRemoveFromCompare: (id: string) => void;
  showMRT: boolean;
  themeColor: ThemeColor;
}

const MapResizer: React.FC<{ layoutTrigger?: string }> = ({ layoutTrigger }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [layoutTrigger, map]);
  return null;
};

const MapController: React.FC<{ selectedProject: EstateProject | undefined; mobileView?: 'list' | 'map' }> = ({ selectedProject, mobileView }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedProject) {
      const performFly = () => {
        map.invalidateSize();
        const mapSize = map.getSize();
        if (mapSize.x === 0 || mapSize.y === 0) return;
        const targetZoom = 16; 
        const isMobile = window.innerWidth < 768;
        const offsetY = isMobile ? mapSize.y * 0.25 : 0; 
        const targetLatLng = L.latLng(selectedProject.lat, selectedProject.lng);
        const targetPoint = map.project(targetLatLng, targetZoom);
        const newCenterPoint = L.point(targetPoint.x, targetPoint.y + offsetY); 
        const newCenterLatLng = map.unproject(newCenterPoint, targetZoom);
        map.flyTo(newCenterLatLng, targetZoom, { animate: true, duration: 1.0 });
      };
      const delay = mobileView === 'map' ? 300 : 0;
      const timer = setTimeout(performFly, delay);
      return () => clearTimeout(timer);
    }
  }, [selectedProject, map, mobileView]);
  return null;
};

const AutoFitBounds: React.FC<{ projects: EstateProject[] }> = ({ projects }) => {
  const map = useMap();
  useEffect(() => {
    if (projects.length === 0) return;
    const bounds = L.latLngBounds(projects.map(p => [p.lat, p.lng]));
    if (bounds.isValid()) {
       setTimeout(() => {
         if (projects.length === 1) map.setView([projects[0].lat, projects[0].lng], 15, { animate: true });
         else map.fitBounds(bounds, { paddingBottomRight: [0, 100], paddingTopLeft: [50, 50], maxZoom: 16, animate: true });
       }, 500);
    }
  }, [projects, map]);
  return null;
};

const RabbitMap: React.FC<RabbitMapProps> = ({ 
  projects, 
  selectedId, 
  onSelect, 
  mobileView,
  compareList,
  onAddToCompare,
  onRemoveFromCompare,
  showMRT,
  themeColor
}) => {
  
  const createCustomIcon = (verdict: string, isSelected: boolean) => {
    const style = getVerdictStyle(verdict);
    const size = isSelected ? 72 : 60; // 放大比例：選中時變大 (60 -> 72)
    const anchor = size / 2;
    
    // Sunglasses Overlay Logic for Dark Mode 🕶️
    const sunglassesSvg = themeColor === 'dark' 
      ? `<image href="${SUNGLASSES_URL}" x="12" y="13" width="36" height="36" style="pointer-events: none;" />`
      : '';

    // Icon stroke color based on theme
    let strokeColor = 'white';
    if (isSelected) {
      if (themeColor === 'pink') strokeColor = '#fbcfe8';
      else if (themeColor === 'sky') strokeColor = '#bae6fd';
      else strokeColor = '#728A7A'; // night-pink-primary
    }

    // Using HTML string for DivIcon to support advanced SVG composition
    const svgHtml = `
      <svg width="${size}" height="${size}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/></filter>
        </defs>
        <g filter="url(#shadow)">
          <!-- Pin Body -->
          <path d="M30 2C16.7 2 6 12.7 6 26c0 14 24 32 24 32s24-18 24-32C54 12.7 43.3 2 30 2z" fill="${style.markerColor}" stroke="${strokeColor}" stroke-width="${isSelected ? 3 : 2.5}"/>
          <!-- White Circle Background -->
          <circle cx="30" cy="26" r="18" fill="white" />
          <!-- PINK RABBIT AVATAR -->
          <image href="${RABBIT_AVATAR_URL}" x="12" y="8" width="36" height="36" />
          <!-- SUNGLASSES OVERLAY (DARK MODE ONLY) -->
          ${sunglassesSvg}
        </g>
      </svg>
    `;
    return new L.DivIcon({ html: svgHtml, className: `custom-rabbit-pin ${isSelected ? 'z-[9999]' : ''}`, iconSize: [size, size], iconAnchor: [anchor, size], popupAnchor: [0, -size] });
  };

  const createMRTIcon = (color: string) => {
    return new L.DivIcon({
      className: 'custom-mrt-pin',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
  };

  const defaultCenter: [number, number] = [25.045, 121.45]; 
  const selectedProject = projects.find(p => p.id === selectedId);

  return (
    <div className={`h-full w-full rounded-3xl overflow-hidden shadow-inner border-4 ${themeColor === 'pink' ? 'border-white' : themeColor === 'sky' ? 'border-sky-50' : 'border-night-800 bg-night-800'} z-0 relative`}>
      <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer 
          key={themeColor} /* FORCE RE-RENDER ON THEME CHANGE */
          /* Removed 'rabbit-map-tiles-dark' class to prevent black inverted map */
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
        />
        <MapResizer layoutTrigger={mobileView} />
        <AutoFitBounds projects={projects} />
        <MapController selectedProject={selectedProject} mobileView={mobileView} />
        {showMRT && MRT_STATIONS.map((station, idx) => (
          <Marker key={`mrt-${idx}`} position={[station.lat, station.lng]} icon={createMRTIcon(station.lineColor)} zIndexOffset={-100}>
            <Tooltip direction="top" offset={[0, -12]} opacity={1} className="rabbit-mrt-tooltip">
              <div className="flex flex-col items-center p-1 font-sans min-w-[90px]">
                 <div className="text-2xl mb-1 filter drop-shadow-sm animate-bounce" dangerouslySetInnerHTML={{ __html: getFluentEmojiHtml('🚉', 32) }}></div>
                 <div className="font-bold text-sm text-stone-700 mb-1">{station.name}</div>
                 <div className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold shadow-sm tracking-wide" style={{ backgroundColor: station.lineColor }}>{station.lineName}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
        {projects.map((project) => {
          const isSelected = selectedId === project.id;
          return (
            <Marker 
              key={project.id} 
              position={[project.lat, project.lng]} 
              icon={createCustomIcon(project.verdict, isSelected)} 
              zIndexOffset={isSelected ? 1000 : 0} 
              eventHandlers={{ 
                click: (e) => { L.DomEvent.stopPropagation(e); onSelect(project.id); } 
              }}
            >
              <Tooltip direction="top" offset={[0, -50]} opacity={0.9} className="rabbit-project-tooltip">
                <div className="px-2 py-1 flex flex-col items-center gap-0.5">
                  <div className="font-bold text-stone-700">{project.name}</div>
                  {project.submitter && (
                    <div className="flex items-center gap-1 text-[10px] text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-100">
                      <div className="relative flex items-center justify-center bg-white rounded-full w-3 h-3">
                         <FluentEmoji emoji={project.submitter.emoji} size={8} />
                      </div>
                      <span>{project.submitter.name} 投稿</span>
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Dark Mode Overlay Tint - REMOVED for clarity based on user feedback */}
    </div>
  );
};

export default RabbitMap;
