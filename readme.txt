Adresářová struktura

V kořenové složce se nacházejí konfigurační soubory pro spuštění projektu jako celku, 
dále složka „backend“ (kód pro backend) a „frontend“ (zdrojové kódy pro frontend). 
Ve složce frontendu jsou uloženy konfigurační soubory pro Vite + React a složka „src“. 
Zde se nacházejí zdrojové kódy, hlavním je soubor App.jsx, který implementuje menu 
webové aplikace (vytvořila Vladyslava Bilyk) a šablony pro hlavní sekce (Kalendář, 
seznam produktů, seznam nákupů, seznam jídel).

Dále ve složce „components“ se nacházejí zdrojové kódy pro jednotlivé části aplikace.

Kalendář a seznam produktů realizovala Kucher Maryna (xkuche01).
Do této části patří následující zdrojové kódy:
    ProductContext.jsx – funkce pro aktualizaci seznamu produktů
    ProductList.jsx – sekce produktů, vyhledávání produktů
    ProductList.css – styly pro sekci produktů
    AddProduct.jsx – přidávání produktu
    EditProduct.jsx – úprava produktu
    MealCalendar.jsx – sekce kalendáře
    MealCalendar.css – styly pro sekci kalendáře
    SingleMeal.jsx – vyhledávání pro každé jídlo a zobrazení naplánovaných pokrmů

Vladyslava Bilyk(xbilyk03) implementovala seznam nákupů a sekci jídel.
Do této části patří následující zdrojové kódy:
    Dish.jsx – sekce jídel 
    Dish.css - styly pro sekce jídel
    ShoppingList.jsx - sekce seznamu nákupů
    ShoppingList.css –  a styly pro sekce seznamu nákupů