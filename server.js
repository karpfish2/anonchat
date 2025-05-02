// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Хранение сообщений в памяти (максимум 100)
const messages = [];
const MAX_MESSAGES = 100;

// Хранение информации о печатающих пользователях
const typingUsers = new Map();

// Генерация временного имени пользователя
function generateGuestName() {
  return `Гость-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Отправка сообщений всем подключенным клиентам
function broadcast(data) {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Обработка WebSocket подключений
wss.on('connection', (ws) => {
  // Присвоение случайного имени
  const username = generateGuestName();
  ws.username = username;
  
  console.log(`${username} подключился`);
  
  // Отправка истории сообщений новому пользователю
  ws.send(JSON.stringify({
    type: 'history',
    messages: messages,
    username: username
  }));
  
  // Обработка сообщений от клиента
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    if (msg.type === 'chat') {
      // Создание нового сообщения
      const newMessage = {
        username: ws.username,
        text: msg.text,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      
      // Добавление сообщения в историю
      messages.push(newMessage);
      if (messages.length > MAX_MESSAGES) {
        messages.shift();
      }
      
      // Отправка всем клиентам
      broadcast({
        type: 'message',
        message: newMessage
      });
      
      // Сбросить статус печати
      if (typingUsers.has(ws.username)) {
        typingUsers.delete(ws.username);
        broadcast({
          type: 'typing',
          users: Array.from(typingUsers.keys())
        });
      }
    } else if (msg.type === 'typing') {
      if (msg.isTyping) {
        typingUsers.set(ws.username, true);
      } else {
        typingUsers.delete(ws.username);
      }
      
      broadcast({
        type: 'typing',
        users: Array.from(typingUsers.keys())
      });
    }
  });
  
  // Обработка отключения
  ws.on('close', () => {
    console.log(`${ws.username} отключился`);
    
    // Удаление из списка печатающих
    if (typingUsers.has(ws.username)) {
      typingUsers.delete(ws.username);
      broadcast({
        type: 'typing',
        users: Array.from(typingUsers.keys())
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});