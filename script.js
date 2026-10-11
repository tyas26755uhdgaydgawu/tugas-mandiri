"use strict";

/* ============================================================
   INTERAKSI 1: Toggle mode gelap/terang
   ============================================================ */
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  themeBtn.setAttribute("aria-pressed", String(isDark));
  themeBtn.setAttribute("aria-label", isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap");
  themeBtn.textContent = isDark ? "Terang" : "Gelap";
}
// Awal: ikuti pengaturan perangkat
setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
themeBtn.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* ============================================================
   INTERAKSI 2: Toggle menu navigasi (layar kecil)
   ============================================================ */
const menuBtn = document.getElementById("menu-toggle");
const menu = document.getElementById("nav-menu");

menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
// Tutup menu setelah salah satu tautan diklik
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ============================================================
   INTERAKSI 3: Countdown menuju hari acara
   ============================================================ */
const EVENT_DATE = new Date("2026-11-28T08:00:00+07:00"); // ubah sesuai acaramu
const cd = {
  days: document.getElementById("cd-days"),
  hours: document.getElementById("cd-hours"),
  minutes: document.getElementById("cd-minutes"),
  seconds: document.getElementById("cd-seconds"),
};
const cdNote = document.getElementById("countdown-note");
const pad = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const diff = EVENT_DATE - new Date();
  if (diff <= 0) {
    Object.values(cd).forEach((el) => (el.textContent = "00"));
    cdNote.textContent = "Acara sudah dimulai atau selesai. Sampai jumpa di acara berikutnya.";
    clearInterval(cdTimer);
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);
  cd.days.textContent = pad(Math.floor(totalSeconds / 86400));
  cd.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
  cd.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
  cd.seconds.textContent = pad(totalSeconds % 60);
}
updateCountdown();
const cdTimer = setInterval(updateCountdown, 1000);

/* ============================================================
   INTERAKSI 4: Validasi form + modal konfirmasi + counter kuota
   ============================================================ */
const TOTAL_QUOTA = 120;
let quotaLeft = 87; // contoh: sebagian kursi sudah terisi

const form = document.getElementById("register-form");
const submitBtn = document.getElementById("submit-btn");
const quotaText = document.getElementById("quota-left");
const quotaBar = document.getElementById("quota-bar");
const modal = document.getElementById("success-modal");

function renderQuota() {
  quotaText.textContent = quotaLeft;
  quotaBar.value = TOTAL_QUOTA - quotaLeft;
  if (quotaLeft <= 0) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Kursi sudah penuh";
  }
}
renderQuota();

// Aturan validasi tiap kolom: mengembalikan pesan error, atau "" jika valid
const rules = {
  nama(value) {
    if (!value.trim()) return "Nama wajib diisi.";
    if (value.trim().length < 3) return "Nama minimal 3 huruf.";
    return "";
  },
  email(value) {
    if (!value.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return "Format email belum benar. Contoh: nama@email.com";
    return "";
  },
  jurusan(value) {
    return value ? "" : "Pilih salah satu program studi.";
  },
  setuju(_value, field) {
    return field.checked ? "" : "Centang untuk melanjutkan.";
  },
};

function validateField(field) {
  const message = rules[field.name](field.value, field);
  const errorEl = document.getElementById("err-" + field.name);
  errorEl.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  return message === "";
}

// Cek ulang saat pengguna mengetik atau berpindah kolom
form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // cegah halaman reload
  const fields = [...form.querySelectorAll("input, select")];
  const results = fields.map(validateField); // validasi semua kolom
  const firstInvalid = fields.find((_, i) => !results[i]);

  if (firstInvalid) {
    firstInvalid.focus(); // arahkan ke kolom pertama yang salah
    return;
  }

  // Semua valid: kurangi kuota dan tampilkan modal
  quotaLeft -= 1;
  renderQuota();
  document.getElementById("modal-name").textContent = form.nama.value.trim();
  document.getElementById("modal-email").textContent = form.email.value.trim();
  modal.showModal();
  form.reset();
  fields.forEach((f) => f.removeAttribute("aria-invalid"));
});

// Tutup modal: tombol, klik di luar kotak, atau tombol Esc (bawaan dialog)
document.getElementById("modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  const box = modal.getBoundingClientRect();
  const inside = e.clientX >= box.left && e.clientX <= box.right &&
                 e.clientY >= box.top && e.clientY <= box.bottom;
  if (!inside) modal.close(); // klik di area gelap luar kotak
});
