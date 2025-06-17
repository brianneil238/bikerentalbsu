/// <reference types="@types/google.maps" />
 
declare global {
  interface Window {
    google: typeof google;
  }
} 

declare module '@types/google.maps'; 