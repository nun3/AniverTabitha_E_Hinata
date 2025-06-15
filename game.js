// --- Elementos do DOM ---
const detalhesFesta = document.getElementById('detalhesFesta');
const videoAniversario = document.getElementById('videoAniversario');
const imagemDoPresente = document.getElementById('imagemDoPresente');
const areaPresente = document.getElementById('areaPresente');
const videoWrapper = document.getElementById('videoWrapper');
const balloonGameSection = document.getElementById('balloonGameSection');
const balloonGameFeedbackEl = document.getElementById('balloonGameFeedback');
const balloonGameProgress = document.getElementById('balloonGameProgress');
const escudosColetados = document.getElementById('escudosColetados');
const startGameButton = document.getElementById('startGameButton');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const timeLeftEl = document.getElementById('timeLeft');
const timeProgressEl = document.getElementById('timeProgress');

// --- Configurações do Jogo ---
const config = {
    gameDuration: 30, // segundos
    shieldPoints: 100,
    maxCombo: 5,
    comboTimeout: 2000, // milissegundos
    powerUpChance: 0.1, // 10% de chance de spawnar power-up
    powerUpDuration: 5000, // 5 segundos
    shieldSpeed: { min: 2, max: 4 },
    shieldSpawnInterval: 1000 // 1 segundo
};

// --- Estado do Jogo ---
let gameState = {
    score: 0,
    combo: 1,
    timeLeft: config.gameDuration,
    isPlaying: false,
    comboTimeout: null,
    gameInterval: null,
    powerUps: {
        slowMotion: false,
        doublePoints: false
    }
};

// --- Funções do Jogo ---
function resetGameState() {
    gameState = {
        score: 0,
        combo: 1,
        timeLeft: config.gameDuration,
        isPlaying: true,
        comboTimeout: null,
        gameInterval: null,
        powerUps: {
            slowMotion: false,
            doublePoints: false
        }
    };
}

function updateUI() {
    scoreEl.textContent = gameState.score;
    comboEl.textContent = `${gameState.combo}x`;
    timeLeftEl.textContent = `${gameState.timeLeft}s`;
    timeProgressEl.style.width = `${(gameState.timeLeft / config.gameDuration) * 100}%`;
}

