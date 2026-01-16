# Centrum - Life Organization App

## Opis projektu
Centrum to aplikacja do organizacji życia codziennego - zarządzanie zadaniami dla dwóch osób (Jarek i Paulina).

## 🚀 Produkcja
**URL**: https://centrum-6nxr.onrender.com/
**PWA**: Instalowalna jako aplikacja na telefonie

## Tech Stack
- **Backend**: Node.js + Express
- **Baza danych**: PostgreSQL (Render)
- **Frontend**: HTML/CSS/JS (mobile-first)
- **Autentykacja**: JWT + bcrypt (12 rund)
- **PWA**: Manifest + service worker ready

## Użytkownicy
- **Jarek** - hasło: `JarekNowe2025!`
- **Paulina** - hasło: `PaulinaNowe2025!`

## API Endpoints
- `POST /api/register` - Rejestracja (walidacja hasła)
- `POST /api/login` - Logowanie (rate limit: 5 prób/minutę)
- `POST /api/change-password` - Zmiana hasła (wymaga stare hasło)
- `POST /api/reset-password` - Reset hasła (wymaga RESET_SECRET)
- `GET /api/tasks` - Pobierz zadania
- `POST /api/tasks` - Dodaj zadanie
- `PATCH /api/tasks/:id` - Oznacz jako wykonane
- `DELETE /api/tasks/:id` - Usuń zadanie

## Design
- **Kolorystyka**: Biało-zielona (#22c55e)
- **Styl**: Kanciasty (border-radius: 8px)
- **Mobile-first**: Zoptymalizowane pod telefon
- **Animacje**: Płynne przejścia, loading spinery
- **PWA**: Ikona 512x512, instalowalna

## Bezpieczeństwo
- Rate limiting: 100 żądań/15min, 5 prób logowania/minutę
- Walidacja hasła: Min 10 znaków, wielkie/małe litery, cyfra, znak specjalny
- Trust proxy dla Render reverse proxy
- Helmet.js - nagłówki bezpieczeństwa
- CORS ograniczony do domeny produkcyjnej
- Limit body: 1MB
- XSS protection (escapeHtml)

## Deployment
- Platforma: Render
- Blueprint: `render.yaml`
- Baza: PostgreSQL (centrum-db)

---

## 📝 Mój Workflow (Claude - Twój asystent)

### Zasady pracy
1. **Less commits, more building** - commity rzadziej, więcej budowania
2. **Pytaj o zgodę** przed dużymi zmianami
3. **Mów po polsku** - prosto, bez zbędnego słownictwa
4. **Skup się na funkcjonalności** - użytkownik chce budować, nie uczyć git

### Co już wiem o użytkowniku
- Preferuje szybkie tempo, mało "water talking"
- Amator w code - prostota ponad elegancją
- Chce gotowe rozwiązania, nie wykłady
- Ceni bezpieczeństwo (hasła, rate limiting)
- Workflow: planuj → buduj → potem commit
- **Głównie korzysta z telefonu** - mobile-first design!
- **Lubi biało-zieloną kolorystykę** i kanciaste style

### Co już zrobiliśmy ✅
- ~~Mobile-first responsive design~~
- ~~PWA - instalowalna jako aplikacja~~
- ~~Biało-zielona kolorystyka~~
- ~~Kanciaste UI~~
- ~~Płynne animacje~~
- ~~Przycisk instalacji PWA~~
- ~~Ikona 512x512 PNG~~
- ~~Zabezpieczenia (helmet, CORS, limity)~~

### Next prompts - co dalej budujemy?
1. **Kategorie zadań** - Praca, Dom, Zakupy, Zdrowie z kolorami
2. **Priorytety** - Wysoki/Średni/Niski z kolorami
3. **Daty/deadline** - Data wykonania zadania
4. **Powtarzalne zadania** - Codzienne, cotygodniowe (nawyki)
5. **GUI do zmiany hasła** - Bez konsoli F12
6. **Statystyki** - Ile zadań ukończonych

### Typowe problemy (naprawione)
- ~~dotenv nie wczytuje~~ - Dodane `dotenv.config()` w każdym pliku
- ~~Port zajęty~~ - Zmiana portu w .env
- ~~Plik "nul"~~ - Usuwanie przed commit
- ~~Rate limit na Render~~ - Dodane `trust proxy`
- ~~Zmiana hasła~~ - Endpoint `/api/reset-password`
- ~~Blur ikony PWA~~ - Zrobiono icon.png 512x512

### Przydatne komendy
```bash
# Zabicie node (Windows)
taskkill /F /IM node.exe

# Usunięcie "nul" przed commit
rm -f nul 2>/dev/null

# Commit
git add . && git commit -m "msg" && git push
```

### Sekrety (tylko dla właścicieli!)
- **RESET_SECRET**: `5970ff7c795f534228acdf243b55da29` (na Render)
- Szybki reset hasła: `POST /api/reset-password` z `{username, secretKey, newPassword}`
