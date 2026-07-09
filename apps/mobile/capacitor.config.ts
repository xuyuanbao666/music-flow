import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.musicflow.app',
  appName: 'MusicFlow',
  webDir: '../web/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: true,
      spinnerColor: '#3b82f6'
    }
  }
}

export default config
