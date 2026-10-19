# FishShop CMS — бэкенд магазина рыбы

<p align="center">
  <img alt="Strapi 5" src="https://img.shields.io/badge/Strapi%205-4945FF?style=for-the-badge&logo=strapi&logoColor=white">
  <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js%2020%2B-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="npm" src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white">
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge"></a>
</p>

**FishShop CMS** — headless-бэкенд магазина морепродуктов в Telegram: каталог рыбы, корзины
покупателей и их контакты. Strapi отдаёт всё это по REST API, а Telegram-бот работает тонким
клиентом — код бота живёт в отдельном репозитории.

## Модель данных

| Content-Type | UID | Что хранит |
| --- | --- | --- |
| Товар | `api::fish.fish` | название, описание, цену за кг и фото |
| Корзина | `api::cart.cart` | корзину пользователя Telegram (`telegram_user_id`, unique) |
| Позиция корзины | `api::cart-item.cart-item` | ссылки на корзину и товар, количество в кг |
| Покупатель | `api::customer.customer` | `telegram_user_id` (unique) и почту |

## API

- База: `http://localhost:1337/api`.
- Авторизация: API-токен в заголовке `Authorization: Bearer <token>`.
- `draftAndPublish` включён только у товаров: бот видит лишь опубликованные записи. У корзин,
  позиций и покупателей он выключен — это рабочие данные, а не контент для редактора.
- Токен создаётся в админке (**Settings → API Tokens**). Для чтения каталога достаточно типа
  **Read-only**, для работы с корзиной и контактами нужен **Full access**.

## Быстрый старт

Нужны Node.js 20–26 и npm.

```bash
npm run setup                  # npm ci в cms/
cp cms/.env.example cms/.env   # заполнить секреты
cd cms && npm run develop      # http://localhost:1337
```

`npm run setup` ставит зависимости и создаёт `cms/.env` из шаблона. Сгенерировать секреты для
него можно одной командой:

```bash
node -e "for (let i=0;i<4;i++) console.log(require('crypto').randomBytes(16).toString('base64'))"
```

Полученные значения вставь в `cms/.env`: `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`,
`TRANSFER_TOKEN_SALT` (при желании — `JWT_SECRET`, `ENCRYPTION_KEY`).

Открой <http://localhost:1337/admin> и создай локального администратора. Затем создай API-токен
(**Settings → API Tokens**), тип **Full access**, срок Unlimited — его получает бот.

### Режимы запуска

Все команды Strapi выполняются из каталога `cms/`.

| Команда | Что делает | Когда нужна |
| --- | --- | --- |
| `npm run develop` | dev-режим, пересобирает админку на лету | повседневная работа |
| `npm run build` | собирает админку в `build/` | перед `npm run start` (prod) |
| `npm run start` | prod-режим, без hot-reload | проверка прод-сборки |

Strapi останавливается по **Ctrl+C** в том терминале, где он запущен. Данные при этом не
теряются: админ-аккаунт и контент лежат в SQLite-файле `cms/.tmp/data.db`.

## Частые проблемы

**`EADDRINUSE: address already in use :::1337`** — порт занят другим процессом (обычно висит
предыдущий Strapi). Найди и заверши его:

```powershell
netstat -ano | findstr :1337      # PID — в последнем столбце
taskkill /PID <PID> /F
```

Либо запусти на другом порту: `PORT=1338 npm run develop` (переменная `PORT` в `cms/.env`).

**`npm error Missing script: "develop"`** — команда запущена не из `cms/`. Скрипты
`develop`/`build`/`start` живут в `cms/package.json`, поэтому сначала `cd cms`.

## Репозитории проекта

- **FishShop CMS** (этот репозиторий) — Strapi, схема данных и API.
- **[FishShop](https://github.com/skislyakow/FishShop)** — Telegram-бот на Python:
  каталог, карточки, корзина, сбор контакта покупателя.
