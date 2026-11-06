import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/tokens';
import { DocumentListScreen } from './src/screens/DocumentListScreen';
import { useWebDeepLink, WebSessionTrigger } from './src/services/deepLinkService';

export default function App() {
  const [activeWebSession, setActiveWebSession] = useState<WebSessionTrigger | null>(null);

  // Listen to QR codes / Deep links coming from your website
  useWebDeepLink((trigger) => {
    if (trigger.sessionId) {
      setActiveWebSession(trigger);
    }
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DocumentListScreen
          activeWebSession={activeWebSession}
          onClearWebSession={() => setActiveWebSession(null)}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

