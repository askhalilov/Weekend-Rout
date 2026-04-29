# Простой backend для сдачи проекта

В проект добавлен минимальный backend без сторонних зависимостей. Он работает на встроенном модуле Node.js `http`, хранит данные в JSON-файле и подходит для демонстрации API на защите.

## Запуск frontend + backend одновременно

```bash
npm install
npm run dev:full
```

Frontend откроется на Vite-порту, backend будет доступен по адресу:

```text
http://localhost:3001
```

## Запуск только backend

```bash
npm run server
```

## Проверка

Откройте в браузере:

```text
http://localhost:3001/api/health
```

Должен вернуться ответ:

```json
{
  "status": "ok",
  "service": "weekend-route-api",
  "version": "1.0.0"
}
```

## API

### Места маршрута

```text
GET /api/places
GET /api/places?q=кремль
GET /api/places?category=Архитектура
GET /api/places/1
```

### Кафе, отдых, рестораны и сервисные точки

```text
GET /api/services
GET /api/services?near=1
GET /api/services?kind=Кафе
```

### Журнал

```text
GET /api/articles
```

### Сохранённые маршруты

```text
GET /api/routes
POST /api/routes
GET /api/routes/:id
DELETE /api/routes/:id
```

Пример создания маршрута для Windows PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/routes -ContentType "application/json" -Body '{"name":"Маршрут на субботу","placeIds":[1,8,5],"transport":"metro","mood":"photo"}'
```

Пример для macOS/Linux:

```bash
curl -X POST http://localhost:3001/api/routes \
  -H "Content-Type: application/json" \
  -d '{"name":"Маршрут на субботу","placeIds":[1,8,5],"transport":"metro","mood":"photo"}'
```

### Обратная связь

```text
POST /api/feedback
```

Пример тела запроса:

```json
{
  "name": "Анна",
  "message": "Хочу маршрут на вечернюю Москву"
}
```

## Где лежат данные

```text
server/data/db.json
```

Там можно редактировать места, сервисные точки, статьи и сохранённые маршруты.

## Что можно сказать на сдаче

В проекте есть frontend на Vue + Vite и простой backend на Node.js. Backend предоставляет REST API для достопримечательностей, сервисных мест, журнала, сохранения пользовательских маршрутов и обратной связи. Данные сохраняются в локальный JSON-файл, поэтому проект можно запустить без отдельной базы данных.
