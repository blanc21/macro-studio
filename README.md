# Macro Studio

Application desktop professionnelle d'automatisation souris/clavier pour Windows. Créez, enregistrez et exécutez des macros sans écrire une ligne de code — pensée pour l'automatisation de tâches répétitives dans les jeux et logiciels.

Electron + React + TypeScript pour l'interface, moteur d'automatisation natif Windows (C# / Win32 `SendInput`) + capture globale (`uiohook-napi`) pour la souris/le clavier.

## Fonctionnalités

- **Éditeur de séquence** — 6 types d'actions (déplacement souris, clic, molette, touche clavier, texte, attente), réorganisables par glisser-déposer, avec sélection directe d'une position à l'écran ou d'une touche au clavier (pas de saisie manuelle de coordonnées)
- **Enregistrement automatique** — capture en temps réel des mouvements, clics, touches et délais réels, injectés directement dans l'éditeur
- **Moteur d'exécution fiable** — démarrage / pause / arrêt, répétitions (une fois, un nombre défini, ou jusqu'à arrêt manuel), délais fixes ou aléatoires
- **Raccourcis globaux configurables** — démarrer / pause / arrêter / enregistrer, actifs même fenêtre non focus ; l'arrêt agit comme coupe-circuit d'urgence
- **Bibliothèque de macros** — création, renommage, duplication, suppression, export/import au format JSON, recherche
- **Tableau de bord** — statistiques d'utilisation (nombre de macros, exécutions, temps actif)
- **Paramètres** — thème clair/sombre, démarrage avec Windows, minimisation dans la barre système, délais par défaut, réglage des raccourcis
- **Interface premium** — mode sombre par défaut, animations soignées, cohérente de bout en bout

## Prérequis

- Node.js 20+
- [.NET SDK](https://dotnet.microsoft.com/) (pour compiler le moteur natif `input-helper.exe`)
- Windows 10/11 (le moteur d'automatisation est Windows-only)

## Installation

```bash
npm install
npm run build:helper   # compile le moteur natif (native/InputHelper -> resources/native)
npm run dev
```

`build:helper` doit être relancé si vous modifiez le code C# dans `native/InputHelper`.

## Build

```bash
npm run build:win   # génère l'installeur Windows (NSIS) dans dist/
```

## Architecture

```
src/
  shared/    Types partagés (Action, Macro, Settings...) entre main/preload/renderer
  main/      Process principal Electron
    macros/    Persistance (fichiers JSON par macro + settings.json)
    input/     Simulateur (spawn input-helper.exe), enregistreur, raccourcis globaux, picker
    engine/    Moteur d'exécution (start/pause/stop/repeat)
    ipc/       Handlers IPC exposés au renderer
  preload/   Pont contextBridge typé (window.api)
  renderer/  Interface React (dashboard, bibliothèque, éditeur, enregistrement, paramètres)
native/
  InputHelper/  Programme C# autonome (P/Invoke Win32 SendInput) pour simuler souris/clavier
```

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance l'app en mode développement |
| `npm run build` | Build de production (typecheck + bundling) |
| `npm run build:win` | Génère l'installeur Windows (NSIS) |
| `npm run build:helper` | Recompile le moteur natif C# |
| `npm run lint` / `npm run typecheck` | Vérifications qualité de code |

## Limites connues (V1)

- Windows uniquement (le moteur d'automatisation repose sur l'API Win32)
- Pas de multi-langue, de dossiers/catégories de macros, ni d'historique d'exécution détaillé
