#!/usr/bin/env node
// Кроссплатформенный бутстрап окружения FishShop CMS.
//
// Ставит зависимости Strapi и личные skills агента:
//   - skills -> .agents/skills (из skills-lock.json; в git их нет)
//   - cms    -> node_modules   (npm ci)
//
// Запуск:
//   npm run setup          # dev-окружение
//   npm run setup:prod     # сервер/CI: без skills
//   node scripts/bootstrap.mjs --help
//   node scripts/bootstrap.mjs --no-skills --no-cms
//
// Подробности: docs/SETUP.md

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = new Set(process.argv.slice(2));

if (argv.has('--help') || argv.has('-h')) {
  printHelp();
  process.exit(0);
}

const opts = {
  skills: !argv.has('--no-skills'),
  cms: !argv.has('--no-cms'),
};

const SKILLS_DIR = join(ROOT, '.agents', 'skills');
const CMS_DIR = join(ROOT, 'cms');

console.log('FishShop CMS: подготовка окружения');
console.log(`  каталог: ${ROOT}`);

checkNodeVersion();

let failed = false;
if (opts.skills) failed = !runSkills() || failed;
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
  --no-skills   не восстанавливать skills (.agents/skills)
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

function isNonEmptyDir(dir) {
  try {
    return existsSync(dir) && readdirSync(dir).length > 0;
  } catch {
    return false;
  }
}

function runSkills() {
  console.log('\n> skills');
  if (isNonEmptyDir(SKILLS_DIR)) {
    console.log('  уже установлены — пропускаю (.agents/skills вне git).');
    return true;
  }
  return run('npx -y skills@latest experimental_install');
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
