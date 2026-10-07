# TUMU TIGER — Maktaba ya Filamu (Movie Library Website)

Toleo hili la TUMU TIGER limejengwa kwa muundo wa **tabaka tatu (3-tier)** ulioombwa:

| Tabaka | Teknolojia | Folda |
|---|---|---|
| **Frontend** | HTML + CSS + JavaScript (static, halisi — hakuna framework) | `/frontend` |
| **Backend** | PHP (JSON REST API tu, haichapishi HTML isipokuwa `install.php`) | `/backend` |
| **Database** | MySQL | `/database` |

Frontend ni tovuti tuli (static site) inayowasiliana na backend kwa `fetch()` (JavaScript) kupitia API ya JSON. Backend haichanganyi HTML na PHP tena — ni "vichwa" vya JSON tu (`/backend/api/...`), isipokuwa `install.php` ambayo ni ukurasa wa kusakinisha mara moja tu.

---

## 1. Muundo wa Mradi (Project Structure)

```
tumutiger/
├── database/
│   └── schema.sql              # Muundo wa hifadhidata (majedwali: users, movies, requests)
│
├── backend/                    # PHP — API ya JSON
│   ├── install.php             # Kisakinishi (mara moja) — huunda DB + admin wa kwanza
│   ├── config/
│   │   └── config.php          # Linaundwa kiotomatiki na install.php (SIYO kwenye Git)
│   ├── includes/
│   │   ├── db.php              # Muunganisho wa PDO
│   │   ├── auth.php            # Session helpers (login/logout/require_role)
│   │   ├── cors.php            # CORS + majibu ya JSON
│   │   └── functions.php       # Vitendaji vya msaada (tracking code, cover upload, n.k.)
│   ├── api/
│   │   ├── auth/                # register, login, logout, me, forgot_find/verify/reset
│   │   ├── movies/               # list, get, create, update, delete
│   │   ├── requests/              # create, mine, track, admin_list, admin_get, admin_respond
│   │   ├── admins/                 # list, create  ← njia PEKEE ya kuongeza admin
│   │   ├── profile/                # update, change_password, update_security
│   │   └── stats/                   # customer, admin (takwimu za dashibodi)
│   └── uploads/covers/          # Vifuniko vya filamu vilivyopakiwa (folda inayoandikika)
│
└── frontend/                   # HTML + CSS + JS (static)
    ├── index.html               # Ukurasa wa mwanzo (landing page)
    ├── css/style.css            # Muundo mzima wa tovuti (brand ya TUMU TIGER)
    ├── js/
    │   ├── config.js            # Hugundua API_BASE na FRONTEND_BASE kiotomatiki
    │   ├── api.js                # fetch() wrapper (apiGet / apiPostJSON / apiPostForm)
    │   ├── ui.js                  # Vitendaji vya UI (alerts, badges, loadPartial, n.k.)
    │   ├── auth-guard.js           # Hulinda kurasa za paneli (requireAuth)
    │   ├── main.js                  # Nav toggle, live filter, n.k.
    │   └── pages/                    # JS maalum kwa kila ukurasa (index.js, login.js, ...)
    ├── partials/                # Vipande vinavyotumika tena (navbar, footer, sidebars)
    └── pages/
        ├── login.html / register.html / forgot-password.html
        ├── movie.html / inquiry.html / track.html
        ├── customer/  → dashboard.html, requests.html, profile.html
        └── admin/     → dashboard.html, requests.html, movies.html,
                          upload-movie.html, edit-movie.html, admins.html, profile.html
```

---

## 2. Jinsi Inavyofanya Kazi (How the pieces talk to each other)

1. Kila ukurasa wa `frontend/*.html` ni faili tuli — hauna PHP ndani yake.
2. `frontend/js/config.js` hugundua eneo la mradi kwa kuchunguza URL ya sasa, na kuunda:
   - `TT.API_BASE` → mfano `/backend/api`
   - `TT.FRONTEND_BASE` → mfano `/frontend`
3. Fomu zote (login, register, kuomba filamu, n.k.) hutumia `fetch()` (kupitia `js/api.js`) kutuma taarifa kwenda `backend/api/...` na kupokea JSON.
4. Uthibitisho (authentication) hutumia **PHP session cookie** — cookie inatunzwa na kivinjari na kutumwa kiotomatiki (`credentials: 'include'`), kwa hiyo huhitaji "login token" ya ziada.
5. Kurasa za paneli (`customer/`, `admin/`) huanza kwa kuita `requireAuth('customer')` au `requireAuth('admin')` — ikiwa hujaingia au huna ruhusa, unarudishwa kiotomatiki.

> **Muhimu:** Kwa sababu partials (`navbar.html`, `footer.html`, sidebars) hupakiwa kwa `fetch()`, frontend LAZIMA ihudumiwe na seva ya HTTP (Apache, Nginx, au `php -S` kwa majaribio) — SIYO kwa kufungua faili moja kwa moja kwenye kivinjari (`file://...`).

---

