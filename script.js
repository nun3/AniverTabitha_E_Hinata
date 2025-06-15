document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos do DOM ---
    const detalhesFesta = document.getElementById('detalhesFesta');
    const videoAniversario = document.getElementById('videoAniversario');
    // Elementos para a interação do presente/vídeo
    const imagemDoPresente = document.getElementById('imagemDoPresente');
    const areaPresente = document.getElementById('areaPresente');
    const videoWrapper = document.getElementById('videoWrapper'); // Este é o .video-container que agora tem um ID

    const balloonGameSection = document.getElementById('balloonGameSection');
    const balloonsToPopTargetTextEl = document.getElementById('balloonsToPopTargetText');
    const balloonsPoppedCountTextEl = document.getElementById('balloonsPoppedCountText');
    const balloonsTargetCountTextEl = document.getElementById('balloonsTargetCountText');
    const balloonGameFeedbackEl = document.getElementById('balloonGameFeedback');
    const balloonGameProgress = document.getElementById('balloonGameProgress');
    const escudosColetados = document.getElementById('escudosColetados');
    const startGameBtn = document.getElementById('startGameBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const gameTimer = document.getElementById('gameTimer');
    const gameScore = document.getElementById('gameScore');
    const finalTime = document.getElementById('finalTime');

    // --- Configurações do Jogo ---
    const config = {
        totalEscudos: 5,
        escudoSize: { min: 60, max: 80 },
        escudoSpeed: { min: 3000, max: 5000 },
        maxActiveEscudos: 3,
        escudoCreationInterval: 2000
    };

    let escudosColetadosCount = 0;
    let gameActive = false;
    let escudoCreationInterval = null;
    let gameStartTime = 0;
    let gameTimerInterval = null;
    let bestTime = localStorage.getItem('bestTime') || Infinity;

    // Criar elemento de transição mágica
    const magicTransition = document.createElement('div');
    magicTransition.className = 'magic-transition';
    document.body.appendChild(magicTransition);

    // --- Inicialização do Jogo ---
    function initGame() {
        try {
            if (!balloonGameSection || !balloonGameFeedbackEl || !balloonGameProgress) {
                throw new Error('Elementos do jogo não encontrados');
            }

            // Limpar estado anterior
            cleanup();
            
            // Resetar contadores
            escudosColetadosCount = 0;
            gameActive = true;
            gameStartTime = Date.now();
            
            // Atualizar interface
            balloonGameFeedbackEl.textContent = 'Encontre os escudos! ✨';
            escudosColetados.textContent = '0';
            gameTimer.textContent = 'Tempo: 0s';
            gameScore.classList.add('hidden');
            
            // Iniciar timer
            startTimer();
            
            // Iniciar criação de escudos
            escudoCreationInterval = setInterval(createEscudo, config.escudoCreationInterval);
            
            // Esconder botão de iniciar
            startGameBtn.style.display = 'none';
            
            // Adicionar evento de clique na área do jogo
            balloonGameSection.addEventListener('click', handleGameAreaClick);
            
            console.log('Jogo iniciado com sucesso');
        } catch (error) {
            console.error('Erro ao iniciar o jogo:', error);
        }
    }

    // Função para criar escudo
    function createEscudo() {
        try {
            if (!gameActive) return;
            
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
            
            // Velocidade e direção
            const speed = 1 + Math.random() * 1.5;
            const direction = Math.random() > 0.5 ? 1 : -1;
            
            document.body.appendChild(escudo);
            
            // Animação do escudo
            let posY = -100;
            const animate = () => {
                if (!gameActive) {
                    escudo.remove();
                    return;
                }
                
                posY += speed;
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
            
            // Adiciona eventos de interação
            escudo.addEventListener('click', handleEscudoClick);
            escudo.addEventListener('touchstart', handleEscudoClick, { passive: true });
            
        } catch (error) {
            console.error('Erro ao criar escudo:', error);
        }
    }

    // Função para lidar com o clique no escudo
    function handleEscudoClick(event) {
        try {
            if (!gameActive) return;
            
            const escudo = event.target;
            
            // Toca o som de coleta
            playAudio('chicote.mp3');
            
            // Remove o escudo com efeito
            escudo.style.transform = 'scale(0)';
            escudo.style.opacity = '0';
            
            setTimeout(() => {
                escudo.remove();
            }, 300);
            
            // Atualiza o contador
            escudosColetadosCount++;
            escudosColetados.textContent = escudosColetadosCount;
            
            // Feedback visual
            balloonGameFeedbackEl.textContent = 'Escudo coletado! ✨';
            balloonGameFeedbackEl.style.color = '#FFD700';
            
            // Verifica vitória
            if (escudosColetadosCount >= config.totalEscudos) {
                showVictory();
            }
        } catch (error) {
            console.error('Erro ao processar clique no escudo:', error);
        }
    }

    // Função para mostrar vitória
    function showVictory() {
        try {
            gameActive = false;
            clearInterval(escudoCreationInterval);
            clearInterval(gameTimerInterval);
            
            // Calcula o tempo final
            const finalTimeValue = Math.floor((Date.now() - gameStartTime) / 1000);
            finalTime.textContent = finalTimeValue;
            
            // Atualiza o melhor tempo
            if (finalTimeValue < bestTime) {
                bestTime = finalTimeValue;
                localStorage.setItem('bestTime', bestTime);
                balloonGameFeedbackEl.textContent = `Novo recorde! ${finalTimeValue}s 🏆`;
            } else {
                balloonGameFeedbackEl.textContent = `Parabéns! Tempo: ${finalTimeValue}s ⭐`;
            }
            
            // Mostra o score
            gameScore.classList.remove('hidden');
            
            // Toca o som de vitória
            playAudio('chicote.mp3');
            
            // Ativa a transição mágica
            const magicTransition = document.getElementById('magicTransition');
            if (magicTransition) {
                magicTransition.classList.add('active');
            }
            
            // Mostra os detalhes da festa após um delay
            setTimeout(() => {
                detalhesFesta.classList.remove('hidden');
                balloonGameSection.style.display = 'none';
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao mostrar vitória:', error);
        }
    }

    // Função para iniciar o timer
    function startTimer() {
        gameTimerInterval = setInterval(() => {
            const currentTime = Math.floor((Date.now() - gameStartTime) / 1000);
            gameTimer.textContent = `Tempo: ${currentTime}s`;
        }, 1000);
    }

    // Função para limpar o estado do jogo
    function cleanup() {
        // Remove todos os escudos
        document.querySelectorAll('.shield').forEach(escudo => escudo.remove());
        
        // Limpa os intervalos
        clearInterval(escudoCreationInterval);
        clearInterval(gameTimerInterval);
        
        // Reseta o estado
        gameActive = false;
        escudosColetadosCount = 0;
    }

    // Manipular clique na área do jogo
    function handleGameAreaClick(e) {
        try {
            if (!gameActive) return;
            
            // Feedback visual do clique
            const clickEffect = document.createElement('div');
            clickEffect.className = 'click-effect';
            clickEffect.style.left = e.clientX + 'px';
            clickEffect.style.top = e.clientY + 'px';
            document.body.appendChild(clickEffect);
            
            setTimeout(() => {
                if (clickEffect.parentNode) {
                    clickEffect.parentNode.removeChild(clickEffect);
                }
            }, 500);
        } catch (error) {
            console.error('Erro ao manipular clique:', error);
        }
    }

    // --- Lógica para o Presente/Vídeo ---
    if (imagemDoPresente && areaPresente && videoWrapper && videoAniversario) {
        imagemDoPresente.addEventListener('click', () => {
            try {
            areaPresente.style.display = 'none';
            videoWrapper.style.display = 'block';

            requestAnimationFrame(() => {
                videoWrapper.classList.add('visible');
            });
            
            videoAniversario.muted = false;
            videoAniversario.play().catch(error => {
                    console.error("Erro ao tentar reproduzir o vídeo:", error);
                });
            } catch (error) {
                console.error('Erro ao mostrar vídeo:', error);
            }
        });

        videoAniversario.addEventListener('ended', () => {
            try {
            videoWrapper.classList.remove('visible');

            setTimeout(() => {
                    videoWrapper.style.display = 'none';
                    areaPresente.style.display = 'block';
                videoAniversario.currentTime = 0;
                }, 400);
            } catch (error) {
                console.error('Erro ao finalizar vídeo:', error);
            }
        });
    } else {
        // Log para ajudar a identificar se algum elemento do presente/vídeo não foi encontrado
        console.warn('Não foi possível inicializar a funcionalidade do presente/vídeo. Elementos ausentes:');
        if (!imagemDoPresente) console.warn('- imagemDoPresente não encontrada');
        if (!areaPresente) console.warn('- areaPresente não encontrado');
        if (!videoWrapper) console.warn('- videoWrapper não encontrado');
        if (!videoAniversario) console.warn('- videoAniversario não encontrado');
    }

    // --- Iniciar o jogo ---
    if (balloonGameSection) {
        console.log('Seção do jogo encontrada, iniciando...');
        initGame();
    } else {
        console.error('Seção do jogo não encontrada!');
    }

    // Limpar recursos ao sair
    window.addEventListener('beforeunload', cleanup);

    // Ajustar posição das estrelas quando a janela for redimensionada
    window.addEventListener('resize', () => {
        try {
            const shields = document.querySelectorAll('.shield');
            shields.forEach(shield => {
                const x = Math.random() * (window.innerWidth - shield.offsetWidth);
                const y = Math.random() * (window.innerHeight - shield.offsetHeight);
                shield.style.left = `${x}px`;
                shield.style.top = `${y}px`;
            });
        } catch (error) {
            console.error('Erro ao redimensionar escudos:', error);
        }
    });

    // Música de fundo
    let backgroundMusic;
    let transitionSound;

    // Inicializar a música quando a página carregar
    backgroundMusic = new Audio('./mixkit-epic-orchestra-transition-2290.mp3');
    backgroundMusic.volume = 0.2; // Volume em 20%
    backgroundMusic.loop = true; // Reproduzir em loop
    
    // Inicializar som de transição
    transitionSound = new Audio('./surpresa.mp3');
    transitionSound.volume = 0.3;
    
    // Tentar reproduzir a música quando a página carregar
    backgroundMusic.play().catch(error => {
        console.log('Erro ao iniciar música de fundo:', error);
    });

    // Função para mostrar o vídeo
    function showVideo() {
        try {
            const videoModal = document.getElementById('videoModal');
            const video = document.getElementById('surpresaVideo');
            const areaPresente = document.getElementById('areaPresente');
            const imagemDoPresente = document.getElementById('imagemDoPresente');
            
            if (videoModal && video && areaPresente && imagemDoPresente) {
                // Efeito mágico ao clicar no símbolo
                createMagicParticles(
                    imagemDoPresente.offsetLeft + imagemDoPresente.offsetWidth / 2,
                    imagemDoPresente.offsetTop + imagemDoPresente.offsetHeight / 2,
                    20
                );
                
                // Esconder a área do símbolo com efeito
                areaPresente.classList.add('hidden');
                
                // Mostrar o modal com efeito
                videoModal.classList.add('visible');
                
                // Resetar e reproduzir o vídeo
                video.currentTime = 0;
                video.play().catch(error => {
                    console.error('Erro ao reproduzir o vídeo:', error);
                });

                // Adicionar evento para quando o vídeo terminar
                video.addEventListener('ended', () => {
                    closeVideo();
                });
            }
        } catch (error) {
            console.error('Erro ao mostrar o vídeo:', error);
        }
    }

    function closeVideo() {
        const videoModal = document.getElementById('videoModal');
        const video = document.getElementById('surpresaVideo');
        const areaPresente = document.getElementById('areaPresente');
        
        if (videoModal && video && areaPresente) {
            // Parar o vídeo
            video.pause();
            
            // Tocar o som de transição
            if (!transitionSound.paused) {
                transitionSound.pause();
                transitionSound.currentTime = 0;
            }
            transitionSound.play().catch(error => console.log('Erro ao tocar som de transição:', error));

            // Esconder o modal com efeito
            videoModal.classList.remove('visible');
            
            // Mostrar a área do presente novamente após a transição
            setTimeout(() => {
                areaPresente.classList.remove('hidden');
            }, 300);
        }
    }

    // Criar partículas mágicas
    function createMagicParticles(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'magic-particle';
            
            // Tamanho aleatório
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Posição inicial
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Direção aleatória
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            document.body.appendChild(particle);
            
            // Remover após animação
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    }

    function createWonderWomanEffect(x, y) {
        const colors = ['#FFD700', '#0000FF', '#FF0000']; // Dourado, Azul e Vermelho da Mulher Maravilha
        const particles = 30;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'wonder-particle';
            
            // Posição inicial
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Cor aleatória do tema
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Tamanho aleatório
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Ângulo e velocidade aleatórios
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            // Adicionar ao DOM
            document.body.appendChild(particle);
            
            // Animar
            let posX = x;
            let posY = y;
            let opacity = 1;
            let rotation = 0;
            
            const animate = () => {
                posX += vx;
                posY += vy;
                opacity -= 0.02;
                rotation += 5;
                
                particle.style.transform = `translate(${posX - x}px, ${posY - y}px) rotate(${rotation}deg)`;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }

    function showPresente() {
        const areaPresente = document.getElementById('areaPresente');
        if (areaPresente) {
            areaPresente.classList.remove('hidden');
            areaPresente.style.display = 'block';
            areaPresente.style.opacity = '1';
            areaPresente.style.visibility = 'visible';
        }
    }

    // Adicionar evento de clique ao símbolo
    if (imagemDoPresente) {
        imagemDoPresente.addEventListener('click', showVideo);
    }

    // Adicionar evento de clique ao botão de fechar
    const closeButton = document.getElementById('closeModal');
    if (closeButton) {
        closeButton.addEventListener('click', closeVideo);
    }

    // Função para tocar um áudio
    function playAudio(filename) {
        const audio = new Audio(filename);
        audio.volume = 0.3;
        audio.play().catch(error => console.log('Erro ao tocar áudio:', error));
    }

    // Event Listeners
    startGameBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', () => {
        gameScore.classList.add('hidden');
        startGameBtn.style.display = 'block';
        balloonGameFeedbackEl.textContent = 'Clique em "Iniciar Jogo" para começar! ✨';
    });

    // Inicialização
    balloonGameFeedbackEl.textContent = 'Clique em "Iniciar Jogo" para começar! ✨';
});
