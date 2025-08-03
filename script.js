// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Elementos da UI
    const loadingScreen = document.getElementById('loading-screen');
    const mainScreen = document.getElementById('main-screen');
    const onboardingModal = document.getElementById('onboarding-modal');
    const addWaterModal = document.getElementById('add-water-modal');
    
    const currentAmountEl = document.getElementById('current-amount');
    const dailyGoalEl = document.getElementById('daily-goal');
    const waterFillEl = document.getElementById('water-fill');
    const streakDaysEl = document.getElementById('streak-days');

    const addWaterBtn = document.getElementById('add-water-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const confirmAddBtn = document.getElementById('confirm-add-btn');
    const closeModalBtns = document.querySelectorAll('.close-btn');
    
    const goalAchievedAnimation = document.getElementById('goal-achieved-animation');

    // Estado do App
    let state = {
        dailyGoal: 2000,
        currentAmount: 0,
        streak: 0,
        lastLogDate: null,
        goalAchievedToday: false
    };

    // --- Funções Principais ---

    function updateUI() {
        currentAmountEl.textContent = state.currentAmount;
        dailyGoalEl.textContent = state.dailyGoal;
        streakDaysEl.textContent = state.streak;

        const percentage = Math.min((state.currentAmount / state.dailyGoal) * 100, 100);
        waterFillEl.style.height = `${percentage}%`;
        
        // Checa se a meta foi atingida
        if (percentage >= 100 && !state.goalAchievedToday) {
            state.goalAchievedToday = true;
            showGoalAchievedAnimation();
            updateStreak();
        }
    }

    function showGoalAchievedAnimation() {
        goalAchievedAnimation.classList.remove('hidden');
        setTimeout(() => {
            goalAchievedAnimation.classList.add('hidden');
        }, 3000); // A animação dura 3 segundos
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const lastDate = state.lastLogDate ? new Date(state.lastLogDate).toDateString() : null;

        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                state.streak++; // Continua a sequência
            } else {
                state.streak = 1; // Inicia uma nova sequência
            }
            state.lastLogDate = new Date().toISOString();
        }
    }

    function addWater(amount) {
        if (isNaN(amount) || amount <= 0) return;
        state.currentAmount += amount;
        saveState();
        updateUI();
    }

    // --- Persistência de Dados (LocalStorage) ---

    function saveState() {
        localStorage.setItem('hidratatecState', JSON.stringify(state));
    }

    function loadState() {
        const savedState = localStorage.getItem('hidratatecState');
        if (savedState) {
            state = JSON.parse(savedState);
            
            // Reseta o progresso diário se for um novo dia
            const today = new Date().toDateString();
            const lastDate = state.lastLogDate ? new Date(state.lastLogDate).toDateString() : null;
            if (lastDate !== today) {
                state.currentAmount = 0;
                state.goalAchievedToday = false;
            }
        }
    }

    // --- Event Listeners ---

    addWaterBtn.addEventListener('click', () => addWaterModal.classList.remove('hidden'));
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addWaterModal.classList.add('hidden');
        });
    });

    saveSettingsBtn.addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('user-weight').value);
        const activity = parseFloat(document.getElementById('activity-level').value);

        if (weight > 0) {
            // Fórmula simples: 35ml por kg, ajustado pela atividade
            state.dailyGoal = Math.round((weight * 35) * activity);
            onboardingModal.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            saveState();
            updateUI();
        } else {
            alert('Por favor, insira um peso válido.');
        }
    });

    confirmAddBtn.addEventListener('click', () => {
        const customAmount = parseInt(document.getElementById('custom-amount').value);
        if (customAmount > 0) {
            addWater(customAmount);
            document.getElementById('custom-amount').value = '';
            addWaterModal.classList.add('hidden');
        }
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            addWater(amount);
            addWaterModal.classList.add('hidden');
        });
    });

    // --- Inicialização ---

    function init() {
        loadState();
        
        // Simula um tempo de carregamento para exibir o logo
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            
            const isConfigured = localStorage.getItem('hidratatecState');
            if (!isConfigured) {
                onboardingModal.classList.remove('hidden');
            } else {
                mainScreen.classList.remove('hidden');
            }
            updateUI();
        }, 2000);
    }

    init();
});
