// content.js

function createPasteButton() {
  // Проверяем, нет ли уже кнопки, чтобы не дублировать
  if (document.getElementById('ainur-paste-btn')) return;

  // Создание плавающей кнопки
  const btn = document.createElement('button');
  btn.id = 'ainur-paste-btn';
  btn.innerHTML = '📋 Вставить товары';
  btn.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    z-index: 99999;
    padding: 15px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    cursor: pointer;
    font-family: sans-serif;
  `;

  document.body.appendChild(btn);

  btn.addEventListener('click', async () => {
    try {
      // Запрашиваем текст из буфера обмена
      const text = await navigator.clipboard.readText();
      
      if (!text) {
        alert('Буфер обмена пуст!');
        return;
      }

      // Создаем объект DataTransfer для эмуляции буфера
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', text);

      // Формируем событие paste
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      });

      // Определяем элемент, куда будет отправлено событие
      // По умолчанию это активный элемент (куда установлен фокус)
      let targetElement = document.activeElement;
      
      // Если фокус на body или не установлен, отправляем на document или конкретный div, 
      // перехватывающий вставку в AinurPOS
      if (!targetElement || targetElement === document.body) {
         targetElement = document; // AinurPOS может слушать document
      }
      
      // Инициируем событие
      targetElement.dispatchEvent(pasteEvent);

      // Успешная вставка, отправляем лог
      logSuccess(text.length);

    } catch (err) {
      console.error('Ошибка вставки: ', err);
      alert('Не удалось прочитать буфер обмена. Возможно, не дано разрешение.');
    }
  });
}

function logSuccess(textLength) {
  // Отправляем сообщение в background script для работы с Firebase
  chrome.runtime.sendMessage({
    action: 'logPaste',
    payload: {
      timestamp: Date.now(),
      textLength: textLength,
      status: 'success'
    }
  });
}

// Проверяем URL и добавляем/удаляем кнопку раз в секунду.
// Это решает проблему с SPA (Single Page Application) и кэшированием в мобильных браузерах.
setInterval(() => {
  const currentUrl = window.location.href.toLowerCase();
  // Кнопка будет показываться на страницах закупки и импорта
  const isTargetPage = currentUrl.includes('/purchase') || currentUrl.includes('/import');
  const existingBtn = document.getElementById('ainur-paste-btn');

  if (isTargetPage && !existingBtn) {
    createPasteButton();
  } else if (!isTargetPage && existingBtn) {
    existingBtn.remove();
  }
}, 1000);
