HomeServe Get Support page - installation

This ZIP contains the complete src folder with the support page integrated into the existing HomeServe Profile, Settings, and Notifications setup.

Files added:
- src/components/SupportPage.tsx
- src/components/support-page.css

Updated:
- src/components/UserDashboard.tsx

Installation:
1. Back up your current src folder.
2. Extract this ZIP.
3. Copy the included src folder into your HomeServe-main project and replace matching files.
4. Run npm run dev.
5. Click Get support in the left sidebar help card, or Get help in the dashboard, to open the new page.

The support form currently validates inputs and shows a demo confirmation only. It is not connected to a backend API, so requests are not actually sent or stored. Connect it to your Java/MySQL support endpoint when that API is ready.
