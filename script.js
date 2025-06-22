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
    const orientationModal = document.getElementById('orientationModal');

    // Garantir que detalhesFesta esteja oculta no carregamento
    if (detalhesFesta) {
        detalhesFesta.classList.add('hidden');
        console.log('detalhesFesta ocultada no carregamento');
    } else {
        console.error('detalhesFesta não encontrada');
    }

    // Garantir que gameScore esteja oculta no carregamento
    if (gameScore) {
        gameScore.classList.add('hidden');
        console.log('gameScore ocultada no carregamento');
    } else {
        console.error('gameScore não encontrada');
    }

    // --- Configurações do Jogo ---
    const config = {
        totalEscudos: 5,
        // escudoSize: { min: 60, max: 80 }, // Removido, tamanhos definidos em createEscudo
        // escudoSpeed: { min: 3000, max: 5000 }, // Removido, escudos não caem mais
        // maxActiveEscudos: 3, // Não implementado para limitar escudos ativos
        escudoCreationInterval: 2500, // Intervalo ligeiramente maior entre escudos: 2.5 segundos
        shieldLifetime: 8000 // Escudo desaparece após 8 segundos se não for clicado
    };

    let escudosColetadosCount = 0;
    let gameActive = false;
    let escudoCreationTimer = null; // Renomeado para clareza
    let gameStartTime = 0;
    let gameTimerInterval = null;
    let bestTime = localStorage.getItem('bestTime') || Infinity;

    // Elemento de transição mágica (usar o do HTML)
    const magicTransitionElement = document.getElementById('magicTransition');

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
            escudoCreationTimer = setInterval(createEscudo, config.escudoCreationInterval);
            
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
            if (!gameActive || !balloonGameSection) return;
            
            const escudo = document.createElement('img');
            escudo.src = 'escudo.png';
            escudo.className = 'shield';
            escudo.alt = 'Escudo da Mulher Maravilha';
            
            // Ajusta o tamanho baseado na largura da tela (escudos maiores)
            const screenWidth = window.innerWidth;
            let shieldSize;
            
            if (screenWidth <= 320) {
                shieldSize = 65; // Aumentado
            } else if (screenWidth <= 480) {
                shieldSize = 75; // Aumentado
            } else if (screenWidth <= 768) {
                shieldSize = 85; // Aumentado
            } else {
                shieldSize = 95; // Aumentado
            }
            
            escudo.style.width = `${shieldSize}px`;
            escudo.style.height = `${shieldSize}px`;
            
            // Posição aleatória dentro da área do jogo (balloonGameSection)
            const gameAreaRect = balloonGameSection.getBoundingClientRect();
            // Ajustar para o fato de que balloonGameSection pode não ser o offsetParent direto
            // e as coordenadas de gameAreaRect são relativas ao viewport.
            // Os escudos serão posicionados com 'absolute' dentro de balloonGameSection.
            const buffer = 10; // Pequena margem para não colar nas bordas
            const randomX = Math.random() * (balloonGameSection.offsetWidth - shieldSize - 2 * buffer) + buffer;
            const randomY = Math.random() * (balloonGameSection.offsetHeight - shieldSize - 2 * buffer) + buffer;

            escudo.style.position = 'absolute';
            escudo.style.left = `${randomX}px`;
            escudo.style.top = `${randomY}px`;
            
            // Estado inicial para a transição de surgimento
            escudo.style.opacity = '0';
            escudo.style.transform = 'scale(0.7)';
            
            balloonGameSection.appendChild(escudo); // Adicionar à área do jogo
            
            // Forçar reflow para garantir que a transição ocorra
            void escudo.offsetHeight; 
            
            // Aplicar estado final para a transição
            escudo.style.opacity = '1';
            escudo.style.transform = 'scale(1)';

            // Remover escudo após um tempo se não for coletado
            const lifetimeTimer = setTimeout(() => {
                if (escudo.parentNode) { // Verifica se ainda está no DOM
                    escudo.style.opacity = '0';
                    escudo.style.transform = 'scale(0.7)';
                    setTimeout(() => escudo.remove(), 300); // Espera a transição de sumiço
                }
            }, config.shieldLifetime);
            
            // Adiciona eventos de interação
            escudo.addEventListener('click', (e) => {
                handleEscudoClick(e, lifetimeTimer); // Passa o timer para limpar
            });
            escudo.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleEscudoClick(e, lifetimeTimer); // Passa o timer para limpar
            }, { passive: false });
            
        } catch (error) {
            console.error('Erro ao criar escudo:', error);
        }
    }

    // Função para lidar com o clique no escudo
    function handleEscudoClick(event, lifetimeTimer) { // Adicionado lifetimeTimer
        try {
            const escudo = event.target;
            if (!gameActive || escudo.dataset.clicked === 'true') {
                return;
            }
            escudo.dataset.clicked = 'true'; 

            clearTimeout(lifetimeTimer); // Limpa o timer de vida do escudo
            
            playAudio('chicote.mp3');
            
            // Efeito de coleta visual
            escudo.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            escudo.style.transform = 'scale(1.2)'; 
            escudo.style.opacity = '0.5';

            setTimeout(() => {
                escudo.style.transform = 'scale(0)';
                escudo.style.opacity = '0';
                setTimeout(() => {
                    escudo.remove();
                }, 150);
            }, 150);
            
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
            clearInterval(escudoCreationTimer);
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
            if (magicTransitionElement) {
                magicTransitionElement.classList.add('active');
            }
            
            // Mostra os detalhes da festa após um delay
            setTimeout(() => {
                detalhesFesta.classList.remove('hidden');
                // Alterado para usar a classe que mantém o espaço do layout
                balloonGameSection.classList.add('hidden-layout');
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
        clearInterval(escudoCreationTimer);
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
        // initGame(); // Comente ou remova esta linha para o jogo iniciar apenas pelo botão
    } else {
        console.error('Seção do jogo não encontrada!');
    }

    // Limpar recursos ao sair
    window.addEventListener('beforeunload', cleanup);

    // Ajustar posição das estrelas quando a janela for redimensionada
    window.addEventListener('resize', () => {
        // A lógica de reposicionamento de escudos no resize foi removida.
        // Novos escudos serão criados dentro dos limites corretos da área do jogo.
        // Escudos existentes não serão afetados pelo resize, o que é aceitável
        // dado o seu tempo de vida.
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
        
        if (videoModal && video) {
            video.pause();
            videoModal.classList.remove('visible');
            document.body.classList.remove('modal-open');
            
            // Tocar o som de transição
            if (transitionSound && !transitionSound.paused) {
                transitionSound.pause();
                transitionSound.currentTime = 0;
            }
            if(transitionSound) {
                transitionSound.play().catch(error => console.log('Erro ao tocar som de transição:', error));
            }
        }
    }

    // --- Nova Lógica de Vídeo com Checagem de Orientação ---

    function handleVideoRequest() {
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        
        if (isLandscape) {
            openVideoPlayer();
        } else {
            orientationModal.classList.add('visible');
            document.body.classList.add('modal-open');
        }
    }

    function openVideoPlayer() {
        if (orientationModal) orientationModal.classList.remove('visible');
        
        const videoModal = document.getElementById('videoModal');
        const video = document.getElementById('surpresaVideo');

        if (videoModal && video) {
            videoModal.classList.add('visible');
            document.body.classList.add('modal-open');
            video.currentTime = 0;
            video.play().catch(error => {
                console.error('Erro ao reproduzir o vídeo:', error);
            });
        }
    }
    
    // Listener para mudança de orientação
    const landscapeMatcher = window.matchMedia("(orientation: landscape)");
    
    function orientationChangeListener(e) {
        // Se a tela virou para paisagem e o modal de aviso está visível
        if (e.matches && orientationModal && orientationModal.classList.contains('visible')) {
            openVideoPlayer();
        }
        
        // Opcional: se virar de volta para retrato com o vídeo aberto, fecha o vídeo e mostra o aviso
        const videoModal = document.getElementById('videoModal');
        if (!e.matches && videoModal && videoModal.classList.contains('visible')) {
            closeVideo();
            orientationModal.classList.add('visible');
            document.body.classList.add('modal-open');
        }
    }
    
    landscapeMatcher.addEventListener('change', orientationChangeListener);

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
        imagemDoPresente.addEventListener('click', handleVideoRequest);
    }

    // Adicionar evento de clique ao botão de fechar
    const closeButton = document.getElementById('closeModal');
    if (closeButton) {
        closeButton.addEventListener('click', closeVideo);
    }

    // Adicionar evento para quando o vídeo terminar
    const video = document.getElementById('surpresaVideo');
    if(video) {
        video.addEventListener('ended', closeVideo);
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
        
        // Restaurar a visibilidade da seção do jogo
        balloonGameSection.classList.remove('hidden-layout');
    });

    // Inicialização
    balloonGameFeedbackEl.textContent = 'Clique em "Iniciar Jogo" para começar! ✨';
});
