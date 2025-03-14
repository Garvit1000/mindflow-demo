const sharp = require('sharp');
const fs = require('fs');

const inputPath = './src/assets/gradientbg.png';
const outputPath = './src/assets/gradientbg_new.png';

sharp(inputPath)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('Successfully converted image');
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);
  })
  .catch(err => console.error('Error converting image:', err));
