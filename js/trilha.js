document.addEventListener('DOMContentLoaded', () => {
    const PROGRESS_KEY = 'trilhaAprendizadoProgresso';
    const allModules = [
        { id: 'partials/trilha/0-pista-decolagem.html', title: 'Pista de Decolagem', description: 'História, valores e a força da equipe.' },
        { id: 'partials/trilha/1-auto-arremate.html', title: 'Auto Arremate: Pole Position', description: 'Dominando o universo dos veículos leves.' },
        { id: 'partials/trilha/2-arremaq.html', title: 'Arremaq: Força Bruta', description: 'A potência dos gigantes do agro e construção.' },
        { id: 'partials/trilha/3-mapeando-campeoes.html', title: 'Mapeando os Campeões', description: 'Nossos Clientes Ideais (ICPs & Personas).' }
    ];
    const quizzes = {
        'partials/trilha/0-pista-decolagem.html': [
            { question: "Qual o principal valor que une as equipes da Auto Arremate e Arremaq?", options: ["Inovação", "Competitividade", "Espírito de Equipe", "Lucro"], correct: 2 },
            { question: "A cultura da empresa é comparada a qual ambiente?", options: ["Biblioteca", "Equipe de Fórmula 1", "Laboratório", "Orquestra"], correct: 1 }
        ]
    };

    const modulesGrid = document.getElementById('modules-grid');
    const trilhaContainer = document.getElementById('trilha-container');
    const conteudoWrapper = document.getElementById('conteudo-modulo-wrapper');
    const conteudoDiv = document.getElementById('conteudo-modulo-aqui');
    const quizContainer = document.getElementById('quiz-container');
    const btnFecharFoco = document.getElementById('btn-fechar-foco');

    const synth = new Tone.Synth().toDestination();
    const playClickSound = () => synth.triggerAttackRelease('C4', '8n', Tone.now());
    const playSuccessSound = () => synth.triggerAttackRelease('E5', '8n', Tone.now());
    const playUnlockSound = () => synth.triggerAttackRelease('A5', '8n', Tone.now());
    const playCorrectSound = () => synth.triggerAttackRelease('C5', '8n', Tone.now());
    const playIncorrectSound = () => synth.triggerAttackRelease('C3', '8n', Tone.now());

    const getProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    const saveProgress = (progress) => localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

    function markModuleAsCompleted(moduleId) {
        const progress = getProgress();
        if (progress[moduleId]) return;
        progress[moduleId] = true;
        saveProgress(progress);
        playSuccessSound();
        updateCardUI(moduleId);
        unlockNextModule(moduleId);
    }

    function unlockNextModule(completedModuleId) {
        const completedIndex = allModules.findIndex(m => m.id === completedModuleId);
        if (completedIndex !== -1 && completedIndex + 1 < allModules.length) {
            const nextModule = allModules[completedIndex + 1];
            const nextCard = document.getElementById(`module-${nextModule.id.split('/').pop()}`);
            if (nextCard && nextCard.classList.contains('locked')) {
                nextCard.classList.remove('locked');
                playUnlockSound();
                gsap.fromTo(nextCard, { filter: 'grayscale(80%) blur(1px)', opacity: 0.6 }, { filter: 'grayscale(0%) blur(0px)', opacity: 1, duration: 0.5 });
            }
        }
    }

    function updateCardUI(moduleId) {
        const cardId = `module-${moduleId.split('/').pop()}`;
        const card = document.getElementById(cardId);
        if (!card || card.classList.contains('completed')) return;
        const cardInner = card.querySelector('.card-inner');
        const statusIndicator = card.querySelector('.card-status');
        const button = card.querySelector('.module-btn');
        gsap.to(cardInner, {
            rotationY: 360,
            duration: 0.8,
            ease: 'back.out(1.7)',
            onStart: () => card.classList.add('completed'),
            onComplete: () => {
                statusIndicator.innerHTML = '<i class="fas fa-check"></i>';
                button.textContent = 'Revisar Módulo';
            }
        });
    }

    async function loadModuleContent(moduleId) {
        playClickSound();
        try {
            const response = await fetch(moduleId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const content = await response.text();
            conteudoDiv.innerHTML = content;
            quizContainer.innerHTML = '';

            if (quizzes[moduleId]) {
                renderQuiz(moduleId);
            } else {
                conteudoDiv.innerHTML += `\n<div class="mt-12 text-center">\n<button onclick="window.markModuleAsCompleted('${moduleId}'); window.fecharModoFoco();" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg">\n<i class="fas fa-check-circle mr-2"></i> Concluir Módulo\n</button>\n</div>`;
            }

            trilhaContainer.style.display = 'none';
            conteudoWrapper.classList.remove('hidden');
            conteudoWrapper.classList.add('foco-profundo');
            btnFecharFoco.classList.remove('hidden');
            conteudoWrapper.scrollTop = 0;
        } catch (e) {
            console.error('Falha ao carregar módulo: ', e);
            conteudoDiv.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar conteúdo. Tente novamente.</p>';
        }
    }

    window.fecharModoFoco = () => {
        playClickSound();
        conteudoWrapper.classList.add('hidden');
        conteudoWrapper.classList.remove('foco-profundo');
        btnFecharFoco.classList.add('hidden');
        trilhaContainer.style.display = 'block';
        conteudoDiv.innerHTML = '';
        quizContainer.innerHTML = '';
    };

    function renderQuiz(moduleId) {
        const quiz = quizzes[moduleId];
        if (!quiz) return;
        let current = 0;
        let score = 0;
        const renderQuestion = () => {
            const q = quiz[current];
            if (!q) return finishQuiz();
            quizContainer.innerHTML = `<div class="mb-6"><h3 class="text-xl font-bold mb-2">${q.question}</h3>${q.options.map((opt,i)=>`<button data-idx="${i}" class="quiz-option bg-gray-700 text-white w-full p-3 rounded-lg mb-2">${opt}</button>`).join('')}</div>`;
            quizContainer.querySelectorAll('.quiz-option').forEach(btn => btn.addEventListener('click', () => handleAnswer(btn,q)));
        };
        const handleAnswer = (btn,q) => {
            const idx = parseInt(btn.dataset.idx);
            if(idx === q.correct){
                btn.classList.add('correct');
                score++; playCorrectSound();
            } else { btn.classList.add('incorrect'); playIncorrectSound(); }
            current++; setTimeout(renderQuestion, 700);
        };
        const finishQuiz = () => {
            quizContainer.innerHTML = `<p class="text-center font-bold">Você acertou ${score} de ${quiz.length} questões.</p><button class="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onclick="window.markModuleAsCompleted('${moduleId}'); window.fecharModoFoco();">Concluir Módulo</button>`;
        };
        renderQuestion();
    }

    window.markModuleAsCompleted = markModuleAsCompleted;
    btnFecharFoco.addEventListener('click', window.fecharModoFoco);

    function initializeTrilha() {
        const progress = getProgress();
        modulesGrid.innerHTML = '';
        let lastCompletedIndex = -1;
        allModules.forEach((module, index) => {
            const isCompleted = progress[module.id];
            if(isCompleted) lastCompletedIndex = index;
            const cardId = `module-${module.id.split('/').pop()}`;
            const cardHTML = `<div id="${cardId}" class="trilha-card rounded-2xl p-6 flex flex-col items-center text-center"><div class="card-inner flex flex-col items-center text-center h-full"><div class="card-status w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-gray-700 text-gray-300 mb-4">${isCompleted ? '<i class="fas fa-check"></i>' : index + 1}</div><h3 class="text-xl font-bold font-headings-portal mb-2">${module.title}</h3><p class="text-sm text-muted-dark-portal mb-4 flex-grow">${module.description}</p><button data-module="${module.id}" class="module-btn w-full bg-accent-color hover:bg-accent-color-hover text-white font-bold py-2 px-4 rounded-lg transition-colors mt-auto">${isCompleted ? 'Revisar Módulo' : 'Iniciar Módulo'}</button></div></div>`;
            modulesGrid.innerHTML += cardHTML;
        });
        document.querySelectorAll('.trilha-card').forEach((card, index) => {
            if (index > 0 && index > lastCompletedIndex + 1) {
                card.classList.add('locked');
            }
            if (progress[card.querySelector('.module-btn').dataset.module]) {
                card.classList.add('completed');
            }
        });
        document.querySelectorAll('.module-btn').forEach(button => {
            button.addEventListener('click', () => loadModuleContent(button.dataset.module));
        });
        gsap.to('.trilha-card', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
    }

    initializeTrilha();
});
