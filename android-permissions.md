# Android Permissions for USSD Automation

After syncing the Android project, you'll need to add these permissions to `android/app/src/main/AndroidManifest.xml`:

## Required Permissions

Add these permissions inside the `<manifest>` tag:

```xml
<!-- Phone and USSD permissions -->
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_NUMBERS" />
<uses-permission android:name="android.permission.PROCESS_OUTGOING_CALLS" />

<!-- Accessibility service for USSD automation -->
<uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />

<!-- Network state -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- SIM card access -->
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
```

## Setup Instructions

1. **Export to GitHub**: Click "Export to GitHub" button in Lovable
2. **Clone the project**: `git clone your-repo-url`
3. **Install dependencies**: `npm install`
4. **Build the project**: `npm run build`
5. **Add Android platform**: `npx cap add android`
6. **Update Android**: `npx cap update android`
7. **Sync project**: `npx cap sync`
8. **Add permissions**: Edit `android/app/src/main/AndroidManifest.xml` and add the permissions above
9. **Open in Android Studio**: `npx cap open android`
10. **Run the app**: Use Android Studio or `npx cap run android`

## Runtime Permissions

For Android 6.0+, you'll need to request permissions at runtime. Add this code when executing USSD:

```typescript
import { Capacitor } from '@capacitor/core';

// Check if running on native platform
if (Capacitor.isNativePlatform()) {
  // Request phone permissions
  // You'll need to implement permission checking logic
}
```

## Important Notes

- USSD functionality requires real device testing (won't work in emulator)
- User must grant phone and accessibility permissions
- Accessibility service needs to be enabled in device settings
- Some carriers may block automated USSD access
