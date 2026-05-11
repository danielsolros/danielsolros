const clientDatabase = {
    'apple.com': { name: 'Apple', color: '#A2AAAD', text: '#ffffff', logoText: ' Apple' },
    'tesla.com': { name: 'Tesla', color: '#E31937', text: '#ffffff', logoText: 'T E S L A' },
    'google.com': { name: 'Google', color: '#4285F4', text: '#ffffff', logoText: 'G O O G L E' }
};

let currentClient = { name: 'Empresa Demo', color: '#3b82f6', text: '#ffffff', logoText: 'EMPRESA' };
let currentUserEmail = '';
let hasSeenWelcomeVideo = false;
let selectedRole = 'student'; // 'student' o 'admin'

// --- Lógica SPA ---
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    const target = document.getElementById(viewId);
    if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToLanding() { resetLogin(); showView('view-landing'); }
function goToLogin() { showView('view-login'); }

// --- Login y Roles ---
function selectRole(role) {
    selectedRole = role;
    const btnStudent = document.getElementById('btn-role-student');
    const btnAdmin = document.getElementById('btn-role-admin');
    
    if (role === 'student') {
        btnStudent.classList.replace('text-gray-400', 'text-white');
        btnStudent.classList.replace('hover:text-white', 'bg-white/10');
        btnStudent.classList.add('shadow');
        
        btnAdmin.classList.replace('text-white', 'text-gray-400');
        btnAdmin.classList.replace('bg-white/10', 'hover:text-white');
        btnAdmin.classList.remove('shadow');
    } else {
        btnAdmin.classList.replace('text-gray-400', 'text-white');
        btnAdmin.classList.replace('hover:text-white', 'bg-white/10');
        btnAdmin.classList.add('shadow');
        
        btnStudent.classList.replace('text-white', 'text-gray-400');
        btnStudent.classList.replace('bg-white/10', 'hover:text-white');
        btnStudent.classList.remove('shadow');
    }
}

function handleEmailSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email-input').value.trim().toLowerCase();
    if (!emailInput.includes('@')) return alert("Correo inválido.");

    currentUserEmail = emailInput;
    const domain = emailInput.split('@')[1];
    
    currentClient = clientDatabase[domain] || {
        name: domain.split('.')[0].toUpperCase(),
        color: '#3b82f6', text: '#ffffff', logoText: domain.split('.')[0].toUpperCase()
    };
    
    applyCoBranding(currentClient);

    document.getElementById('step1-form').classList.replace('translate-x-0', '-translate-x-full');
    document.getElementById('step2-form').classList.replace('translate-x-full', 'translate-x-0');
}

function applyCoBranding(client) {
    document.documentElement.style.setProperty('--brand-color', client.color);
    document.documentElement.style.setProperty('--brand-text', client.text);
    document.getElementById('login-bg-overlay').classList.replace('opacity-0', 'opacity-100');
    document.getElementById('va-logo-login').classList.add('hidden');
    
    const clc = document.getElementById('client-logo-container');
    clc.classList.remove('hidden'); clc.classList.add('flex');
    document.getElementById('client-logo').textContent = client.logoText;
}

function resetLogin() {
    document.getElementById('step2-form').classList.replace('translate-x-0', 'translate-x-full');
    document.getElementById('step1-form').classList.replace('-translate-x-full', 'translate-x-0');
    document.documentElement.style.setProperty('--brand-color', '#ffffff');
    document.documentElement.style.setProperty('--brand-text', '#000000');
    document.getElementById('login-bg-overlay').classList.replace('opacity-100', 'opacity-0');
    document.getElementById('va-logo-login').classList.remove('hidden');
    document.getElementById('client-logo-container').classList.add('hidden');
    document.getElementById('client-logo-container').classList.remove('flex');
    document.getElementById('email-input').value = '';
    currentClient = null; currentUserEmail = ''; hasSeenWelcomeVideo = false;
}

function handleLoginComplete(event) {
    event.preventDefault();
    if (selectedRole === 'admin') {
        goToAdminDashboard();
    } else {
        goToDashboard();
    }
}

// --- Dashboard Admin (Dueño) ---
function goToAdminDashboard() {
    showView('view-admin-dashboard');
    if (currentClient) {
        document.getElementById('admin-brand-name').textContent = currentClient.name;
        document.getElementById('wl-company-name').value = currentClient.name;
        document.getElementById('wl-company-color').value = currentClient.color;
    }
}

