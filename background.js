// background.js

// В Manifest V3 background скрипт работает как Service Worker.
// Если используется Firebase SDK, его необходимо импортировать.
// Для V3 рекомендуется скачивать firebase SDK локально или использовать бандлер (Webpack/Vite).

import firebaseConfig from './firebase-config.js';
// Пример импорта модульного SDK, если он установлен (псевдокод):
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, addDoc } from 'firebase/firestore';
// import { getAuth, signInAnonymously } from 'firebase/auth';

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logPaste') {
    const data = request.payload;
    console.log('Попытка логирования в Firebase:', data);
    
    // Пример логики авторизации и записи в Firestore:
    /*
    signInAnonymously(auth).then(({ user }) => {
       addDoc(collection(db, "pastes_history"), {
         userId: user.uid,
         url: sender.tab ? sender.tab.url : 'unknown',
         ...data
       }).then(() => {
         console.log('Лог успешно записан!');
       }).catch(err => {
         console.error('Ошибка записи в БД:', err);
       });
    }).catch(err => {
       console.error('Ошибка авторизации:', err);
    });
    */
    
    // Возвращаем ответ
    sendResponse({ success: true, message: 'Лог получен background скриптом' });
  }
  
  // Возвращаем true, если sendResponse будет вызван асинхронно
  return true; 
});
