'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Bike, MapProps } from '@/types/index';

export default function Map({ bikes, selectedBike, onBikeSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});

  const updateMarkers = useCallback((google: typeof window.google, map: google.maps.Map) => {
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.setMap(null));
    markersRef.current = {};

    // Add new markers
    bikes.forEach(bike => {
      if (!bike.currentLocation) return;

      const marker = new google.maps.Marker({
        position: bike.currentLocation,
        map,
        title: `Bike #${bike.bikeNumber}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: bike.status === 'RENTED' ? '#EF4444' : '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', (e: google.maps.MapMouseEvent) => {
        e.stop(); // Prevent map click event from firing
        onBikeSelect(bike);
      });

      markersRef.current[bike.id] = marker;

      // If this is the selected bike, center the map on it
      if (selectedBike?.id === bike.id) {
        map.setCenter(bike.currentLocation);
        map.setZoom(15);
      }
    });
  }, [bikes, selectedBike, onBikeSelect]);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
      });

      try {
        const google = await loader.load();
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 51.5074, lng: -0.1278 }, // Default to London
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        mapInstanceRef.current = map;

        // Add click listener to map to deselect bike
        map.addListener('click', () => {
          onBikeSelect(null);
        });

        // Update markers when bikes change
        updateMarkers(google, map);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBikeSelect]); // updateMarkers is not needed here as it's called inside initMap

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    updateMarkers(window.google, mapInstanceRef.current);
  }, [bikes, selectedBike, updateMarkers]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
} 