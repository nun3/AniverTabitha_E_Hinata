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

    // --- Configurações do Jogo ---
    const config = {
        totalStars: 5,
        starColors: ['#FFD700', '#FFA500', '#FFE5B4'],
        starSize: { min: 40, max: 60 },
        starSpeed: { min: 3000, max: 5000 },
        maxActiveStars: 3,
        starCreationInterval: 2000
    };

    let balloonsPopped = 0;
    const targetBalloons = 5;
    let starCreationInterval = null;
    let gameActive = false;

    // Criar elemento de transição mágica
    const magicTransition = document.createElement('div');
    magicTransition.className = 'magic-transition';
    document.body.appendChild(magicTransition);

    // --- Inicialização do Jogo ---
    function initGame() {
        try {
            const gameSection = document.getElementById('balloonGameSection');
            const feedback = document.getElementById('balloonGameFeedback');
            const progress = document.getElementById('balloonGameProgress');
            
            if (!gameSection || !feedback || !progress) {
                throw new Error('Elementos do jogo não encontrados');
            }

            // Limpar estado anterior
            cleanup();
            
            // Resetar contadores
            balloonsPopped = 0;
            gameActive = true;
            
            // Atualizar interface
            feedback.textContent = 'Ajude a Mulher Maravilha a coletar seus escudos!';
            progress.textContent = `Escudos coletados: ${balloonsPopped}/${targetBalloons}`;
            
            // Iniciar criação de escudos
            starCreationInterval = setInterval(createStar, 2000);
            
            // Adicionar evento de clique na área do jogo
            gameSection.addEventListener('click', handleGameAreaClick);
            
            console.log('Jogo iniciado com sucesso');
        } catch (error) {
            console.error('Erro ao iniciar o jogo:', error);
        }
    }

    // Criar escudo
    function createStar() {
        try {
            if (!gameActive) return;

            const shield = document.createElement('div');
            shield.className = 'shield';
            
            // Tamanho aleatório entre 40 e 80 pixels
            const size = Math.random() * 40 + 40;
            shield.style.width = `${size}px`;
            shield.style.height = `${size}px`;
            
            // Posição aleatória
            const maxX = window.innerWidth - size;
            const maxY = window.innerHeight - size;
            shield.style.left = `${Math.random() * maxX}px`;
            shield.style.top = `${Math.random() * maxY}px`;
            
            // Adicionar ao DOM
            document.body.appendChild(shield);
            
            // Adicionar evento de clique
            shield.addEventListener('click', (e) => {
                e.stopPropagation();
                collectStar(shield);
            });
            
            // Remover após 5 segundos se não for coletado
            setTimeout(() => {
                if (shield.parentNode) {
                    removeStar(shield);
                }
            }, 5000);
            
            console.log('Escudo criado');
        } catch (error) {
            console.error('Erro ao criar escudo:', error);
        }
    }

    // Coletar escudo
    function collectStar(shield) {
        try {
            if (!gameActive) return;

            // Efeito de coleta
            shield.style.transform = 'scale(1.5) rotate(180deg)';
            shield.style.opacity = '0';
            
            // Som de coleta
            const collectSound = new Audio('./escudo.mp3');
            collectSound.volume = 0.3;
            collectSound.play().catch(error => console.log('Erro ao tocar som:', error));
            
            // Atualizar contador
            balloonsPopped++;
            document.getElementById('balloonGameProgress').textContent = 
                `Escudos coletados: ${balloonsPopped}/${targetBalloons}`;
            
            // Feedback visual
            const feedback = document.getElementById('balloonGameFeedback');
            feedback.textContent = 'Escudo coletado! ✨';
            feedback.style.color = '#FFD700';
            
            // Remover escudo após animação
            setTimeout(() => {
                if (shield.parentNode) {
                    shield.parentNode.removeChild(shield);
                }
            }, 300);
            
            // Verificar vitória
            if (balloonsPopped >= targetBalloons) {
                showVictory();
            }
            
            console.log('Escudo coletado');
        } catch (error) {
            console.error('Erro ao coletar escudo:', error);
        }
    }

    // Remover escudo
    function removeStar(shield) {
        try {
            if (shield.parentNode) {
                shield.style.opacity = '0';
                shield.style.transform = 'scale(0.5) rotate(-180deg)';
                
                setTimeout(() => {
                    if (shield.parentNode) {
                        shield.parentNode.removeChild(shield);
                    }
                }, 300);
            }
        } catch (error) {
            console.error('Erro ao remover escudo:', error);
        }
    }

    // Mostrar vitória
    function showVictory() {
        try {
            gameActive = false;
            clearInterval(starCreationInterval);
            
            // Feedback de vitória
            const feedback = document.getElementById('balloonGameFeedback');
            feedback.textContent = 'Parabéns! Você coletou todos os escudos! 🎉';
            feedback.style.color = '#FFD700';
            
            // Criar efeito de confete
            createConfetti();
            
            // Ativar transição mágica
            const magicTransition = document.getElementById('magicTransition');
            if (magicTransition) {
                magicTransition.classList.add('active');
                
                // Criar partículas mágicas no centro da tela
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                createMagicParticles(centerX, centerY, 30);
                
                // Som mágico
                const magicSound = new Audio('./chicote.mp3');
                magicSound.volume = 0.3;
                magicSound.play().catch(error => console.log('Erro ao tocar som mágico:', error));
            }
            
            // Mostrar a área de detalhes da festa
            const detalhesFesta = document.getElementById('detalhesFesta');
            const gameSection = document.getElementById('balloonGameSection');
            
            if (detalhesFesta && gameSection) {
                // Esconder a área do jogo com efeito
                gameSection.style.opacity = '0';
                gameSection.style.transform = 'translateY(-20px) scale(0.9)';
                gameSection.style.filter = 'blur(5px)';
                
                setTimeout(() => {
                    gameSection.style.display = 'none';
                    
                    // Mostrar detalhes da festa com efeito mágico
                    detalhesFesta.classList.remove('hidden');
                    detalhesFesta.classList.add('visible');
                    detalhesFesta.style.display = 'block';
                    
                    // Criar mais partículas mágicas
                    createMagicParticles(centerX, centerY, 20);
                }, 500);
            }
            
            console.log('Vitória alcançada e detalhes da festa revelados com efeitos mágicos');
        } catch (error) {
            console.error('Erro ao mostrar vitória:', error);
        }
    }

    // Criar efeito de confete
    function createConfetti() {
        try {
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animationDelay = Math.random() * 3 + 's';
                confetti.style.backgroundColor = ['#FFD700', '#FF0000', '#0000FF'][Math.floor(Math.random() * 3)];
                document.body.appendChild(confetti);
                
                // Remover após animação
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Erro ao criar confete:', error);
        }
    }

    // Limpar recursos
    function cleanup() {
        try {
            clearInterval(starCreationInterval);
            const shields = document.querySelectorAll('.shield');
            shields.forEach(shield => {
                if (shield.parentNode) {
                    shield.parentNode.removeChild(shield);
                }
            });
        } catch (error) {
            console.error('Erro ao limpar recursos:', error);
        }
    }

    // Manipulador de clique na área do jogo
    function handleGameAreaClick(e) {
        if (e.target.id === 'balloonGameSection') {
            const feedback = document.getElementById('balloonGameFeedback');
            feedback.textContent = 'Tente clicar nos escudos! 🛡️';
            feedback.style.color = '#FFD700';
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
});
