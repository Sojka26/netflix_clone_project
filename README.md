#  Netflix Clone – engeto projekt

##  Popis
Projekt je závěrečná práce z **HTML, CSS a JavaScriptu/TypeScriptu**.  
Cílem bylo vytvořit responzivní napodobeninu webu **Netflix**, která umožňuje:
- procházet úvodní stránku,
- vyhledávat filmy přes **TVMaze API**,
- zobrazit offline katalog filmů, pokud není API dostupné,
- registrovat uživatele pomocí formuláře s validací hesla,
- používat tlačítko pro návrat na začátek stránky.

---

##  Spuštění projektu
1. Stáhni si repozitář / složku s projektem.  
2. Otevři soubor **`index.html`** v libovolném prohlížeči.  
   (Projekt nevyžaduje žádný backend ani server – funguje čistě na frontendu.)  

---

##  Vývoj
Projekt je napsaný v **TypeScriptu** a překládá se do JavaScriptu.

### Kompilace TypeScriptu
Spusť v terminálu ve složce projektu:

```bash
# instalace typescriptu (pokud není nainstalován)
npm install --save-dev typescript

# přeložení všech .ts souborů
npx tsc
```

### Watch mód (automatický překlad při změnách)
```bash
npx tsc --watch
```


Přeložené soubory se ukládají do složky **`dist/`**.  
V `index.html` se načítá **`dist/script.js`**.

---

##  Responzivita
Stránka je navržená **mobile-first** a funguje až do šířky cca **320px**.  
Obsahuje **breakpointy** pro 900px, 680px a 520px.

---

##  Funkce
- Úvodní stránka (Hero sekce s formulářem).  
- Vyhledávání filmů podle názvu (API nebo offline katalog).  
- Registrace uživatele:  
  - validace vstupů,  
  - kontrola shody hesel (zelený/červený okraj),  
  - po úspěšné registraci přesměrování na stránku s filmy.  
- Tlačítko pro návrat nahoru.  
- Patička s odkazy.  

---

##  Barvy a styl
- Primární červená: **`rgb(214, 28, 28)`**  
- Pozadí: černé  
- Text: bílé  
- Font: Arial, sans-serif  
---

