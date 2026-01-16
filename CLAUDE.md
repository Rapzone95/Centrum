# Centrum - Life Organization App

## Opis projektu
Centrum to aplikacja do organizacji życia codziennego - zarządzanie zadaniami, nawykami, notatkami i celami.

## Tech Stack
- **Backend**: Node.js + Express
- **Baza danych**: SQLite3
- **Frontend**: HTML/CSS/JS (public folder)

## Struktura projektu
```
src/
├── server.js    # Główny plik serwera Express
├── db.js        # Konfiguracja bazy danych SQLite
├── routes/      # Endpointy API
└── models/      # Modele bazy danych
public/          # Pliki frontendowe
```

## Dostępne skrypty
```bash
npm start        # Uruchom serwer
npm run dev      # Uruchom z nodemon
```

## TODO
- [ ] API - Zadania (Tasks)
- [ ] API - Nawyki (Habits)
- [ ] API - Notatki (Notes)
- [ ] API - Cele (Goals)
- [ ] Frontend UI
