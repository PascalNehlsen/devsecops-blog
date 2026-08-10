---
id: deluxe-fraud
title: Deluxe-Betrug
sidebar_label: Deluxe-Betrug
sidebar_position: 4
---

# Bericht: Challenge "Deluxe-Betrug"

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

**Projekt**: OWASP Juice Shop, Challenge "Deluxe Fraud" (unzureichende Eingabeprüfung) <br/ >
**Werkzeuge**: Kali Linux mit Burp Suite, Firefox-Entwicklerwerkzeuge <br/ >
**Autor**: Pascal Nehlsen <br/ >
**GitHub-Link**: [https://github.com/PascalNehlsen/juice-shop-challenges/blob/main/challenges/deluxe-fraud.md](https://github.com/PascalNehlsen/juice-shop-challenges/blob/main/challenges/deluxe-fraud.md)

## Inhalt

1. [Einführung](#einführung)
2. [Ziel](#ziel)
3. [Vorgehen](#vorgehen)
   - [Schritt 1: Informationen sammeln](#schritt-1-informationen-sammeln)
   - [Schritt 2: Kauf-Request manipulieren](#schritt-2-kauf-request-manipulieren)
4. [Fazit](#fazit)

### Einführung

Der OWASP Juice Shop ist eine absichtlich verwundbare Webanwendung, die Sicherheitslücken vorführt. Dieser Bericht beschreibt die Schritte, mit denen ich die Challenge "Deluxe Fraud" gelöst habe.

### Ziel

Ziel ist, die "Deluxe-Mitgliedschaft" des OWASP Juice Shop kostenlos zu bekommen oder den Bezahlvorgang zu umgehen. Das bildet reale Angriffe nach, bei denen Zahlungen manipuliert oder Rabatte erzwungen werden, um ohne korrekte Zahlung an ein Produkt zu kommen.

### Vorgehen

#### Schritt 1: Informationen sammeln

Zuerst bin ich in den Bereich gegangen, in dem man die Deluxe-Mitgliedschaft kaufen kann.

<div align="center">

![Informationen](../../../../../../../docs/assets/images/juice-shop/deluxe-fraud/information.png)

</div>

Beim Klick auf "Become a Member" sah ich, dass die Mitgliedschaft 49,00 $ kostet, während unser Guthaben bei 0,00 $ stand. Der Kaufknopf war zudem deaktiviert.

<div align="center">

![Mitglied werden](../../../../../../../docs/assets/images/juice-shop/deluxe-fraud/become-a-member.png)

</div>

Um zu sehen, wie der Knopf deaktiviert wurde, habe ich die Firefox-Entwicklerwerkzeuge geöffnet.

<div align="center">

![Knopf deaktiviert](../../../../../../../docs/assets/images/juice-shop/deluxe-fraud/button-deactivated.png)

</div>

Im HTML fand ich die Attribute `mat-button-disabled` und `disabled='true'`. Nach dem Entfernen dieser Attribute über die Konsole ließ sich der Knopf aktivieren.

<div align="center">

![Knopf aktiviert](../../../../../../../docs/assets/images/juice-shop/deluxe-fraud/button-activated.png)

</div>

#### Schritt 2: Kauf-Request manipulieren

Ein Klick auf den Knopf löste allerdings nichts aus. Also fing ich den beim Klick gesendeten Request mit Burp Suite ab. Es war ein `POST` mit einem JSON-Objekt.

<div align="center">

![Zahlung](../../../../../../../docs/assets/images/juice-shop/deluxe-fraud/payment.png)

</div>

Der `paymentMode` zeigte, dass wir mit unserem Guthaben zahlen wollten, doch da wir keins hatten, änderte ich `paymentMode` in einen leeren String. Nach "Forward" kam eine Erfolgsmeldung, dass wir nun Deluxe-Mitglied seien, was sich auch auf der Seite bestätigte.

<div align="center">

![Ergebnis](../../../../../../../docs/assets/images/juice-shop/deluxe-fraud/challenge-solved.png)

</div>

### Fazit

Die Challenge wurde gelöst, indem der `POST`-Request geändert wurde, sodass ich ohne korrekte Zahlung eine Deluxe-Mitgliedschaft erhielt.

<div align="center">

![Challenge gelöst](../../../../../../../docs/assets/images/juice-shop/captcha-bypass/challenge-accept.png)

</div>

---

**Repository:** [https://github.com/PascalNehlsen/juice-shop-challenges/blob/main/challenges/deluxe-fraud.md](https://github.com/PascalNehlsen/juice-shop-challenges/blob/main/challenges/deluxe-fraud.md)
