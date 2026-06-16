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
    left: 50%;
    transform: translateX(-50%);
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
    transition: background-color 0.1s, transform 0.1s;
    white-space: nowrap;
  `;

  document.body.appendChild(btn);

  // Предотвращаем потерю фокуса активного элемента и добавляем эффект нажатия
  const pressBtn = (e) => {
    if (e) e.preventDefault();
    btn.style.transform = 'translateX(-50%) scale(0.95)';
    btn.style.backgroundColor = '#0056b3';
  };
  const releaseBtn = () => {
    btn.style.transform = 'translateX(-50%) scale(1)';
    btn.style.backgroundColor = '#007bff';
  };

  btn.addEventListener('mousedown', pressBtn);
  btn.addEventListener('touchstart', pressBtn, { passive: false });
  
  btn.addEventListener('mouseup', releaseBtn);
  btn.addEventListener('mouseleave', releaseBtn);
  let isPasting = false;

  const executePaste = async (e) => {
    if (e) e.preventDefault();
    if (isPasting) return;
    isPasting = true;
    
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
      
      // Если активный элемент - это iframe (как на странице импорта), заходим внутрь него
      if (targetElement && targetElement.tagName && targetElement.tagName.toLowerCase() === 'iframe') {
        try {
           const iframeDoc = targetElement.contentDocument || targetElement.contentWindow.document;
           if (iframeDoc) {
             // Ищем скрытое поле Handsontable внутри iframe
             const hotInput = iframeDoc.querySelector('textarea.handsontableInput');
             if (hotInput) {
                targetElement = hotInput;
             } else {
                targetElement = iframeDoc.activeElement || iframeDoc.body || iframeDoc;
             }
           }
        } catch(e) {
           console.warn('Не удалось получить доступ к содержимому iframe: ', e);
        }
      } else if (!targetElement || targetElement === document.body || targetElement === btn) {
         // Если мы не в iframe, ищем скрытое поле в основном документе
         const hotInput = document.querySelector('textarea.handsontableInput');
         if (hotInput) {
            targetElement = hotInput;
         } else {
            targetElement = document; // AinurPOS может слушать document
         }
      }
      
      // Инициируем событие
      targetElement.dispatchEvent(pasteEvent);

      // Успешная вставка, отправляем лог
      logSuccess(text.length);

    } catch (err) {
      console.error('Ошибка вставки: ', err);
      alert('Не удалось прочитать буфер обмена. Возможно, не дано разрешение.');
    } finally {
      setTimeout(() => {
        isPasting = false;
      }, 300);
    }
  };

  btn.addEventListener('touchend', (e) => {
    releaseBtn();
    executePaste(e);
  });

  btn.addEventListener('click', executePaste);
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
