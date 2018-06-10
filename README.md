# kaj-semestral-work
Client applications in javascript semestral work. 

# CZECH

## Cíl projektu
Jednoduchý klient pro komunikaci přes websockety. Uživatel si po připojení bude moci zvolit jméno a připojit se do chatovací místnosti.

## Postup
Po otevření aplikace se uživatel dostane do nastavení, kde si může změnit jméno (nastavit v případě prvního spuštění) a následně se připojit do nějaké z místností, případně odpojit.

Mezi místnostmi se dá jednoduše přepínat v seznamu na levé straně (na vrchu v případě šířky menší než 600px).
V každé místnosti je okno se zprávami, pod ním pole pro napsání zprávy (odesílá se stisknutím klávesy enter) a s dalšími tlačítky, jejich funkcionalita je pospaná v další části dokumentace.

## Popis funkčnosti
### Nastavení
V nastavení může uživatel měnit své jméno pomocí tlačítka "Change". Po změně jména dojde k jeho uložení do localstorage, takže uživatel nemusí po každém přenačtení aplikace jméno znovu zadávat. V případě, že uživatel změní jméno a je připojený k nějaké místnosti, zůstane mu v ní jeho staré jméno, ale pokud se do nějaké připojí, tak to bude pod jménem novým. 

Dále se zde uživatel může připojit k místnoti pomocí tlačítka "Join" a následně odpojit tlačítkem "Disconnect". Seznam místností, do kterých je uživatel připojen se také ukládá do localstorage a v případě přenačtení aplikace se automaticky připojí ke všem místnostem z posledního použití aplikace.

### Chatovací místnost
Chatovací místnost se skládá ze třech částí. První je "message box", ve kterém se zobrazují zprávy. Druhou částí je seznam uživatelů připojených v místnosti. V této části je jméno uživatele rozlišeno od ostatních tučným písmem. Tato část se aktualizuje, takže pokud se někdo do místnosti připojí nebo se z ní odpojí, změna se projeví bez potřeby přenačtení.
Další část slouží pro odesílání zpráv. Obsahuje textbox do kterého se dá psát a po stistknutí klávesy enter se zpráva odešle. Pod ním jsou tlačítka "Show canvas", které zoobrazí kreslící plochu, "Send image", které odešle to, co je nakreslené v canvasu a vyčistí ho a "Send position", které pošle na základě geolokace aktuální pozici uživatele. Tato pozice bude zobrazene ve zprávě na mapě.

#### Drag and drop
Přetažením obrázku na box se zprávami lze odeslat obrázek. Limit velikosti obrázku je 10MB.

## Aktuálně dostupné chatovací místnosti
* LAG
* KAJ

# ENGLISH
_soon_