## 3. Jinsi ya Kusakinisha (Installation)

### Njia rahisi (frontend + backend kwenye domain moja — inapendekezwa)

1. Pakia folda nzima `tumutiger/` (yenye `frontend/`, `backend/`, `database/`) kwenye seva yako — mfano kwenye `public_html/`.
2. Hakikisha `backend/uploads/covers/` inaandikika (writable — chmod 755/775).
3. Fungua kivinjari: `https://domain-yako.com/backend/install.php`
4. Jaza taarifa za database na akaunti ya kwanza ya msimamizi (ona sehemu ya 4 hapa chini).
5. Baada ya kufaulu, fungua: `https://domain-yako.com/frontend/index.html`

Kwa kuwa frontend na backend zipo domain moja, session cookies zitafanya kazi moja kwa moja bila mipangilio ya ziada.

### Njia ya maendeleo ya ndani (local development, bandari tofauti)

Ikiwa unaendesha frontend na backend kwenye bandari (ports) tofauti wakati wa maendeleo (mfano `live-server` kwa frontend na `php -S` kwa backend), jaza uga wa **"Frontend Origin"** kwenye `install.php` (mfano `http://localhost:5500`) ili `ALLOWED_ORIGINS` iongezwe kwenye `config.php`, na cookies ziweze kufanya kazi kati ya bandari hizo mbili.

```bash
# Terminal 1 — backend
cd backend
php -S localhost:8000

# Terminal 2 — frontend
cd frontend
php -S localhost:5500
# (au tumia kiendeshi kingine chochote cha static files, mfano VSCode Live Server)
```

Kisha fungua `http://localhost:5500/index.html`.

### Kusakinisha database kwa mkono (manual, hiari)

Badala ya kutumia `install.php` kuunda majedwali, unaweza kuagiza `database/schema.sql` moja kwa moja:

```bash
mysql -u root -p < database/schema.sql
```

Bado utahitaji kufungua `backend/install.php` mara moja ili kuunda `config.php` na akaunti ya kwanza ya msimamizi (au uunde `config.php` kwa mkono kutoka `backend/config/config.example.php` na kuingiza admin kwa SQL moja kwa moja).

### ⚠️ Kama tayari umeshasakinisha mfumo huu awali (existing install)

Toleo hili liliongeza safu mpya (`price`, `payment_status`, `payment_name`, `payment_phone`) kwenye jedwali la `requests` kwa ajili ya kipengele kipya cha "malipo ya kutuma filamu". Database yako ya zamani HAITAKUWA na safu hizi moja kwa moja. Kabla ya kutumia toleo hili, endesha mara moja:

```bash
mysql -u root -p --port=3307 tumutiger < database/migration_add_payment.sql
```

(au bandika maudhui ya `database/migration_add_payment.sql` kwenye tab ya SQL ya phpMyAdmin). Usifanye hivi kama unasakinisha mfumo mpya kabisa — `install.php` na `schema.sql` tayari zina safu hizi.

---

## 4. Akaunti za Watumiaji (User Accounts)

- **Wateja (Customers):** hujisajili wenyewe kupitia `frontend/pages/register.html`.
- **Wasimamizi (Admins):** HAWAWEZI kujisajili popote kwenye frontend.
  - Admin wa kwanza huundwa TU na `backend/install.php` (mara moja).
  - Admin wapya huongezwa TU na admin aliyepo, kupitia `frontend/pages/admin/admins.html` (inayoita `backend/api/admins/create.php`, ambayo inahitaji session ya admin iliyoingia).
- **Kurejesha nenosiri:** kila admin ana swali la usalama (`security_question` / `security_answer`, limehifadhiwa kwa hashing). Mteja/admin anaweza kurejesha nenosiri kupitia `frontend/pages/forgot-password.html` bila barua-pepe au SMS.

---

## 4.5. Malipo ya Kutuma Filamu kwa Wateja Walio Mbali (Delivery & Payment)

Kwa wateja walio mbali na wanaohitaji filamu itumwe kwao:

1. Mteja anatuma ombi la filamu kama kawaida (`movie.php` / `inquiry.php`).
2. Admin anapopitia ombi kwenye `frontend/pages/admin/requests.html`, anaweza kuweka **bei ya kutuma** kwenye sehemu ya "Utumaji kwa Mteja Aliye Mbali". Mara bei ikiwekwa, hali ya malipo ya ombi inakuwa "Inasubiri Malipo".
3. Mteja anaona bei hiyo na maelekezo ya malipo kwenye ukurasa wa kufuatilia (`frontend/pages/track.html`, au kupitia `frontend/pages/customer/requests.html`): **Lipa kwa 0628828678 — TUMU TIGER** (namba na jina vimewekwa kama constants `PAYMENT_NUMBER` / `PAYMENT_NAME` kwenye `frontend/js/ui.js`, badilisha huko ukihitaji kuzibadilisha).
4. Mteja anajaza jina na namba aliyotumia kulipia — hali inakuwa "Malipo Yametumwa".
5. Admin anathibitisha malipo kwa kubofya "Thibitisha Malipo (Paid)" — hali inakuwa "Imelipwa", na admin anaendelea kutuma filamu.

