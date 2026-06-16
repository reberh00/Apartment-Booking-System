# Apartmani — Web aplikacija za upravljanje apartmanima

## Tehnologije

| Sloj          | Tehnologija                   |
| ------------- | ----------------------------- |
| Frontend      | React, JavaScript, Vite       |
| Backend       | Node.js, Express              |
| Baza          | PostgreSQL                    |
| ORM           | Prisma                        |
| Auth          | JWT (jsonwebtoken + bcryptjs) |
| Validacija    | Zod                           |
| Kontejneri    | Docker, Docker Compose        |
| Verzioniranje | Git                           |

## Pokretanje (lokalno bez Dockera)

### Preduvjeti

- Node.js 20+
- PostgreSQL 15+

### 1. Kloniraj i instaliraj

git clone <repo-url>
cd backend
npm install

### 2. Postavi varijable okruženja

cp .env.example .env

# Uredi .env i postavi DATABASE_URL i JWT_SECRET

### 3. Inicijaliziraj bazu i pokreni migracije

npx prisma migrate dev --name init
npm run db:seed

### 4. Pokreni server

npm run dev # razvoj (nodemon, hot-reload)
npm start # produkcija

Server radi na: `http://localhost:3000`

---

## Pokretanje s Dockerom

# Pokreni sve servise (baza + backend + frontend)

docker compose up -d

# Provjeri logove

docker compose logs -f backend

# Zaustavi

docker compose down

---

## API Endpoints

### Autentikacija

| Metoda | Ruta               | Opis                          |
| ------ | ------------------ | ----------------------------- |
| POST   | /api/auth/register | Registracija                  |
| POST   | /api/auth/login    | Prijava → JWT token           |
| GET    | /api/auth/me       | Podaci prijavljenog korisnika |

### Apartmani

| Metoda | Ruta                       | Uloga | Opis                      |
| ------ | -------------------------- | ----- | ------------------------- |
| GET    | /api/apartments            | Javno | Pretraživanje s filterima |
| GET    | /api/apartments/:id        | Javno | Detalji apartmana         |
| POST   | /api/apartments            | OWNER | Kreiraj apartman          |
| PUT    | /api/apartments/:id        | OWNER | Ažuriraj apartman         |
| DELETE | /api/apartments/:id        | OWNER | Obriši apartman           |
| GET    | /api/apartments/owner/mine | OWNER | Vlasnikovi apartmani      |

### Rezervacije

| Metoda | Ruta                                 | Uloga | Opis                   |
| ------ | ------------------------------------ | ----- | ---------------------- |
| GET    | /api/reservations/my                 | Auth  | Gostove rezervacije    |
| GET    | /api/reservations/owner              | OWNER | Vlasnikove rezervacije |
| POST   | /api/reservations                    | Auth  | Nova rezervacija       |
| PATCH  | /api/reservations/:id/status         | Auth  | Potvrdi/odbij/otkaži   |
| GET    | /api/reservations/check-availability | Javno | Provjera dostupnosti   |

### Ostalo

| Metoda | Ruta                             | Opis                           |
| ------ | -------------------------------- | ------------------------------ |
| POST   | /api/reviews                     | Nova recenzija                 |
| PATCH  | /api/reviews/:id/reply           | Vlasnikov odgovor na recenziju |
| GET    | /api/messages/:reservationId     | Dohvati poruke                 |
| POST   | /api/messages                    | Pošalji poruku                 |
| GET    | /api/notifications               | Obavijesti korisnika           |
| GET    | /api/analytics/owner             | Statistika za vlasnika         |
| GET    | /api/admin/apartments            | Admin: svi apartmani           |
| PATCH  | /api/admin/apartments/:id/status | Admin: odobri/odbij oglas      |

---

## Vizualni pregled baze

npx prisma studio

# Otvara web sučelje na http://localhost:5555

---
