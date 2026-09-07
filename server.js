const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// PENTING: Gunakan path.join agar Vercel menemukan folder public
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Konfigurasi upload gambar (Soal & Background)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Baca database soal (file JSON)
const getQuestions = () => {
  if (!fs.existsSync(path.join(__dirname, "questions.json"))) return [];
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "questions.json"), "utf8"),
  );
};

// API untuk menambah soal baru
app.post(
  "/api/questions",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
  ]),
  (req, res) => {
    const { question, optionA, optionB, optionC, correctAnswer, background } =
      req.body;

    const imageUrl = req.files["image"]
      ? `/uploads/${req.files["image"][0].filename}`
      : null;
    const bgImageUrl = req.files["backgroundImage"]
      ? `/uploads/${req.files["backgroundImage"][0].filename}`
      : null;

    const backgroundValue = bgImageUrl ? bgImageUrl : background || "bg-blue";

    const newQuestion = {
      id: Date.now(),
      question,
      image: imageUrl,
      options: [optionA, optionB, optionC],
      correctAnswer: correctAnswer,
      background: backgroundValue,
    };

    const allQuestions = getQuestions();
    allQuestions.push(newQuestion);
    fs.writeFileSync(
      path.join(__dirname, "questions.json"),
      JSON.stringify(allQuestions, null, 2),
    );

    res.json({ message: "Soal berhasil ditambahkan!", data: newQuestion });
  },
);

// API untuk mengambil semua soal
app.get("/api/questions", (req, res) => {
  res.json(getQuestions());
});

// API untuk menghapus soal beserta gambarnya
app.delete("/api/questions/:id", (req, res) => {
  const id = Number(req.params.id);
  let allQuestions = getQuestions();

  const questionIndex = allQuestions.findIndex((q) => q.id === id);

  if (questionIndex === -1) {
    return res.status(404).json({ message: "Soal tidak ditemukan!" });
  }

  const deletedQuestion = allQuestions[questionIndex];

  if (deletedQuestion.image) {
    const imagePath = path.join(__dirname, deletedQuestion.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  if (
    deletedQuestion.background &&
    deletedQuestion.background.startsWith("/uploads/")
  ) {
    const bgPath = path.join(__dirname, deletedQuestion.background);
    if (fs.existsSync(bgPath)) {
      fs.unlinkSync(bgPath);
    }
  }

  allQuestions.splice(questionIndex, 1);
  fs.writeFileSync(
    path.join(__dirname, "questions.json"),
    JSON.stringify(allQuestions, null, 2),
  );

  res.json({ message: "Soal berhasil dihapus!" });
});

// PENTING: JANGAN gunakan app.listen() di Vercel!
// Ganti dengan module.exports agar Vercel yang menjalankan server
module.exports = app;
