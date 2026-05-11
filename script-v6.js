const clientDatabase = {
    'apple.com': { name: 'Apple', color: '#A2AAAD', text: '#ffffff', logoText: ' Apple' },
    'tesla.com': { name: 'Tesla', color: '#E31937', text: '#ffffff', logoText: 'T E S L A' },
    'google.com': { name: 'Google', color: '#4285F4', text: '#ffffff', logoText: 'G O O G L E' }
};

let currentClient = { name: 'Empresa Demo', color: '#3b82f6', text: '#ffffff', logoText: 'EMPRESA' };
let currentUserEmail = '';
let hasSeenWelcomeVideo = false;
let selectedRole = 'student'; 

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    const target = document.getElementById(viewId);
    if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToLanding() { resetLogin(); showView('view-landing'); }
function goToLogin() { showView('view-login'); }

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
    
    // IMPORTANTE: Resetear el rol para evitar bugs
    selectRole('student');
    currentClient = null; currentUserEmail = ''; hasSeenWelcomeVideo = false;
}

async function handleLoginComplete(event) {
    event.preventDefault();
    const password = document.getElementById('password-input').value;
    const btn = document.getElementById('btn-final-login');
    const originalText = btn.textContent;
    btn.textContent = 'Cargando...';
    btn.disabled = true;

    try {
        if (!window.firebaseAuth) throw new Error("Firebase no está inicializado.");
        const { auth, signInWithEmailAndPassword } = window.firebaseAuth;
        const userCredential = await signInWithEmailAndPassword(auth, currentUserEmail, password);
        console.log("Usuario logueado:", userCredential.user.email);

        if (selectedRole === 'admin') {
            goToAdminDashboard();
        } else {
            goToDashboard();
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Error al iniciar sesión: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function handleRegister() {
    const password = document.getElementById('password-input').value;
    if (!password) {
        return alert("Por favor ingresa una contraseña para registrarte.");
    }

    try {
        if (!window.firebaseAuth) throw new Error("Firebase no está inicializado.");
        const { auth, createUserWithEmailAndPassword } = window.firebaseAuth;
        const userCredential = await createUserWithEmailAndPassword(auth, currentUserEmail, password);
        console.log("Usuario registrado:", userCredential.user.email);
        alert("¡Registro exitoso! Iniciando sesión...");

        if (selectedRole === 'admin') {
            goToAdminDashboard();
        } else {
            goToDashboard();
        }
    } catch (error) {
        console.error("Error al registrar:", error);
        alert("Error al registrar: " + error.message);
    }
}

async function handleGoogleLogin() {
    try {
        if (!window.firebaseAuth) throw new Error("Firebase no está inicializado.");
        const { auth, provider, signInWithPopup } = window.firebaseAuth;
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Google Login exitoso:", user.email);
        
        currentUserEmail = user.email;
        const domain = currentUserEmail.split('@')[1];
        
        currentClient = clientDatabase[domain] || {
            name: domain.split('.')[0].toUpperCase(),
            color: '#3b82f6', text: '#ffffff', logoText: domain.split('.')[0].toUpperCase()
        };
        applyCoBranding(currentClient);

        // Simulamos el paso al dashboard
        if (selectedRole === 'admin') {
            goToAdminDashboard();
        } else {
            goToDashboard();
        }
    } catch (error) {
        console.error("Error con Google Login:", error);
        alert("Error al iniciar sesión con Google: " + error.message);
    }
}

// --- Dashboard Admin ---
let adminChartInstance = null;

function goToAdminDashboard() {
    showView('view-admin-dashboard');
    if (currentClient) {
        document.getElementById('admin-brand-name').textContent = currentClient.name;
        document.getElementById('wl-company-name').value = currentClient.name;
        document.getElementById('wl-company-color').value = currentClient.color;
    }
    
    // Iniciar Gráfica si no existe
    setTimeout(() => {
        const ctx = document.getElementById('adminChart');
        if (ctx && !adminChartInstance) {
            adminChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                    datasets: [{
                        label: 'Módulos Completados',
                        data: [12, 19, 35, 50],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { display: false } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }, 100);
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
    
    alert('Configuración aplicada en toda la plataforma y certificados.');
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
    document.getElementById('data-saver-toggle').checked = false;
    document.getElementById('data-saver-indicator').classList.add('hidden');
    playVideo('1. Introducción al Curso');
}

function toggleDataSaver() {
    const toggle = document.getElementById('data-saver-toggle');
    const indicator = document.getElementById('data-saver-indicator');
    const videoElement = document.getElementById('course-video');
    
    if (toggle.checked) {
        indicator.classList.remove('hidden');
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
        alert("Respuesta incorrecta. Selecciona la respuesta que fomenta el uso del EPP en todo momento.");
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
    
    const currentUrl = window.location.href.split('#')[0];
    const validationUrl = `${currentUrl}?validate=${certId}&name=${encodeURIComponent(name)}&company=${encodeURIComponent(currentClient?.name || 'Empresa Demo')}`;
    
    const qrContainer = document.getElementById('qrcode-container');
    qrContainer.innerHTML = ''; 
    
    qrcode = new QRCode(qrContainer, {
        text: validationUrl,
        width: 96,
        height: 96,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    
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
    // IntersectionObserver para Apple Style Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // ================= APPLE SCROLL SEQUENCE LOGIC =================
    window.addEventListener('scroll', () => {
        const seq = document.getElementById('scroll-sequence');
        if (!seq) return;
        
        const rect = seq.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        let progress = 0;
        if (rect.top <= 0) {
            progress = Math.abs(rect.top) / (rect.height - windowHeight);
            progress = Math.max(0, Math.min(1, progress));
        }
        
        const device = document.getElementById('seq-device');
        const text1 = document.getElementById('seq-text-1');
        const text2 = document.getElementById('seq-text-2');
        const text3 = document.getElementById('seq-text-3');
        
        if (rect.top > windowHeight) {
            // Fuera de vista (abajo)
            device.style.transform = `rotateX(50deg) scale(0.7) translateY(200px)`;
            device.style.opacity = '0';
        } else if (rect.top > 0) {
            // Entrando a la vista
            device.style.opacity = '1';
            device.style.transform = `rotateX(50deg) scale(0.7) translateY(200px)`;
            text1.style.opacity = 0; text2.style.opacity = 0; text3.style.opacity = 0;
        } else if (progress < 1) {
            // Durante el Sequence (0 a 1)
            device.style.opacity = '1';
            
            // FASE 1: Entra y se endereza (Progress 0 a 0.3)
            let rotationX = 50;
            let scale = 0.7;
            let translateY = 200;
            
            if (progress < 0.3) {
                let p1 = progress / 0.3; // 0 a 1
                rotationX = 50 - (p1 * 40); // 50deg a 10deg
                scale = 0.7 + (p1 * 0.2); // 0.7 a 0.9
                translateY = 200 - (p1 * 200); // 200 a 0
                text1.style.opacity = Math.sin(p1 * Math.PI); // Aparece y desaparece
                text2.style.opacity = 0;
                text3.style.opacity = 0;
            } 
            // FASE 2: Totalmente de frente y Marca Blanca (Progress 0.3 a 0.7)
            else if (progress >= 0.3 && progress < 0.7) {
                let p2 = (progress - 0.3) / 0.4;
                rotationX = 10 - (p2 * 10); // 10deg a 0deg
                scale = 0.9 + (p2 * 0.1); // 0.9 a 1.0
                translateY = 0;
                text1.style.opacity = 0;
                text2.style.opacity = Math.sin(p2 * Math.PI); // Aparece y desaparece
                text3.style.opacity = 0;
                // Efecto de marca blanca: Inyectar un color
                if (p2 > 0.5) {
                    device.style.boxShadow = `0 0 100px rgba(227, 25, 55, 0.3)`; // Rojo Tesla
                } else {
                    device.style.boxShadow = `0 0 80px rgba(59, 130, 246, 0.15)`; // Azul
                }
            }
            // FASE 3: Se hace gigante hacia la cámara (Progress 0.7 a 1)
            else {
                let p3 = (progress - 0.7) / 0.3;
                rotationX = 0 - (p3 * 10); // 0deg a -10deg
                scale = 1.0 + (p3 * 0.5); // 1.0 a 1.5
                translateY = 0 + (p3 * 100); 
                device.style.opacity = 1 - p3; // Se desvanece
                text1.style.opacity = 0;
                text2.style.opacity = 0;
                text3.style.opacity = Math.sin(p3 * Math.PI); // Aparece y desaparece
            }
            
            device.style.transform = `rotateX(${rotationX}deg) scale(${scale}) translateY(${translateY}px)`;
            
        } else {
            // Salió por arriba
            device.style.opacity = '0';
        }
    });

    // Lógica para Calculadora de ROI
    window.updateROI = function() {
        const slider = document.getElementById('roi-slider');
        if(!slider) return;
        const val = parseInt(slider.value);
        document.getElementById('calc-emp-val').textContent = val;
        
        // 48 horas promedio por empleado
        const hours = val * 48;
        document.getElementById('calc-hours').textContent = hours.toLocaleString() + ' h';
        
        // $240 USD de ahorro estimado por empleado (costos operativos, errores, tiempo capacitador)
        const money = val * 240;
        document.getElementById('calc-money').textContent = '$' + money.toLocaleString() + ' USD';
    };

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('validate')) {
        showValidationView(urlParams.get('name'), urlParams.get('company'), new Date().toLocaleDateString());
    } else {
        showView('view-landing');
    }
});
