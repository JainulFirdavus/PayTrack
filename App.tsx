import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const expoHost = Constants.expoConfig?.hostUri;
const developmentHost = expoHost
  ? new URL(`http://${expoHost}`).hostname
  : null;
const developmentWebAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL?.trim()
  || (developmentHost ? `http://${developmentHost}:5173` : null);
const bundledAndroidAppUrl = 'file:///android_asset/webapp/index.html';

export default function App() {
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const webAppUrl = __DEV__ ? developmentWebAppUrl : Platform.OS === 'android' ? bundledAndroidAppUrl : null;

  if (!webAppUrl) {
    return (
      <View style={styles.messageScreen}>
        <StatusBar style="dark" />
        <Text style={styles.title}>App content is unavailable</Text>
        <Text style={styles.message}>
          {__DEV__
            ? 'Start the web app locally and set EXPO_PUBLIC_WEB_APP_URL, then restart Expo.'
            : 'This standalone build includes the bundled web app for Android.'}
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
          {__DEV__
            ? `${loadError} Make sure the web app is running and reachable at ${webAppUrl}.`
            : `${loadError} The bundled app could not be opened.`}
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
        originWhitelist={['file://*', 'http://*', 'https://*']}
        allowFileAccess={!__DEV__}
        domStorageEnabled
        javaScriptEnabled
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
