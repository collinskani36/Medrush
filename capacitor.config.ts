import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.velpure.app',
  appName: 'Velpure Pharmacy',
  webDir: 'dist',
  backgroundColor: '#730139',
  android: {
    backgroundColor: '#730139',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // hidden manually from Home.tsx once the page has rendered
      backgroundColor: '#730139',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;