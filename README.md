# StrideLab - adatvezérelt futócipő webáruház

A StrideLab egy fiktív, reszponzív futócipő-webáruház. A projekt valószerű vásárlói problémát kezel: a felhasználó kereshet, szűrhet, rendezhet, részleteket tekinthet meg, kosárba helyezhet termékeket és ajánlatot kérhet.

## Technológiák

- HTML5, CSS3, JavaScript frontend
- Node.js saját REST backend
- JSON-alapú perzisztens adattárolás (`db.json`)
- C# konzolos kliens
- C# WinForms grafikus desktop kliens
- Node.js beépített tesztfuttató

## Indítás

A projekt mappájában:

```bash
npm start
```

Ez elindítja a saját REST szervert a `http://localhost:3000` címen. A webes kliens ugyanerről a címről érhető el: `http://localhost:3000`.

A korábbi Live Serveres indítás is működik, de ilyenkor a frontend a fallback adatokat használhatja, ha az `/api/shoes` végpont nem ugyanazon a hoston érhető el.

## REST API

| Metódus | Végpont | Funkció |
|---|---|---|
| GET | `/api/shoes` | Terméklista lekérése |
| GET | `/api/shoes/:id` | Egy termék lekérése |
| POST | `/api/shoes` | Új termék létrehozása |
| PUT | `/api/shoes/:id` | Termék módosítása |
| DELETE | `/api/shoes/:id` | Termék törlése |

A POST és PUT kéréseknél a `name`, `brand` és pozitív `price` mező kötelező. A szerver JSON választ, HTTP státuszkódot és hibaleírást ad.

## Webes funkciók

- keresés modell, márka vagy kategória szerint
- márka szerinti szűrés
- ár és név szerinti rendezés
- akciós termékek szűrése
- részletes termékmodal
- localStorage-alapú kosár
- név- és e-mail-validáció rendelés előtt
- inline ajánlatkérő és rendelési visszajelzés, felugró ablak nélkül
- reszponzív desktop és mobil elrendezés

## Desktop kliensek

Fordítás:

```bash
dotnet build desktop/StrideLab.Console/StrideLab.Console.csproj
dotnet build desktop/StrideLab.Desktop/StrideLab.Desktop.csproj
```

Futtatás:

```bash
dotnet run --project desktop/StrideLab.Console/StrideLab.Console.csproj
dotnet run --project desktop/StrideLab.Desktop/StrideLab.Desktop.csproj
```

A desktop kliensek a REST API-ról olvassák be a termékeket, ezért előbb az `npm start` parancsot kell futtatni.

## Tesztelés

```bash
npm test
```

Az automatikus tesztek a GET, POST, PUT, DELETE és hibás adatkezelési eseteket ellenőrzik. A részletes teszteredmények a [docs/TESZTEREDMENYEK.md](docs/TESZTEREDMENYEK.md) fájlban találhatók.

## Desktop telepítőkészlet készítése

Windows alatt PowerShellből futtatható:

```powershell
.\installer\build-release.ps1
```

A szkript önállóan futtatható publish mappákat készít a konzolos és a WinForms klienshez. Ha az Inno Setup telepítve van, a szkript az `installer/StrideLab.iss` fájlból telepítőt is fordít. A részletes előfeltételek az [installer/README.md](installer/README.md) fájlban találhatók.

## Dokumentáció és beadási csomag

- [docs/ADATMODELL.md](docs/ADATMODELL.md) - adatmodell és Mermaid ER-diagram
- [docs/TESZTEREDMENYEK.md](docs/TESZTEREDMENYEK.md) - automatizált és manuális tesztek
- [docs/BEMUTATO.md](docs/BEMUTATO.md) - bemutatóvázlat és angol összefoglaló
- `db.json` - adatbázis-export / dump
- `server.js` - REST szerver és adatkezelés
- `index.html`, `style.css`, `app.js` - webes kliens
- `desktop/` - C# konzolos és grafikus kliens

## Csapatmunka dokumentálása

A projekt fejlesztői és feladataik:

| Csapattag | Szerep | Feladat |
|---|---|---|
| Fábián Tamás | Adatbázis- és adatmodell-fejlesztő | `db.json`, az adatmodell megtervezése, az adatbázis exportja és az adatok előkészítése |
| Kovács Martin | Backend fejlesztő és tesztelő | REST API, szerveroldali adatkezelés, validáció, automatizált API-tesztek és tesztdokumentáció |
| Rutai Annamária | Frontend-, mobil- és desktopfejlesztő | Reszponzív webes frontend, mobil használatra alkalmas kliens, C# konzolos és WinForms asztali kliens |

Fábián Tamás az adatbázis és az adatmodell kialakításáért felelt. Kovács Martin a REST backend elkészítését, a validációt és a tesztelést végezte. Rutai Annamária készítette a frontend felületet, a mobil használatra alkalmas reszponzív klienst, valamint a konzolos és grafikus asztali klienseket.
