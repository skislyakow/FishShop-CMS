#!/usr/bin/env node
// Кроссплатформенный бутстрап окружения FishShop CMS.
//
// Ставит зависимости Strapi (npm ci в cms/) и готовит cms/.env из шаблона.
//
// Запуск:
//   npm run setup
//   node scripts/bootstrap.mjs --help
//   node scripts/bootstrap.mjs --no-cms
//
// Подробности: docs/SETUP.md

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = new Set(process.argv.slice(2));

if (argv.has('--help') || argv.has('-h')) {
  printHelp();
  process.exit(0);
}

const opts = {
  cms: !argv.has('--no-cms'),
};

const CMS_DIR = join(ROOT, 'cms');

console.log('FishShop CMS: подготовка окружения');
console.log(`  каталог: ${ROOT}`);

checkNodeVersion();

let failed = false;
if (opts.cms) failed = !runCms() || failed;

console.log('');
if (failed) {
  console.error('Не удалось подготовить окружение — смотри сообщения выше.');
  process.exit(1);
}
console.log('Готово. Strapi запускается из cms/: cd cms && npm run develop');

// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`FishShop CMS bootstrap

Usage: node scripts/bootstrap.mjs [options]

Options:
  --no-cms      не ставить зависимости Strapi
  -h, --help    показать эту справку

Нужен только Node.js: npm подтянется вместе с ним. Флаги передавай скрипту
напрямую, а не через npm — npm перехватывает свои --no-*.`);
}

function checkNodeVersion() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20 || major > 26) {
    console.warn(`Node ${process.versions.node}: Strapi 5 требует Node 20–26 (см. docs/SETUP.md).`);
  }
}

/** Запускает команду в shell (кроссплатформенно: npm/npx). */
function run(cmd, cwd = ROOT) {
  console.log(`\n$ ${cmd}`);
  const res = spawnSync(cmd, { cwd, stdio: 'inherit', shell: true });
  if (res.error) {
    console.error(`Не удалось запустить: ${cmd}\n  ${res.error.message}`);
    return false;
  }
  if (res.status !== 0) {
    console.error(`Команда завершилась с кодом ${res.status}: ${cmd}`);
    return false;
  }
  return true;
}

function runCms() {
  console.log('\n> cms (Strapi)');
  const env = join(CMS_DIR, '.env');
  const envExample = join(CMS_DIR, '.env.example');
  if (!existsSync(env) && existsSync(envExample)) {
    copyFileSync(envExample, env);
    console.log('  создан cms/.env из cms/.env.example — заполни секреты (docs/SETUP.md).');
  }
  const cmd = existsSync(join(CMS_DIR, 'package-lock.json')) ? 'npm ci' : 'npm install';
  return run(cmd, CMS_DIR);
}
