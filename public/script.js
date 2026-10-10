const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const micBtn = document.getElementById('micBtn');
const modeJualanCard = document.getElementById('modeJualanCard');
const modeBelajarCard = document.getElementById('modeBelajarCard');

// State
let chatHistory = [];
let currentMode = 'jualan'; // default mode

// Handle Mode Switching
function setMode(mode) {
  if (currentMode === mode) return;
  currentMode = mode;

  // Toggle active class on UI cards
  if (mode === 'jualan') {
    modeJualanCard.classList.add('active');
    modeBelajarCard.classList.remove('active');
    userInput.placeholder = "Tanyakan seputar produk, strategi closing, atau bedah prospek...";
    
    // Update chat header title and description
    document.querySelector('.chat-header h2').innerHTML = `<i data-lucide="briefcase"></i> Sales Coach Assistant`;
    document.querySelector('.chat-header p').textContent = "Siap membantu Anda closing lebih cepat!";
  } else {
    modeBelajarCard.classList.add('active');
    modeJualanCard.classList.remove('active');
    userInput.placeholder = "Tanyakan materi, peraturan, atau ketik 'minta kuis' untuk latihan...";
    
    // Update chat header title and description
    document.querySelector('.chat-header h2').innerHTML = `<i data-lucide="graduation-cap"></i> Tutor Belajar & Ujian`;
    document.querySelector('.chat-header p').textContent = "Membantu Anda menguasai materi & lulus sertifikasi!";
  }
  lucide.createIcons();

  // Clear chat history & box to isolate context
  chatHistory = [];
  chatBox.innerHTML = '';
  
  // Append mode-specific welcome message
  const welcomeText = mode === 'jualan'
    ? "Halo Rekan Agen! Saya InsureMind AI, Sales Coach Anda untuk Asuransi Sinar Mas. Ada prospek nasabah yang ingin kita bahas hari ini, atau butuh bantuan tentang detail produk?"
    : "Halo Rekan Agen! Saya InsureMind AI, Tutor Belajar Anda. Siap membantu Anda memahami teori produk asuransi umum, PAYDI, Surety Bond, regulasi, dan latihan soal ujian sertifikasi. Silakan tanyakan materi atau ketik 'minta kuis' untuk latihan!";
  
  appendMessage('bot', welcomeText);
  
  // Reset input field
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;
}

// Mode Selector Listeners
modeJualanCard.addEventListener('click', () => setMode('jualan'));
modeBelajarCard.addEventListener('click', () => setMode('belajar'));

// Auto-resize textarea
userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  sendBtn.disabled = this.value.trim() === '';
});

// Handle Enter to send (Shift+Enter for new line)
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) {
      chatForm.dispatchEvent(new Event('submit'));
    }
  }
});

// Parse basic markdown to HTML
function parseMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br>'); // Newlines
    
  return html;
}

// Add message to chat box
function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  
  const icon = sender === 'user' ? 'user' : 'bot';
  const avatarClass = sender === 'user' ? 'user-avatar' : 'bot-avatar';
  
  const htmlContent = sender === 'bot' ? parseMarkdown(text) : text;
  
  msgDiv.innerHTML = `
    <div class="avatar ${avatarClass}">
      <i data-lucide="${icon}"></i>
    </div>
    <div class="message-content">
      <p>${htmlContent}</p>
    </div>
  `;
  
  chatBox.appendChild(msgDiv);
  lucide.createIcons();
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show typing indicator
function showTyping() {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message bot-message`;
  msgDiv.id = 'typingIndicator';
  
  msgDiv.innerHTML = `
    <div class="avatar bot-avatar">
      <i data-lucide="bot"></i>
    </div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  
  chatBox.appendChild(msgDiv);
  lucide.createIcons();
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = userInput.value.trim();
  if (!text) return;
  
  // Update UI
  appendMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;
  
  showTyping();
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text,
        history: chatHistory,
        mode: currentMode
      })
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Gagal membaca respons dari server');
    }

    removeTyping();

    if (!response.ok) {
      appendMessage('bot', `**Error:** ${data.error || 'Terjadi kesalahan pada server.'}`);
      return;
    }
    
    // Update history for context
    chatHistory.push({ role: "user", parts: [{ text }] });
    chatHistory.push({ role: "model", parts: [{ text: data.response }] });
    
    appendMessage('bot', data.response);
    
  } catch (error) {
    removeTyping();
    appendMessage('bot', `**Error:** Maaf, koneksi ke server terputus atau API sedang sibuk.`);
    console.error(error);
  }
});

