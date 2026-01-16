# Centrum - Life Organization App

## Opis projektu
Centrum to aplikacja do organizacji życia codziennego - zarządzanie zadaniami dla dwóch osób (Jarek i Paulina).

## 🚀 Produkcja
**URL**: https://centrum-6nxr.onrender.com/

## Tech Stack
- **Backend**: Node.js + Express
- **Baza danych**: PostgreSQL (Render)
- **Frontend**: HTML/CSS/JS
- **Autentykacja**: JWT + bcrypt (12 rund)

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

## Bezpieczeństwo
- Rate limiting: 100 żądań/15min, 5 prób logowania/minutę
- Walidacja hasła: Min 10 znaków, wielkie/małe litery, cyfra, znak specjalny
- Trust proxy dla Render reverse proxy

## Deployment
- Platforma: Render
- Blueprint: `render.yaml`
- Baza: PostgreSQL (centrum-db)

---

## 📝 Mój Workflow (Claude - Twój asystent)

### Zasady pracy
1. **Less commits, more building** - commity tylko na żądanie lub końiec sesji
2. **Pytaj o zgodę** przed dużymi zmianami
3. **Mów po polsku** - prosto, bez zbędnego słownictwa
4. **Skup się na funkcjonalności** - użytkownik chce budować, nie uczyć git

### Co już wiem o użytkowniku
- Preferuje szybkie tempo, mało "water talking"
- Amator w code - prostota ponad elegancję
- Chce gotowe rozwiązania, nie wykłady
- Ceni bezpieczeństwo (hasła, rate limiting)
- Workflow: planuj → buduj → potem commit

### Next prompts - co dalej budujemy?
1. **Kategorie zadań** - Praca, Dom, Zakupy, Zdrowie z kolorami
2. **Priorytety** - Wysoki/Średni/Niski z kolorami
3. **Daty/deadline** - Data wykonania zadania
4. **Powtarzalne zadania** - Codzienne, cotygodniowe (nawyki)
5. **GUI do zmiany hasła** - Bez konsoli F12
6. **Lepszy design** - Więcej kolorów, ikon
7. **Statystyki** - Ile zadań ukończonych

### Typowe problemy (naprawione)
- ~~dotenv nie wczytuje~~ - Dodane `dotenv.config()` w każdym pliku
- ~~Port zajęty~~ - Zmiana portu w .env
- ~~Plik "nul"~~ - Usuwanie przed commit
- ~~Rate limit na Render~~ - Dodane `trust proxy`
- ~~Zmiana hasła~~ - Endpoint `/api/reset-password`

### Przydatne komendy
```bash
# Zabicie node (Windows)
taskkill /F /IM node.exe

# Usunięcie "nul" przed commit
rm -f nul 2>/dev/null

# Commit
git add . && git commit -m "msg" && git push
```

### Sekrety (tylko dla właściciela!)
- **RESET_SECRET**: `5970ff7c795f534228acdf243b55da29` (na Render)
- Szybki reset hasła: `POST /api/reset-password` z `{username, secretKey, newPassword}`