**Kufuatilia kwa namba ya simu:** Mbali na msimbo wa ufuatiliaji, wateja sasa wanaweza kufuatilia maombi yao kwa kutumia namba yao ya simu kwenye `frontend/pages/track.html` (huchagua "Namba ya Simu" badala ya "Msimbo wa Ufuatiliaji"). Hii ni muhimu kwa wateja wanaosahau msimbo wao.

---

## 5. Muhtasari wa API (Backend Endpoints)

Njia zote zinarudisha JSON. `POST` zinazokubali JSON au form-data (angalia faili husika).

| Endpoint | Method | Ruhusa | Maelezo |
|---|---|---|---|
| `/api/auth/register.php` | POST | Umma | Usajili wa mteja |
| `/api/auth/login.php` | POST | Umma | Kuingia |
| `/api/auth/logout.php` | POST | Yeyote aliyeingia | Kutoka |
| `/api/auth/me.php` | GET | Umma | Taarifa za session ya sasa |
| `/api/auth/forgot_find.php` → `forgot_verify.php` → `forgot_reset.php` | POST | Umma | Mchakato wa hatua 3 wa kurejesha nenosiri |
| `/api/movies/list.php` | GET | Umma | Orodha ya filamu (`?q=`, `?status=`) |
| `/api/movies/get.php?id=` | GET | Umma | Taarifa za filamu moja |
| `/api/movies/create.php` | POST (multipart) | Admin | Pakia filamu mpya + kifuniko |
| `/api/movies/update.php` | POST (multipart) | Admin | Hariri filamu |
| `/api/movies/delete.php` | POST | Admin | Futa filamu |
| `/api/requests/create.php` | POST | Mteja | Tuma ombi (order) au swali (inquiry) |
| `/api/requests/mine.php` | GET | Mteja | Maombi yangu |
| `/api/requests/track.php?code=` | GET | Umma | Fuatilia kwa msimbo |
| `/api/requests/track_by_phone.php?phone=` | GET | Umma | Fuatilia kwa namba ya simu (orodha ya maombi) |
| `/api/requests/submit_payment.php` | POST | Umma (kwa msimbo) | Mteja anatuma jina/namba aliyotumia kulipia |
| `/api/requests/admin_list.php` | GET | Admin | Maombi yote (`?status=`, `?type=`) |
| `/api/requests/admin_get.php?id=` | GET | Admin | Taarifa kamili za ombi moja |
| `/api/requests/admin_respond.php` | POST | Admin | Jibu / badilisha hali / weka bei / thibitisha malipo |
| `/api/admins/list.php` | GET | Admin | Orodha ya wasimamizi |
| `/api/admins/create.php` | POST | Admin | Ongeza msimamizi mpya |
| `/api/profile/update.php` | POST | Yeyote aliyeingia | Sasisha jina/simu |
| `/api/profile/change_password.php` | POST | Yeyote aliyeingia | Badilisha nenosiri |
| `/api/profile/update_security.php` | GET/POST | Admin | Ona/sasisha swali la usalama |
| `/api/stats/customer.php` | GET | Mteja | Takwimu za dashibodi ya mteja |
| `/api/stats/admin.php` | GET | Admin | Takwimu za dashibodi ya admin |

---

## 6. Usalama (Security Notes)

- Manenosiri na majibu ya maswali ya usalama yamehifadhiwa kwa `password_hash()` (bcrypt) — kamwe si wazi.
- API zote za `POST`/`GET` zenye taarifa nyeti hulindwa na `require_role('admin')` au `require_role('customer')` (`backend/includes/auth.php`).
- Prepared statements (PDO) zinatumika kila mahali kuzuia SQL Injection.
- Frontend ina-escape maandishi yote ya mtumiaji (`escapeHtml()`) kabla ya kuyaonyesha, kuzuia XSS.
- `backend/uploads/covers/`, `backend/config/`, na `backend/includes/` zina `.htaccess` zinazozuia utekelezaji wa moja kwa moja/uonekanaji wa faili nyeti.
- Tumia **HTTPS** kwenye uzalishaji (production).
- `backend/config/config.php` haipaswi kamwe kuingizwa kwenye Git (tazama `.gitignore`).

---

## 7. Mawazo ya Baadaye (Suggested Enhancements)

- Arifa za SMS/WhatsApp kiotomatiki mteja anapotuma ombi au admin anapojibu.
- Malipo mtandaoni (mobile money) kwa filamu zinazouzwa.
- "Rate limiting" kwenye `/api/auth/login.php` kuzuia mashambulizi ya brute-force.
- JWT/token-based auth badala ya session cookie, endapo utahitaji frontend ya simu (mobile app) baadaye.

---

Imetengenezwa kwa 🧡 kwa **TUMU TIGER** — Maktaba ya Filamu.
