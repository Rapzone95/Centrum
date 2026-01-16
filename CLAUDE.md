# Centrum - Life Organization App

## Opis projektu
Centrum to aplikacja do organizacji życia codziennego - zarządzanie zadaniami dla dwóch osób (Jarek i Paulina).

## 🚀 Produkcja
**URL**: https://centrum-6nxr.onrender.com/

## Tech Stack
- **Backend**: Node.js + Express
- **Baza danych**: PostgreSQL (Render)
- **Frontend**: HTML/CSS/JS
- **Autentykacja**: JWT + bcrypt

## Struktura projektu
```
src/
├── server.js    # Główny plik serwera Express
├── db.js        # Konfiguracja PostgreSQL (pg.Pool)
└── auth.js      # Autentykacja (JWT, bcrypt)
public/          # Pliki frontendowe
```

## Użytkownicy
- **Jarek** - hasło: `Jarek2025`
- **Paulina** - hasło: `Paulina2025`

## Dostępne skrypty
```bash
npm start        # Uruchom serwer
npm run dev      # Uruchom z nodemon
```

## API Endpoints
- `POST /api/register` - Rejestracja użytkownika
- `POST /api/login` - Logowanie (zwraca token JWT)
- `GET /api/tasks` - Pobierz zadania (wymaga token)
- `POST /api/tasks` - Dodaj zadanie (wymaga token)
- `PATCH /api/tasks/:id` - Oznacz jako wykonane (wymaga token)
- `DELETE /api/tasks/:id` - Usuń zadanie (wymaga token)

## Deployment
- Platforma: Render
- Blueprint: `render.yaml`
- Baza: PostgreSQL (centrum-db)