function startGameTimer() {
    gameState.gameInterval = setInterval(() => {
        gameState.timeLeft--;
        updateUI();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function startShieldSpawner() {
    setInterval(() => {
        if (gameState.isPlaying) {
            createEscudo();
            // Chance de spawnar power-up
            if (Math.random() < config.powerUpChance) {
                createPowerUp();
            }
        }
    }, config.shieldSpawnInterval);
}

function createEscudo() {
    try {
        const escudo = document.createElement('img');
        escudo.src = 'escudo.png';
        escudo.className = 'shield';
        escudo.alt = 'Escudo da Mulher Maravilha';
        
        // Ajusta o tamanho baseado na largura da tela
        const screenWidth = window.innerWidth;
        let shieldSize;
        
        if (screenWidth <= 320) {
            shieldSize = 45;
        } else if (screenWidth <= 480) {
            shieldSize = 50;
        } else if (screenWidth <= 768) {
            shieldSize = 55;
        } else {
            shieldSize = 60;
        }
        
        escudo.style.width = `${shieldSize}px`;
        escudo.style.height = `${shieldSize}px`;
        
        // Posição inicial aleatória
        const startX = Math.random() * (window.innerWidth - shieldSize);
        escudo.style.left = `${startX}px`;
        escudo.style.top = '-100px';
        
        // Velocidade baseada no power-up de câmera lenta
        const baseSpeed = gameState.powerUps.slowMotion ? 
            config.shieldSpeed.min * 0.5 : 
            config.shieldSpeed.min + Math.random() * (config.shieldSpeed.max - config.shieldSpeed.min);
        
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        document.body.appendChild(escudo);
        
        // Animação do escudo
        let posY = -100;
        const animate = () => {
            if (!gameState.isPlaying) {
                escudo.remove();
                return;
            }
            
            posY += baseSpeed;
            const posX = startX + Math.sin(posY * 0.01) * 30 * direction;
            
            escudo.style.top = `${posY}px`;
            escudo.style.left = `${posX}px`;
            
            if (posY > window.innerHeight) {
                escudo.remove();
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
        
        escudo.addEventListener('click', handleEscudoClick);
        escudo.addEventListener('touchstart', handleEscudoClick, { passive: true });
        
    } catch (error) {
        console.error('Erro ao criar escudo:', error);
    }
}

function createPowerUp() {
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    
    // Escolher tipo de power-up aleatoriamente
    const type = Math.random() < 0.5 ? 'slowMotion' : 'doublePoints';
    powerUp.textContent = type === 'slowMotion' ? '⏱️' : '2x';
    powerUp.dataset.type = type;
    
    // Posição inicial aleatória
    const startX = Math.random() * (window.innerWidth - 40);
    powerUp.style.left = `${startX}px`;
    powerUp.style.top = '-50px';
    
    document.body.appendChild(powerUp);
    
    // Animação do power-up
    let posY = -50;
    const speed = 2;
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    const animate = () => {
        if (!gameState.isPlaying) {
            powerUp.remove();
            return;
        }
        
        posY += speed;
        const posX = startX + Math.sin(posY * 0.01) * 20 * direction;
        
        powerUp.style.top = `${posY}px`;
        powerUp.style.left = `${posX}px`;
        
        if (posY > window.innerHeight) {
            powerUp.remove();
        } else {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
    
    powerUp.addEventListener('click', () => handlePowerUpClick(type));
    powerUp.addEventListener('touchstart', () => handlePowerUpClick(type), { passive: true });
}

function handlePowerUpClick(type) {
    if (!gameState.isPlaying) return;
    
    gameState.powerUps[type] = true;
    
    // Feedback visual
    const feedback = type === 'slowMotion' ? 
        'Câmera Lenta Ativada! ⏱️' : 
        'Pontos Dobrados! 2x';
    balloonGameFeedbackEl.textContent = feedback;
    
    // Remover power-up após duração
    setTimeout(() => {
        gameState.powerUps[type] = false;
        balloonGameFeedbackEl.textContent = 'Continue coletando escudos! ✨';
    }, config.powerUpDuration);
}

function handleEscudoClick(event) {
    try {
        if (!gameState.isPlaying) return;
        
        const escudo = event.target;
        
        // Toca o som de coleta
        playAudio('chicote.mp3');
        
        // Remove o escudo com efeito
        escudo.style.transform = 'scale(0)';
        escudo.style.opacity = '0';
        
        setTimeout(() => {
            escudo.remove();
        }, 300);
        
        // Atualiza pontuação e combo
        const points = config.shieldPoints * gameState.combo * (gameState.powerUps.doublePoints ? 2 : 1);
        gameState.score += points;
        
        // Atualiza combo
        clearTimeout(gameState.comboTimeout);
        gameState.combo = Math.min(gameState.combo + 1, config.maxCombo);
        comboEl.classList.add('combo-active');
        
        gameState.comboTimeout = setTimeout(() => {
            gameState.combo = 1;
            comboEl.classList.remove('combo-active');
        }, config.comboTimeout);
        
        // Atualiza UI
        updateUI();
        
        // Feedback visual
        balloonGameFeedbackEl.textContent = `+${points} pontos! ✨`;
        
    } catch (error) {
        console.error('Erro ao processar clique no escudo:', error);
    }
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameInterval);
    
    // Feedback final
    balloonGameFeedbackEl.textContent = `Fim de jogo! Pontuação final: ${gameState.score} ✨`;
    
    // Mostrar detalhes da festa após um delay
    setTimeout(() => {
        showVictory();
    }, 2000);
}

// --- Inicialização do Jogo ---
function initGame() {
    try {
        if (!balloonGameSection || !balloonGameFeedbackEl || !balloonGameProgress) {
            throw new Error('Elementos do jogo não encontrados');
        }

        // Resetar estado do jogo
        resetGameState();
        
        // Atualizar interface
        updateUI();
        
        // Iniciar criação de escudos
        startShieldSpawner();
        
        // Iniciar contador de tempo
        startGameTimer();
        
        // Adicionar evento de clique na área do jogo
        balloonGameSection.addEventListener('click', handleGameAreaClick);
        
        console.log('Jogo iniciado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o jogo:', error);
    }
}

// --- Event Listeners ---
if (startGameButton) {
    startGameButton.addEventListener('click', () => {
        startGameButton.style.display = 'none';
        initGame();
    });
}

// --- Inicialização ---
if (balloonGameSection) {
    console.log('Seção do jogo encontrada, aguardando início...');
} else {
    console.error('Seção do jogo não encontrada!');
} 