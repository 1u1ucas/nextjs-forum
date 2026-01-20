# Ralph - Autonomous Development Agent

Ralph est un système d'orchestration en **deux phases** qui permet à Claude de :

1. **Planifier** : Explorer le codebase et proposer des features/stories
2. **Exécuter** : Implémenter les stories approuvées en autonomie

## Workflow en Deux Phases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RALPH TWO-PHASE WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1: PLANNING (Product Brain)                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ralph-plan.ps1 ──> Claude explores ──> Proposes features       │    │
│  │                                              │                   │    │
│  │                                              ▼                   │    │
│  │                                    prd_draft.json               │    │
│  │                                    plan_output.md               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│                    HUMAN REVIEW & APPROVAL                              │
│                    - Edit stories                                        │
│                    - Set approved: true                                  │
│                    - Copy to prd.json                                    │
│                              │                                           │
│                              ▼                                           │
│  PHASE 2: EXECUTION (Ralph)                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ralph.ps1 ──> Claude implements ──> Commits ──> Updates        │    │
│  │       │              │                   │           │          │    │
│  │       │              │                   │           ▼          │    │
│  │       │              │                   │     progress.txt     │    │
│  │       │              │                   │           │          │    │
│  │       └──────────────┴───────────────────┴───────────┘          │    │
│  │                    (Loop until COMPLETE)                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Token Optimization

| Version        | Tokens/itération | Réduction    |
| -------------- | ---------------- | ------------ |
| v1 (naïve)     | ~15,000-50,000   | -            |
| v2 (optimized) | ~1,000-3,000     | **x5 à x20** |

Chaque itération envoie uniquement :

- 1 story active (approved + not done)
- 25 dernières lignes de progress.txt
- 15 premières lignes de PRD.md

## Structure des Fichiers

```
ralph/
├── PRD.md              # Vision de la feature (humain)
├── prd.json            # Stories avec approved/done status
├── prd_draft.json      # Draft généré par Phase 1
├── progress.txt        # Mémoire persistante
├── prompt.md           # Règles d'exécution (Phase 2)
├── plan_prompt.md      # Règles de planification (Phase 1)
├── ralph.sh            # Exécution (Linux/Mac)
├── ralph.ps1           # Exécution (Windows)
├── ralph-plan.sh       # Planification (Linux/Mac)
├── ralph-plan.ps1      # Planification (Windows)
└── README.md
```

## Guide d'Utilisation

### Phase 1 : Planification

```powershell
cd ralph
.\ralph-plan.ps1
```

Claude va :

1. Explorer le codebase
2. Identifier les opportunités
3. Proposer des features et stories
4. Générer `prd_draft.json` et `plan_output.md`

### Review Humain

1. Lire `plan_output.md` pour l'analyse
2. Copier `prd_draft.json` vers `prd.json`
3. Modifier les stories si nécessaire
4. Mettre `"approved": true` sur les stories voulues

```json
{
  "id": 1,
  "title": "Add tempo slider",
  "done": false,
  "approved": true, // <-- Approuver ici
  "prompt": "..."
}
```

### Phase 2 : Exécution

```powershell
.\ralph.ps1
```

Ralph va :

1. Trouver la première story `approved: true` + `done: false`
2. L'implémenter
3. Commiter
4. Mettre `done: true`
5. Logger dans `progress.txt`
6. Boucler jusqu'à **COMPLETE**

## Schema prd.json

```json
{
  "feature": "Feature Name",
  "stories": [
    {
      "id": 1,
      "feature": "Sub-feature",
      "title": "Story title",
      "done": false,
      "approved": false,
      "priority": "high|medium|low",
      "prompt": "Specific implementation instructions",
      "acceptance_criteria": ["Criterion 1", "Criterion 2"],
      "files_to_modify": ["path/to/file.tsx"],
      "files_to_create": [],
      "depends_on": [],
      "notes": ""
    }
  ]
}
```

## Options de Configuration

**PowerShell:**

```powershell
.\ralph.ps1 -MaxIterations 20
.\ralph.ps1 -ProgressLines 40
.\ralph.ps1 -PrdSummaryLines 25
```

**Bash:**

```bash
MAX_ITERATIONS=20 ./ralph.sh
PROGRESS_LINES=40 ./ralph.sh
```

## Bonnes Pratiques

### Stories Atomiques

Chaque story doit être :

- **Petite** : 1-3 fichiers max
- **Autonome** : Implémentable seule
- **Spécifique** : Fichiers et comportement exacts
- **Testable** : Critères d'acceptation clairs

### Exemple de Bonne Story

```json
{
  "id": 5,
  "feature": "User Settings",
  "title": "Add tempo preference persistence",
  "done": false,
  "approved": true,
  "prompt": "In app/[userId]/settings/page.tsx, add a tempo slider (60-200 BPM) using the Slider component from components/ui/slider. Save to localStorage on change. Restore on page load. Default: 120 BPM.",
  "acceptance_criteria": [
    "Slider renders with current tempo",
    "Change saves to localStorage",
    "Reload restores saved value",
    "Default is 120 if no saved value"
  ],
  "files_to_modify": ["app/[userId]/settings/page.tsx"]
}
```

## Logs et Debug

- `ralph.log` : Log de toutes les itérations
- `output.txt` : Dernière sortie de Claude
- `last_prompt.txt` : Dernier prompt envoyé
- `plan_output.md` : Analyse de Phase 1
- `prd_draft.json` : Draft de stories de Phase 1

## Workflow Recommandé

1. **Matin** : Lancer `ralph-plan.ps1` pour générer des idées
2. **Midi** : Review et approuver les stories pertinentes
3. **Soir** : Lancer `ralph.ps1` avant de dormir
4. **Lendemain** : Review le code, ajouter de nouvelles stories

## FAQ

**Q: Ralph ne fait rien ?**
A: Vérifiez que des stories ont `approved: true`.

**Q: Comment ajouter des stories manuellement ?**
A: Éditez `prd.json` directement, avec `approved: true`.

**Q: Comment annuler le travail ?**
A: `git reset --hard HEAD~N` (N = nombre de commits).

**Q: Puis-je approuver partiellement ?**
A: Oui ! Approuvez seulement les stories que vous voulez. Les autres seront ignorées.

## Dépendances

**Windows:** Aucune (PowerShell natif)

**Linux/Mac:**

```bash
# jq requis pour ralph.sh
brew install jq  # Mac
apt install jq   # Ubuntu
```
