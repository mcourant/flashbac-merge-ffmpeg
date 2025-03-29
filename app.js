const express = require('express');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Assurer que les dossiers nécessaires existent
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Route pour fusionner les vidéos
app.post('/merge', (req, res) => {
  const file1Path = path.join(uploadsDir, 'file1.mp4');
  const file2Path = path.join(uploadsDir, 'file2.mp4');
  const outputPath = path.join(outputDir, 'merged.mp4');

  // Vérifier que les fichiers source existent
  if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
    return res.status(404).json({ 
      error: 'Les fichiers source ne sont pas disponibles dans le dossier uploads/' 
    });
  }

  // Supprimer le fichier de sortie s'il existe déjà
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Créer un fichier de liste pour la concaténation
  const listFilePath = path.join(__dirname, 'filelist.txt');
  const fileContent = `file '${file1Path}'\nfile '${file2Path}'`;
  fs.writeFileSync(listFilePath, fileContent);

  // Utiliser fluent-ffmpeg pour concaténer les vidéos
  ffmpeg()
    .input(listFilePath)
    .inputOptions(['-f', 'concat', '-safe', '0'])
    .outputOptions('-c copy')
    .output(outputPath)
    .on('start', (commandLine) => {
      console.log('Commande ffmpeg: ' + commandLine);
    })
    .on('error', (err, stdout, stderr) => {
      console.error('Erreur lors de la fusion des vidéos:', err);
      console.error('ffmpeg stderr:', stderr);
      
      // Supprimer le fichier de liste
      if (fs.existsSync(listFilePath)) {
        fs.unlinkSync(listFilePath);
      }
      
      return res.status(500).json({ error: 'Échec de la fusion des vidéos', details: err.message });
    })
    .on('end', () => {
      console.log('Fusion des vidéos terminée avec succès');
      
      // Supprimer le fichier de liste
      if (fs.existsSync(listFilePath)) {
        fs.unlinkSync(listFilePath);
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Vidéos fusionnées avec succès',
        outputFile: 'merged.mp4',
        downloadUrl: '/download'
      });
    })
    .run();
});

// Route pour télécharger la vidéo fusionnée
app.get('/download', (req, res) => {
  const filePath = path.join(outputDir, 'merged.mp4');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Le fichier fusionné n\'existe pas encore' });
  }
  
  res.download(filePath, 'merged.mp4');
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'API de fusion vidéo',
    endpoints: {
      merge: 'POST /merge - Fusionne les fichiers uploads/file1.mp4 et uploads/file2.mp4',
      download: 'GET /download - Télécharge le fichier fusionné'
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
}); 