# 📋 Client Tracker

> Простой трекер клиентов. Добавление, статусы, заметки, Telegram-уведомления.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-22%20passed-brightgreen)](#-тесты)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](#-деплой)

---

## ✨ Что умеет

- 📋 **CRUD клиентов** — добавление, редактирование, удаление
- 📊 **Статусы дел** — Новый / В работе / Закрыт
- 🔍 **Фильтрация** — по статусу через URL params
- 📝 **Заметки** — произвольный текст у каждого клиента
- 🔔 **Telegram** — уведомления при добавлении клиента
- 🛡️ **Дубликаты** — проверка по имени + телефону
- 🧹 **Очистка БД** — с двухэтапным подтверждением
- ⚙️ **Настройки** — Telegram токен и Chat ID через UI

## 🛠 Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 16 (App Router), React 19 |
| Backend | REST API (`/api/*`), Server Actions |
| БД | SQLite + Prisma 6 |
| UI | Tailwind CSS 4, CSS-переменные |
| Тесты | Vitest + Testing Library |
| Деплой | Docker (Node.js 24 Alpine) |

## 🚀 Быстрый старт

```bash
# Клонировать
git clone git@github.com:AVP-Dev/client-tracker.git
cd client-tracker

# Установить зависимости
npm install

# Инициализировать БД
npx prisma migrate dev --name init

# Запустить
npm run dev
```

Откройте **http://localhost:3000**

## ⚙️ Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Путь к SQLite базе |

> **Telegram** настраивается через UI приложения после запуска. Все данные хранятся в БД.

## 🐳 Деплой

### Coolify (рекомендуется)

1. **Build Pack**: `Dockerfile`
2. **Environment**: `DATABASE_URL=file:/app/prisma/dev.db`
3. **Volume**: Mount Path `/app/prisma`
4. **Deploy**

### Docker

```bash
docker build -t client-tracker .
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="file:/app/prisma/dev.db" \
  -v crm-data:/app/prisma \
  --name client-tracker \
  client-tracker
```

### Docker Compose

```bash
docker compose up -d
```

## 📁 Структура

```
client-tracker/
├── app/
│   ├── api/
│   │   ├── clients/route.ts    # CRUD клиентов
│   │   ├── settings/route.ts   # Telegram настройки
│   │   ├── counts/route.ts     # Счётчики по статусам
│   │   └── clear/route.ts      # Очистка БД
│   ├── page.tsx                # Главная страница
│   ├── layout.tsx              # Layout
│   └── globals.css             # Стили + design tokens
├── components/
│   ├── ClientForm.tsx          # Форма добавления
│   ├── ClientTable.tsx         # Таблица + dropdown
│   ├── StatusCounters.tsx      # Карточки статусов
│   ├── SettingsForm.tsx        # Настройки Telegram
│   └── ClearDatabaseButton.tsx # Очистка БД
├── actions/
│   └── clients.ts              # Server Actions
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   └── telegram.ts             # Telegram API
├── prisma/
│   └── schema.prisma           # Схема БД
├── tests/                      # Юнит-тесты
├── Dockerfile                  # Multi-stage сборка
├── docker-compose.yml          # Локальный запуск
└── entrypoint.sh               # Миграции + запуск
```

## 🧪 Тесты

```bash
npm test            # Запуск
npm run test:watch  # Watch mode
```

**22 теста** покрывают:
- Server Actions — валидация, создание, обновление
- Components — рендеринг, accessibility

## 🏗 Архитектурные решения

| Решение | Почему |
|---|---|
| SQLite + Prisma | Простейшая БД для прототипа, без внешних сервисов |
| REST API routes | Мутации через fetch + onClick, без form actions |
| CSS-переменные | Дизайн-система без библиотек |
| Telegram через UI | Токены в БД, не в env — удобно менять без деплоя |
| Docker standalone | Минимальный образ, миграции при старте |

## 🔐 Безопасность

- Нет авторизации (прототип)
- Нет мультипользовательности
- Данные в SQLite — ephemeral на Vercel, persistent в Docker с volume

## 📄 Лицензия

MIT
