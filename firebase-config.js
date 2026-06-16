// firebase-config.js
// Настройки Firebase (замените на свои реальные данные)
// Для использования Firebase SDK в Chrome Extension V3 лучше использовать модульный подход 
// или загружать нужные скрипты локально.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// В зависимости от того, как вы подключите SDK (npm, локальные файлы),
// экспорт конфига может отличаться.
export default firebaseConfig;
