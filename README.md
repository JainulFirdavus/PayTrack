# PayTrack

PayTrack is a web app with an Expo Android shell. The Expo app opens the web UI in a
WebView, so the mobile interface uses the same components and `src/themes/zyric.css`
as the browser app.

## Requirements

- Node.js and npm
- macOS with Homebrew
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

The Expo WebView needs the Vite web app to be running and reachable on the local
network. Set `EXPO_PUBLIC_WEB_APP_URL` in the ignored `.env.local` file to this
computer's Wi-Fi IP address:

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

## Build an Android APK

The Android project is generated from Expo configuration. Generate it if the
`android/` directory is missing:

```sh
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

## Important: the APK uses the local web server

The APK loads the address configured by `EXPO_PUBLIC_WEB_APP_URL`; it does not
include a copy of the web app. To use it, keep the Vite server running, keep the
phone and computer on the same Wi-Fi, and make sure the computer's IP address in
`.env.local` is still correct. If the IP changes, update `.env.local` and rebuild
the APK.

This local release build uses the generated Android debug signing key. It is
suitable for local installation and testing, but not for publishing to Google
Play. A Play Store release needs a private release signing key and a stable
hosted web-app URL.
