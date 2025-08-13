'use client';

import { useLocation } from '../context/LocationContext';

const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'Vancouver', label: 'Vancouver' },
  { value: 'North Vancouver', label: 'North Vancouver' },
  { value: 'Richmond', label: 'Richmond' },
  { value: 'Burnaby', label: 'Burnaby' },
  { value: 'Surrey', label: 'Surrey' }
];

export default function LocationSelector() {
  const { selectedLocation, setSelectedLocation } = useLocation();

  return (
    <select 
      value={selectedLocation}
      onChange={(e) => setSelectedLocation(e.target.value)}
      className="w-full text-xs border border-white/20 bg-white/10 text-white px-3 py-2 rounded-lg font-medium [clip-path:polygon(0.25rem_0%,100%_0%,100%_calc(100%-0.25rem),calc(100%-0.25rem)_100%,0%_100%,0%_0.25rem)]"
    >
      {locations.map(location => (
        <option key={location.value} value={location.value}>
          {location.label}
        </option>
      ))}
    </select>
  );
}