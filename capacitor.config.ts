import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.adb859202f4c4b2b9b74a4421b874d08',
  appName: 'ussd-sync-omatic-11475',
  webDir: 'dist',
  server: {
    url: 'https://adb85920-2f4c-4b2b-9b74-a4421b874d08.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
