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
- **Jarek** - hasło: `Br0dnw0sk1!`
- **Paulina** - hasło: `Br0dnowsk2!`

## Dostępne skrypty
```bash
npm start        # Uruchom serwer
npm run dev      # Uruchom z nodemon
```

## API Endpoints
- `POST /api/register` - Rejestracja (walidacja hasła: min 10 znaków, duża litera, cyfra, znak specjalny)
- `POST /api/login` - Logowanie (rate limit: 5 prób/minutę)
- `POST /api/change-password` - Zmiana hasła (wymaga stare hasło)
- `GET /api/tasks` - Pobierz zadania (wymaga token)
- `POST /api/tasks` - Dodaj zadanie (wymaga token)
- `PATCH /api/tasks/:id` - Oznacz jako wykonane (wymaga token)
- `DELETE /api/tasks/:id` - Usuń zadanie (wymaga token)

## Bezpieczeństwo
- **Rate limiting**: 100 żądań/15min, 5 prób logowania/minutę, 3 rejestracje/godzinę
- **Walidacja hasła**: Min 10 znaków, wielkie/małe litery, cyfra, znak specjalny
- **HTTPS**: Wymagane na produkcji
- **JWT**: Tokeny ważne 7 dni

## Deployment
- Platforma: Render
- Blueprint: `render.yaml`
- Baza: PostgreSQL (centrum-db)

---

## 📝 Workflow - Wnioski i Porady

### Ograniczenia Claude Code
- **Nie mogę** bezpośrednio edytować plików bez wczytania ich najpierw (`Read` przed `Write`/`Edit`)
- **Bash** - preferuj dedykowane tools (Read, Edit, Write) zamiast echo/cat/sed
- **Edit tool** - tylko dla pojedynczych, unikalnych fragmentów kodu
- **Background shells** - używaj do serwerów dev, sprawdzaj `TaskOutput` aby zobaczyć wyniki
- **Plan mode** - aktywuj `EnterPlanMode` dla większych zmian wymagających planowania

### Typowe problemy i rozwiązania

1. **dotenv nie wczytuje zmiennych** → Dodaj `dotenv.config()` na początku każdego pliku, który używa `process.env`
2. **Port zajęty (EADDRINUSE)** → Zmień port w `.env` lub użyj `taskkill /F /IM node.exe` (Windows)
3. **Plik "nul" w Windows** → Usuń `rm -f nul` przed git commit
4. **Edit tool - duplicate content** → Użyj większego fragmentu jako `old_string` aby był unikalny
5. **Background process nie restartuje** → Zabij i uruchom ponownie, lub dotknij plik aby wymusić restart nodemon

### Next prompts - co dalej?

1. **Dodaj GUI do zmiany hasła** - użytkownicy powinni móc zmienić hasło przez interfejs, nie przez konsolę
2. **Kategorie zadań** - Praca, Dom, Zakupy, Zdrowie z kolorami
3. **Priorytety** - Wysoki/Średni/Niski z kolorami
4. **Daty/deadline** - Data wykonania zadania
5. **Powtarzalne zadania** - Codzienne, cotygodniowe (nawyki)
6. **Statystyki** - Ile zadań ukończonych, wykresy

### Przydatne komendy
```bash
# Zabicie wszystkich node procesów (Windows)
taskkill /F /IM node.exe

# Sprawdzenie co jest na porcie
netstat -ano | findstr :PORT

# Usunięcie artefaktu "nul" przed commit
rm -f nul 2>/dev/null

# Commit ze współautorem
git commit -m "msg" -m "Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```
