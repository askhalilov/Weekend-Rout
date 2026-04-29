# Деплой на GitHub Pages через GitHub Actions

## 1. Загрузить проект в GitHub

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## 2. Включить GitHub Pages

В репозитории откройте:

Settings → Pages → Build and deployment → Source → GitHub Actions

После следующего push GitHub Actions соберёт проект и опубликует папку `dist`.

## 3. Где будет сайт

Обычно адрес будет таким:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

Если репозиторий называется `YOUR_USERNAME.github.io`, адрес будет:

```text
https://YOUR_USERNAME.github.io/
```

## 4. Команды для локальной проверки

```bash
npm install
npm run build
npm run preview
```