function generateWhatsAppInvite() {
    const modal = document.getElementById('wa-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function updateWhiteLabel(event) {
    event.preventDefault();
    const name = document.getElementById('wl-company-name').value;
    const color = document.getElementById('wl-company-color').value;
    
    currentClient = { name: name, color: color, text: '#ffffff', logoText: name.toUpperCase() };
    document.documentElement.style.setProperty('--brand-color', color);
    document.getElementById('admin-brand-name').textContent = name;
    
    alert('Configuración aplicada. Tus empleados ahora verán esta identidad corporativa.');
}

// --- Dashboard Estudiante ---
function goToDashboard() {
    showView('view-dashboard');
    if (!currentClient) return;
    
    document.getElementById('dash-client-logo').textContent = currentClient.logoText;
    let prettyName = currentUserEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('dash-user-name').textContent = prettyName;
    document.getElementById('dash-avatar').textContent = prettyName.charAt(0);
    document.getElementById('dash-welcome').textContent = `¡Hola, ${prettyName}!`;
    document.getElementById('dash-msg').textContent = `Cursos preparados por ${currentClient.name} para ti.`;
    
    if (!hasSeenWelcomeVideo) {
        openWelcomeVideo();
        hasSeenWelcomeVideo = true;
    }
}

function openWelcomeVideo() {
    const modal = document.getElementById('welcome-modal');
    if(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const video = document.getElementById('welcome-video-player');
        if(video) video.play().catch(e => console.log('Autoplay blocked'));
    }
}

function closeWelcomeVideo() {
    const modal = document.getElementById('welcome-modal');
    if(modal) {
        const video = document.getElementById('welcome-video-player');
        if(video) video.pause();
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// --- Reproductor y Data Saver ---
function goToCourse(courseName) {
    showView('view-course-player');
    document.getElementById('course-title-display').textContent = courseName;
    document.getElementById('data-saver-toggle').checked = false; // Reset toggle
    document.getElementById('data-saver-indicator').classList.add('hidden');
    playVideo('1. Introducción');
}

function toggleDataSaver() {
    const toggle = document.getElementById('data-saver-toggle');
    const indicator = document.getElementById('data-saver-indicator');
    const videoElement = document.getElementById('course-video');
    
    if (toggle.checked) {
        indicator.classList.remove('hidden');
        // Simular bajar calidad
        if(!videoElement.paused) {
            videoElement.pause();
            setTimeout(() => { videoElement.play(); }, 500);
        }
    } else {
        indicator.classList.add('hidden');
    }
}

function playVideo(title) {
    document.getElementById('course-quiz').classList.replace('flex', 'hidden');
    const videoElement = document.getElementById('course-video');
    videoElement.classList.remove('hidden');
    videoElement.play().catch(e=>e);
}

function showQuiz(title) {
    const videoElement = document.getElementById('course-video');
    videoElement.pause();
    videoElement.classList.add('hidden');
    document.getElementById('course-quiz').classList.replace('hidden', 'flex');
}

// --- Lógica del Examen y Medalla ---
function submitExam() {
    const selected = document.querySelector('input[name="q1"]:checked');
    if (selected && selected.value === 'correct') {
        showAchievementModal();
    } else {
        alert("Respuesta incorrecta. Selecciona 'Usar el EPP correctamente'.");
    }
}

function showAchievementModal() {
    const modal = document.getElementById('achievement-modal');
    const bg = document.getElementById('ach-bg');
    const popup = modal.querySelector('.medal-popup');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        bg.classList.replace('opacity-0', 'opacity-100');
        popup.classList.add('show');
    }, 50);
}

function closeAchievementAndCertify() {
    const modal = document.getElementById('achievement-modal');
    modal.classList.replace('flex', 'hidden');
    
    let prettyName = currentUserEmail ? currentUserEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Estudiante Demo';
    viewCertificate(prettyName);
}

// --- Certificado y QR ---
let qrcode = null;

function viewCertificate(name) {
    showView('view-certificate');
    
    const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('cert-name').textContent = name;
    document.getElementById('cert-date').textContent = `Emitido: ${today}`;
    
    if (currentClient) {
        document.getElementById('cert-client-logo').textContent = currentClient.logoText;
        document.getElementById('cert-company-text').textContent = currentClient.name;
    }
    
    const certId = "VAC-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('cert-id-text').textContent = "ID: " + certId;
    
    // Generar URL falsa para el QR que apunta a nuestra propia plataforma
    const currentUrl = window.location.href.split('#')[0];
    const validationUrl = `${currentUrl}?validate=${certId}&name=${encodeURIComponent(name)}&company=${encodeURIComponent(currentClient?.name || 'Empresa Demo')}`;
    
    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = ''; // Limpiar anterior
    
    qrcode = new QRCode(qrContainer, {
        text: validationUrl,
        width: 96,
        height: 96,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    
    // Para la demo: hacer que hacer clic en el QR te lleve a la vista de validación simulada
    qrContainer.style.cursor = 'pointer';
    qrContainer.onclick = () => showValidationView(name, currentClient?.name || 'Empresa Demo', today);
}

function showValidationView(name, company, date) {
    showView('view-validation');
    document.getElementById('val-name').textContent = name;
    document.getElementById('val-company').textContent = company;
    document.getElementById('val-date').textContent = date || new Date().toLocaleDateString();
}

// --- Init: Revisar si venimos de un escaneo de QR y configurar animaciones ---
document.addEventListener('DOMContentLoaded', () => {
    // Configuración de Animaciones al Scroll (Apple Style)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Opcional: dejar de observar una vez que ya apareció
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Revisar Enrutamiento QR
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('validate')) {
        showValidationView(urlParams.get('name'), urlParams.get('company'), new Date().toLocaleDateString());
    } else {
        showView('view-landing');
    }
});
