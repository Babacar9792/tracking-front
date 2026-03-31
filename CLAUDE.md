# Application Angular — Envoi de position en temps réel (WebSocket STOMP)

## Objectif

Créer une application Angular moderne (Angular 17+ avec standalone components) permettant d'envoyer la position GPS d'un utilisateur en temps réel vers un backend via WebSocket (STOMP).

---

## Contexte

Le backend expose un WebSocket STOMP avec les informations suivantes :

- Connexion : `ws://localhost:8080/ws`
- Envoi de position : `/app/position`
- Réception temps réel : `/topic/trajet/{trajetId}`

L'application Angular doit permettre d'envoyer les positions d'un trajet en continu.

---

## Exigences fonctionnelles

### 1. Connexion WebSocket

- Utiliser **STOMP + SockJS**
- Se connecter à `ws://localhost:8080/ws`
- Gérer la reconnexion automatique, les erreurs de connexion et l'état de connexion (connecté / déconnecté)

### 2. Envoi de position

- Envoyer les positions vers `/app/position`
- Format du message :

```json
{
  "trajetId": "string",
  "latitude": number,
  "longitude": number,
  "timestamp": "ISO date",
  "speed": number
}
```

> Le champ `speed` est optionnel.

### 3. Récupération GPS

- Utiliser l'API navigateur `navigator.geolocation.watchPosition`
- Gérer : permission refusée, précision insuffisante, erreurs GPS

### 4. Gestion du trajet

Permettre à l'utilisateur de :

- Saisir ou générer un `trajetId`
- Démarrer le tracking
- Stopper le tracking

### 5. Envoi en continu

- Envoyer automatiquement la position toutes les X secondes (configurable, ex. : 5 s) ou à chaque changement GPS
- Utiliser RxJS (`interval`, `switchMap`, etc.)

---

## Architecture

Utiliser des **standalone components** avec une séparation claire des responsabilités :

```
/tracking-sender
├── tracking-sender.component.ts
├── websocket.service.ts
├── geolocation.service.ts
└── tracking.service.ts
```

| Service | Responsabilité |
|---|---|
| `websocket.service` | Gestion STOMP — connexion, envoi, subscribe |
| `geolocation.service` | Récupération GPS et gestion des permissions |
| `tracking.service` | Logique métier (start / stop tracking) |
| `tracking-sender.component` | UI et interaction utilisateur |

---

## Temps réel (optionnel mais recommandé)

- S'abonner à `/topic/trajet/{trajetId}`
- Afficher les positions envoyées en live et les logs en temps réel
