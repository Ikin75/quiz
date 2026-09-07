const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Agar frontend bisa diakses
app.use("/uploads", express.static("uploads")); // Agar gambar bisa dilihat

// Konfigurasi upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// API untuk menambah soal baru (UBAH upload.single menjadi upload.fields)
app.post(
  "/api/questions",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
  ]),
  (req, res) => {
    const { question, optionA, optionB, optionC, correctAnswer, background } =
      req.body;

    // Ambil path gambar
    const imageUrl = req.files["image"]
      ? `/uploads/${req.files["image"][0].filename}`
      : null;
    const bgImageUrl = req.files["backgroundImage"]
      ? `/uploads/${req.files["backgroundImage"][0].filename}`
      : null;

    // Jika user upload background gambar, pakai itu. Jika tidak, pakai class default 'bg-blue'
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
    fs.writeFileSync("questions.json", JSON.stringify(allQuestions, null, 2));

    res.json({ message: "Soal berhasil ditambahkan!", data: newQuestion });
  },
);

// Baca database soal (file JSON)
const getQuestions = () => {
  if (!fs.existsSync("questions.json")) return [];
  return JSON.parse(fs.readFileSync("questions.json", "utf8"));
};

// API untuk menambah soal baru
app.post("/api/questions", upload.single("image"), (req, res) => {
  // Tambahkan background di sini
  const { question, optionA, optionB, optionC, correctAnswer, background } =
    req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newQuestion = {
    id: Date.now(),
    question,
    image: imageUrl,
    options: [optionA, optionB, optionC],
    correctAnswer: correctAnswer,
    background: background || "bg-blue", // Default ke biru jika tidak dipilih
  };

  // ... kode sebelumnya tetap sama ...
});

// API untuk mengambil semua soal
app.get("/api/questions", (req, res) => {
  res.json(getQuestions());
});

// API untuk menghapus soal beserta gambarnya
app.delete("/api/questions/:id", (req, res) => {
  const id = Number(req.params.id); // Ubah string ID ke number
  let allQuestions = getQuestions();

  // Cari index soal berdasarkan ID
  const questionIndex = allQuestions.findIndex((q) => q.id === id);

  if (questionIndex === -1) {
    return res.status(404).json({ message: "Soal tidak ditemukan!" });
  }

  const deletedQuestion = allQuestions[questionIndex];

  // Hapus file gambar soal jika ada
  if (deletedQuestion.image) {
    const imagePath = path.join(__dirname, deletedQuestion.image); // /uploads/xxx.jpg
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Hapus file dari folder uploads
    }
  }

  // Hapus file background jika ada
  if (
    deletedQuestion.background &&
    deletedQuestion.background.startsWith("/uploads/")
  ) {
    const bgPath = path.join(__dirname, deletedQuestion.background);
    if (fs.existsSync(bgPath)) {
      fs.unlinkSync(bgPath); // Hapus file background
    }
  }

  // Hapus data soal dari array
  allQuestions.splice(questionIndex, 1);

  // Simpan kembali ke questions.json
  fs.writeFileSync("questions.json", JSON.stringify(allQuestions, null, 2));

  res.json({ message: "Soal berhasil dihapus!" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
