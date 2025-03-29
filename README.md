# API de Fusion Vidéo

Une API REST simple construite avec Express.js pour concaténer des fichiers vidéo MP4 en utilisant FFmpeg.

## Prérequis

- Node.js (v14 ou supérieur)
- FFmpeg installé sur le système

### Installation de FFmpeg

#### Sur macOS (avec Homebrew):
```bash
brew install ffmpeg
```

#### Sur Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Sur Windows:
Téléchargez FFmpeg depuis le [site officiel](https://ffmpeg.org/download.html) ou utilisez [Chocolatey](https://chocolatey.org/):
```bash
choco install ffmpeg
```

## Installation

1. Clonez ce dépôt ou téléchargez les fichiers
2. Installez les dépendances:

```bash
npm install
```

3. Créez les dossiers nécessaires (s'ils n'existent pas déjà):

```bash
mkdir -p uploads output
```

4. Placez vos fichiers vidéo dans le dossier `uploads/`:
   - `uploads/file1.mp4`
   - `uploads/file2.mp4`

## Démarrage du serveur

```bash
npm start
```

Pour le développement avec redémarrage automatique:
```bash
npm run dev
```

Le serveur démarre sur http://localhost:3000

## Utilisation de l'API

### Fusionner les vidéos
```http
POST /merge
```

Cette requête concatène `file1.mp4` et `file2.mp4` du dossier `uploads/` et crée `merged.mp4` dans le dossier `output/`.

Exemple avec curl:
```bash
curl -X POST http://localhost:3000/merge
```

### Télécharger la vidéo fusionnée
```http
GET /download
```

Cette requête télécharge le fichier fusionné `output/merged.mp4`.

Exemple dans un navigateur:
http://localhost:3000/download

## Notes importantes

- L'API suppose que les fichiers sont déjà présents dans le dossier `uploads/`
- La concaténation est effectuée en mode "copy" ce qui est plus rapide mais nécessite que les vidéos aient le même codec et les mêmes paramètres
- Les fichiers sources doivent être nommés exactement `file1.mp4` et `file2.mp4` 