// Reset Chat
newChatBtn.addEventListener('click', () => {
  chatHistory = [];
  chatBox.innerHTML = '';
  
  const welcomeText = currentMode === 'jualan'
    ? "Halo Rekan Agen! Saya InsureMind AI, Sales Coach Anda untuk Asuransi Sinar Mas. Ada prospek nasabah yang ingin kita bahas hari ini, atau butuh bantuan tentang detail produk?"
    : "Halo Rekan Agen! Saya InsureMind AI, Tutor Belajar Anda. Siap membantu Anda memahami teori produk asuransi umum, PAYDI, Surety Bond, regulasi, dan latihan soal ujian sertifikasi. Silakan tanyakan materi atau ketik 'minta kuis' untuk latihan!";
  
  appendMessage('bot', welcomeText);
});

// Web Speech API - Voice to Text Integration
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'id-ID';

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    // Change mic icon color/animation via class
    userInput.placeholder = "Mendengarkan... Silakan berbicara sekarang...";
  };

  recognition.onend = () => {
    isRecording = false;
    micBtn.classList.remove('recording');
    userInput.placeholder = currentMode === 'jualan'
      ? "Tanyakan seputar produk, strategi closing, atau bedah prospek..."
      : "Tanyakan materi, peraturan, atau ketik 'minta kuis' untuk latihan...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value += (userInput.value ? ' ' : '') + transcript;
    
    // Auto-resize and enable send button
    userInput.dispatchEvent(new Event('input'));
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    isRecording = false;
    micBtn.classList.remove('recording');
    
    // Ganti alert() dengan pesan placeholder sementara
    userInput.placeholder = `Gagal merekam (${event.error}). Cek izin mikrofon.`;
    setTimeout(() => {
      if (!isRecording) {
        userInput.placeholder = currentMode === 'jualan'
          ? "Tanyakan seputar produk, strategi closing, atau bedah prospek..."
          : "Tanyakan materi, peraturan, atau ketik 'minta kuis' untuk latihan...";
      }
    }, 3000);
  };

  micBtn.addEventListener('click', () => {
    try {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } catch (e) {
      console.warn("Speech recognition toggle warning:", e);
      try {
        recognition.abort(); // Batalkan paksa jika status tidak sinkron
      } catch (err) {}
      isRecording = false;
      micBtn.classList.remove('recording');
      userInput.placeholder = currentMode === 'jualan'
        ? "Tanyakan seputar produk, strategi closing, atau bedah prospek..."
        : "Tanyakan materi, peraturan, atau ketik 'minta kuis' untuk latihan...";
    }
  });
} else {
  // Hide mic button if browser doesn't support Web Speech API
  micBtn.style.display = 'none';
  console.warn("Web Speech API tidak didukung oleh browser Anda.");
}

// Admin Feedback Loop
window.bukaModalKoreksi = function() {
  document.getElementById('modalKoreksi').style.display = 'flex';
  document.getElementById('catatanKoreksi').focus();
};

document.getElementById('batalKoreksiBtn').addEventListener('click', () => {
  document.getElementById('modalKoreksi').style.display = 'none';
  document.getElementById('catatanKoreksi').value = '';
});

document.getElementById('simpanKoreksiBtn').addEventListener('click', kirimKoreksiAdmin);

async function kirimKoreksiAdmin() {
  const catatanText = document.getElementById('catatanKoreksi').value.trim();
  if (!catatanText) {
    alert("Catatan koreksi tidak boleh kosong.");
    return;
  }
  
  try {
    const response = await fetch('/api/admin/koreksi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ catatanKoreksi: catatanText })
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
    
    if (response.ok && data.success) {
      alert("Koreksi admin berhasil disimpan! Aplikasi akan memuat ulang...");
      document.getElementById('modalKoreksi').style.display = 'none';
      document.getElementById('catatanKoreksi').value = '';
      location.reload();
    } else {
      alert("Gagal menyimpan koreksi: " + (data.error || "Terjadi kesalahan"));
    }
  } catch (e) {
    console.error(e);
    alert("Gagal menghubungi server.");
  }
}
