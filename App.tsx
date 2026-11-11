import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const configuredUrl = process.env.EXPO_PUBLIC_WEB_APP_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri;
const developmentHost = expoHost
  ? new URL(`http://${expoHost}`).hostname
  : null;
const webAppUrl = configuredUrl || (developmentHost ? `http://${developmentHost}:5173` : null);

export default function App() {
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  if (!webAppUrl) {
    return (
      <View style={styles.messageScreen}>
        <StatusBar style="dark" />
        <Text style={styles.title}>Web app URL is not configured</Text>
        <Text style={styles.message}>
          Set EXPO_PUBLIC_WEB_APP_URL to the hosted web app address, then restart Expo.
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.messageScreen}>
        <StatusBar style="dark" />
        <Text style={styles.title}>Can’t connect to the web app</Text>
        <Text style={styles.message}>
          {loadError} Make sure the web app is running and reachable at {webAppUrl}.
        </Text>
        <Pressable onPress={() => { setLoadError(''); setReloadKey((key) => key + 1); }} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <WebView
        key={reloadKey}
        onError={(event) => setLoadError(event.nativeEvent.description)}
        onHttpError={(event) => setLoadError(`The web app returned HTTP ${event.nativeEvent.statusCode}.`)}
        onLoadStart={() => setLoadError('')}
        originWhitelist={['http://*', 'https://*']}
        source={{ uri: webAppUrl }}
        startInLoadingState
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f5fa' },
  webView: { flex: 1, backgroundColor: '#f8f5fa' },
  messageScreen: {
    alignItems: 'center',
    backgroundColor: '#f8f5fa',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  title: { color: '#17131a', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  message: { color: '#817a85', fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: 'center' },
  retryButton: { backgroundColor: '#5743d7', borderRadius: 10, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
