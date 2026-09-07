let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 5;
let isAnswered = false; // Untuk mencegah klik ganda

async function loadQuestions() {
  const response = await fetch("http://localhost:3000/api/questions");
  questions = await response.json();

  if (questions.length === 0) {
    document.getElementById("quiz-content").innerHTML =
      "<h3>Belum ada soal. Silakan tambahkan di halaman Admin.</h3>";
    return;
  }
  showQuestion();
}

function showQuestion() {
  // Reset state
  isAnswered = false;
  timeLeft = 5;
  clearInterval(timerInterval); // Hentikan timer sebelumnya jika ada

  if (currentQuestionIndex >= questions.length) {
    document.getElementById("quiz-content").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("score").innerText =
      `Skor Anda: ${score} / ${questions.length}`;
    return;
  }

  const q = questions[currentQuestionIndex];

  // --- FITUR GANTI BACKGROUND PER SOAL (VERSI TERBARU) ---
  // Cek apakah background berupa URL gambar (upload sendiri)
  if (q.background && q.background.startsWith("/uploads/")) {
    document.body.className = ""; // Hapus class default
    document.body.style.backgroundImage = `url('${q.background}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  } else {
    // Jika bukan URL, reset ke class default (bg-blue, bg-beach, dll)
    document.body.style.backgroundImage = ""; // Hapus gambar
    document.body.className = q.background || "bg-blue";
  }
  // -------------------------------------------------------

  // Tampilkan Timer
  let timerHtml = `<div class="timer">⏱️ Waktu: <span id="timerDisplay">5</span> detik</div>`;

  let html = timerHtml + `<h3>${q.question}</h3>`;

  if (q.image) {
    html += `<img src="${q.image}" style="max-width: 300px; border-radius: 10px; display:block; margin: 0 auto 20px auto;">`;
  }

  html += `<div class="options">`;
  q.options.forEach((opt, index) => {
    const letter = String.fromCharCode(65 + index); // A, B, C
    // Kirim huruf dan jawaban benar ke fungsi checkAnswer
    html += `<button id="btn-${letter}" onclick="checkAnswer('${letter}', '${q.correctAnswer}')">${letter}. ${opt}</button>`;
  });
  html += `</div>`;

  document.getElementById("quiz-content").innerHTML = html;

  // Mulai Timer
  startTimer(q.correctAnswer);
}

function startTimer(correctAnswer) {
  timerInterval = setInterval(() => {
    timeLeft--;
    const timerDisplay = document.getElementById("timerDisplay");

    if (timerDisplay) {
      timerDisplay.innerText = timeLeft;
      // Ubah warna timer jadi merah jika sisa waktu <= 2 detik
      if (timeLeft <= 2) {
        timerDisplay.style.color = "#e74c3c";
      }
    }

    // Jika waktu habis
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout(correctAnswer);
    }
  }, 1000);
}

// Fungsi jika waktu habis
function handleTimeout(correctAnswer) {
  if (isAnswered) return; // Jika sudah dijawab, abaikan
  isAnswered = true;

  // --- POPUP "WAKTU HABIS" SUDAH DIHAPUS (LANGSUNG HIJAU) ---
  // alert("⏰ Waktu Habis!"); <-- Ini sudah dihapus

  // Tandai jawaban yang benar dengan warna hijau
  const correctBtn = document.getElementById(`btn-${correctAnswer}`);
  if (correctBtn) {
    correctBtn.classList.add("correct");
    correctBtn.disabled = true;
  }

  // Nonaktifkan semua tombol jawaban
  const allButtons = document.querySelectorAll(".options button");
  allButtons.forEach((btn) => (btn.disabled = true));

  // Lanjut ke soal berikutnya setelah 2 detik (memberi waktu user melihat jawaban)
  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 2000);
}

function checkAnswer(selected, correct) {
  if (isAnswered) return; // Cegah klik 2 kali
  isAnswered = true;

  // Hentikan timer
  clearInterval(timerInterval);

  const selectedBtn = document.getElementById(`btn-${selected}`);
  const correctBtn = document.getElementById(`btn-${correct}`);

  // Nonaktifkan semua tombol
  const allButtons = document.querySelectorAll(".options button");
  allButtons.forEach((btn) => (btn.disabled = true));

  if (selected === correct) {
    // Jawaban Benar
    selectedBtn.classList.add("correct");
    score++;
    // Bisa tambahkan suara "benar" jika mau
  } else {
    // Jawaban Salah: tandai merah yang dipilih, hijau yang benar
    selectedBtn.classList.add("wrong");
    correctBtn.classList.add("correct");
    // Bisa tambahkan suara "salah" jika mau
  }

  // Lanjut ke soal berikutnya setelah 2 detik
  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 2000);
}

// Panggil fungsi awal
loadQuestions();
