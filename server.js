const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000; // Change it to the desired port number

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

const files = [];

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const fileDetails = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
    files.push(fileDetails);
    const fileIndex = files.length - 1;
    const secureToken = generateSecureToken();
    const downloadLink = '/download/' + fileIndex + '/' + secureToken;
    res.render('upload-success', { downloadLink, hostname: req.hostname });
  } else {
    res.status(400).send('No file uploaded!');
  }
});

function generateSecureToken() {
  return crypto.randomBytes(20).toString('hex');
}

const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Server running at http://${host}:${port}`);
});
