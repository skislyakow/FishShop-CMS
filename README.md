# FishShop CMS — бэкенд магазина рыбы

<p align="center">
  <img alt="Strapi 5" src="https://img.shields.io/badge/Strapi%205-4945FF?style=for-the-badge&logo=strapi&logoColor=white">
  <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js%2020%2B-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white">
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

Планы: `Order` и `OrderItem` — оформление заказа со снимком цены на момент покупки.

## Быстрый старт

Нужны Node.js 20–26 и npm.

```bash
npm run setup                  # npm ci в cms/ + skills для агентов
cp cms/.env.example cms/.env   # заполнить секреты, см. docs/SETUP.md
cd cms && npm run develop      # http://localhost:1337
```

В админке создай локального администратора и API-токен (**Settings → API Tokens**, тип
**Full access**, срок Unlimited) — его получает бот. Без токена бот сможет только читать каталог.

## Данные и бэкапы

Записи и медиа синхронизируются между машинами архивами `strapi export` / `strapi import`;
`cms/.tmp/data.db` и `backups/` в git не попадают.

```bash
npm run db:snapshot   # backups/strapi-export.tar.gz
npm run db:import     # заменить локальные данные архивом
```

Подробности — [docs/DB-SYNC.md](docs/DB-SYNC.md).

## Репозитории проекта

- **FishShop CMS** (этот репозиторий) — Strapi, схема данных, API и проектная документация.
- **[FishShop](https://github.com/skislyakow/FishShop)** — Telegram-бот на Python:
  каталог, карточки, корзина, сбор контакта покупателя.

## Документация

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — компоненты, модель данных, работа с API
- [docs/SETUP.md](docs/SETUP.md) — подготовка окружения по шагам
- [docs/WORKFLOW.md](docs/WORKFLOW.md) — работа на двух машинах, ветки и коммиты
- [docs/adr/](docs/adr/) — архитектурные решения
- [GLOSSARY.md](GLOSSARY.md) — словарь предметной области
