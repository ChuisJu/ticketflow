# TicketFlow — projet support du TD Module 03

Petite API REST de gestion de tickets de support, utilisée comme projet fil rouge
pour le TD « Construire un pipeline Jenkins + Docker sécurisé » (Ascent Formation, Lot 3).

L'application est volontairement simple, mais structurée pour exercer toute la
chaîne de contrôles du pipeline : lint, scan de secrets, tests, SAST, SCA, build d'image.

## Prérequis

- Node.js 20+ (pour un lancement local hors Docker)
- Docker (voir l'Étape 0 du TD pour l'installation depuis le dépôt officiel)

## Commandes

```bash
npm ci              # installer les dépendances
npm run lint        # ESLint
npm test            # tests unitaires (jest)
npm test -- --coverage   # tests + couverture
npm run build       # produit dist/
npm run dev         # lance le serveur depuis src/ (port 3000)
npm start           # lance le serveur depuis dist/ (après build)
```

## Endpoints

| Méthode | Route          | Description                                   |
|---------|----------------|-----------------------------------------------|
| GET     | /health        | Sonde de disponibilité                        |
| GET     | /tickets       | Liste des tickets de l'agent (en-tête requis) |
| GET     | /tickets/:id   | Détail d'un ticket (contrôle d'accès)         |
| POST    | /tickets       | Création d'un ticket                          |

L'identité est simulée par les en-têtes `x-agent-id` et `x-role` (`agent` par défaut,
ou `superviseur`). En contexte réel, ces en-têtes seraient remplacés par un jeton
JWT vérifié côté serveur.

### Exemples

```bash
# Sonde
curl localhost:3000/health

# Liste des tickets de agent1
curl -H "x-agent-id: agent1" localhost:3000/tickets

# Accès refusé (403) : agent1 demande un ticket d'agent2
curl -i -H "x-agent-id: agent1" localhost:3000/tickets/2

# Création
curl -X POST -H "x-agent-id: agent1" -H "Content-Type: application/json" \
  -d '{"sujet":"Imprimante HS","client":"dave"}' localhost:3000/tickets
```

## Sécurité — par construction

- Aucun secret en clair dans le code (`src/config.js` ne contient que des paramètres).
- Contrôle d'accès appliqué **côté serveur** : un agent n'accède qu'à ses tickets.
- Validation des entrées sur la création.
- Journalisation des accès (succès comme refus) sur la sortie standard.
- Image Docker multi-stage, exécutée sous un utilisateur non-root.

> La démonstration du blocage (Étape 9 du TD) consiste à ajouter **volontairement**
> un faux secret dans `src/config.js` pour déclencher gitleaks, puis à l'annuler.
> N'utilisez jamais de secret réel, même de test.
