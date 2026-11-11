# PayTrack

PayTrack is a web app with an Expo Android shell. The Expo app opens the web UI in a
WebView, so the mobile interface uses the same components and `src/themes/zyric.css`
as the browser app.

## Requirements

- Node.js and npm
- Homebrew
- Java 17
- Android SDK command-line tools
- An Android phone and the same Wi-Fi network as the development computer

## Install dependencies

```sh
npm install
```

Install the Android build tools if they are not already installed:

```sh
brew install openjdk@17
brew install --cask android-commandlinetools
```

Set up the Android SDK and accept its licenses:

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

mkdir -p "$ANDROID_HOME"
sdkmanager --sdk_root="$ANDROID_HOME" --licenses
sdkmanager --sdk_root="$ANDROID_HOME" \
  "platform-tools" \
  "platforms;android-37.0" \
  "build-tools;37.0.0" \
  "ndk;27.1.12297006"
```

If Homebrew or Android SDK is installed in a different location, adjust the paths
above accordingly.

## Run the web app and Expo Go locally

Expo Go development loads the Vite web app over the local network. Set
`EXPO_PUBLIC_WEB_APP_URL` in the ignored `.env.local` file to this computer's Wi-Fi
IP address:

```dotenv
EXPO_PUBLIC_WEB_APP_URL=http://<computer-lan-ip>:5173
```

Then start the web app and Expo:

```sh
npm run start -- --port 5173
```

In another terminal:

```sh
npx expo start --clear --go --lan
```

Keep both processes running. Connect the phone to the same Wi-Fi and open the
Expo Go address printed in the terminal.

## Build a standalone Android APK

The APK bundles the production web app inside the Android application. It runs in
the app's embedded WebView and does not need a browser, a hosted site, the Vite
server, or a Wi-Fi connection.

First generate the optimized, self-contained mobile web bundle and the Android
project. The Expo config plugin copies the web bundle into Android assets during
prebuild:

```sh
npm run build:mobile
npx expo prebuild --platform android
```

In the same terminal where you build, configure Java and Android SDK paths. These
exports apply to the current terminal session:

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

java -version
```

Confirm the output shows Java 17, then build the release APK:

```sh
cd android
./gradlew assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`
(from the project root). If you are already in `android/`, its path is
`app/build/outputs/apk/release/app-release.apk`.

If you see “Unable to locate a Java Runtime,” set `JAVA_HOME` and `PATH` again in
that terminal before running Gradle. To make the paths available in every new
zsh terminal, add them to `~/.zshrc`:

```sh
cat >> ~/.zshrc <<'EOF'
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
EOF
source ~/.zshrc
```

Transfer that file to the Android phone and install it. Android may ask you to
allow installation from the file manager or browser used to open the APK.

## Debug the Android app

Connect the phone with USB debugging enabled and accept the debugging prompt.
In Terminal 1, confirm ADB sees the phone, clear old messages, and start saving
all new logs to a file on the Desktop:

```sh
ADB="$HOME/Library/Android/sdk/platform-tools/adb"
"$ADB" devices -l
"$ADB" logcat -c
"$ADB" logcat -v time > "$HOME/Desktop/paytrack-log.txt"
```

Leave Terminal 1 running. In Terminal 2, restart the app to capture its startup:

```sh
ADB="$HOME/Library/Android/sdk/platform-tools/adb"
"$ADB" shell am force-stop com.paytrack.app
"$ADB" shell monkey -p com.paytrack.app -c android.intent.category.LAUNCHER 1
```

After the blank screen appears, press `Ctrl+C` in Terminal 1. Search the saved
logs for likely errors:

```sh
grep -iE 'paytrack|chromium|webview|AndroidRuntime|ReactNativeJS|ERR_|exception|fatal|error' \
  "$HOME/Desktop/paytrack-log.txt" | tail -n 100
```

If that prints nothing, check the end of the unfiltered log instead:

```sh
tail -n 200 "$HOME/Desktop/paytrack-log.txt"
```

Share the matching error lines, or the last 200 lines if there were no matches.
The app renders its UI in a WebView, so JavaScript console errors might not
appear in `logcat`.

## Important: the APK uses the local web server

`EXPO_PUBLIC_WEB_APP_URL` is used only by Expo Go during development. Release APKs
load the web UI bundled at `android/app/src/main/assets/webapp/` and ignore that
development URL. The mobile build embeds its styles and JavaScript in the HTML
so the WebView does not need to load separate assets from local `file://` URLs.
Whenever you change the web UI, run `npm run build:mobile` and
`npx expo prebuild --platform android` again before rebuilding the APK so the
latest files are copied into the app.

This local release build uses the generated Android debug signing key. It is
suitable for local installation and testing, but not for publishing to Google
Play. A Play Store release needs a private release signing key and a stable
hosted web-app URL.
