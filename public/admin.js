// Fungsi untuk mengambil dan menampilkan daftar soal
async function loadQuestions() {
  const response = await fetch("http://localhost:3000/api/questions");
  const questions = await response.json();

  const listContainer = document.getElementById("questionList");
  listContainer.innerHTML = ""; // Kosongkan list

  if (questions.length === 0) {
    listContainer.innerHTML = '<p style="color: #ccc;">Belum ada soal.</p>';
    return;
  }

  questions.forEach((q) => {
    const item = document.createElement("div");
    item.style.border = "1px solid #555";
    item.style.padding = "10px";
    item.style.marginBottom = "10px";
    item.style.borderRadius = "5px";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";

    // Menampilkan teks soal (jika panjang, dipotong)
    item.innerHTML = `
            <div>
                <strong style="color: white;">${q.question}</strong>
                <br>
                <small style="color: #aaa;">Jawaban Benar: ${q.correctAnswer}</small>
            </div>
        `;

    // Tombol Hapus
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Hapus";
    deleteBtn.style.backgroundColor = "#e74c3c";
    deleteBtn.style.width = "auto";
    deleteBtn.style.padding = "5px 15px";
    deleteBtn.style.margin = "0";

    deleteBtn.onclick = async () => {
      if (confirm("Yakin ingin menghapus soal ini beserta gambarnya?")) {
        const delResponse = await fetch(
          `http://localhost:3000/api/questions/${q.id}`,
          {
            method: "DELETE",
          },
        );
        const delResult = await delResponse.json();
        alert(delResult.message);
        loadQuestions(); // Refresh daftar soal
      }
    };

    item.appendChild(deleteBtn);
    listContainer.appendChild(item);
  });
}

// Logika Submit Form (Tetap sama seperti sebelumnya, tapi tambahkan loadQuestions di dalamnya)
document.getElementById("quizForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("image", document.getElementById("imageInput").files[0]);
  formData.append("question", document.getElementById("questionInput").value);
  formData.append("optionA", document.getElementById("optionA").value);
  formData.append("optionB", document.getElementById("optionB").value);
  formData.append("optionC", document.getElementById("optionC").value);
  formData.append(
    "correctAnswer",
    document.getElementById("correctAnswer").value,
  );

  // Background
  const bgFile = document.getElementById("backgroundInput").files[0];
  if (bgFile) {
    formData.append("backgroundImage", bgFile);
  } else {
    formData.append("background", "bg-blue");
  }

  const response = await fetch("http://localhost:3000/api/questions", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  alert(result.message);

  // Reset Form
  document.getElementById("quizForm").reset();

  // Refresh daftar soal
  loadQuestions();
});

// Jalankan loadQuestions saat halaman admin dibuka
loadQuestions();
