/* ================================================ */
/* JS a partir de: Indice.html & Playbook.html & 🚦 CENTRAL DE COMANDO...html */
/* (Estes arquivos compartilham a mesma lógica JS)   */
/* ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const capaSection = document.getElementById('capa');
    const menuSection = document.getElementById('menuPrincipal');
    const detalhesSection = document.getElementById('manualPitstopDetalhes');
    const playbookContentSection = document.getElementById('playbookContentSection');
    const playbookContentContainer = document.getElementById('playbookContentContainer');

    const sections = [capaSection, menuSection, detalhesSection, playbookContentSection];

    // Tone.js sounds
    const synth = new Tone.Synth().toDestination();
    const playHover = () => synth.triggerAttackRelease('E4', '8n');
    const playOpen = () => synth.triggerAttackRelease('C5', '8n');
    const playClose = () => synth.triggerAttackRelease('A3', '8n');
    const playSuccess = () => synth.triggerAttackRelease('E5', '16n');

    document.querySelectorAll('button, .menu-card').forEach(el => {
        el.addEventListener('mouseenter', playHover);
    });

    const tarefaForm = document.getElementById('formTarefa');
    if (tarefaForm) {
        tarefaForm.addEventListener('submit', e => {
            e.preventDefault();
            playSuccess();
            tarefaForm.reset();
            showSection(menuSection);
        });
    }

    function showSection(sectionToShow) {
        sections.forEach(section => {
            if (section) section.classList.add('hidden');
        });
        if (sectionToShow) {
            sectionToShow.classList.remove('hidden');
            sectionToShow.scrollIntoView({ behavior: 'smooth' });
            if (sectionToShow === playbookContentSection) {
                document.body.classList.add('focus-mode');
            } else {
                document.body.classList.remove('focus-mode');
            }
        }
    }

    const btnIniciar = document.getElementById('btnIniciar');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', (e) => {
            e.preventDefault();
            playOpen();
            showSection(menuSection);
        });
    }

    document.querySelectorAll('.menu-card[data-secao]').forEach(card => {
        card.addEventListener('click', () => {
            const secaoId = card.getAttribute('data-secao');
            const secaoDetalhes = document.getElementById(secaoId);
            if (secaoDetalhes) {
                playOpen();
                const state = Flip.getState(card);
                showSection(secaoDetalhes);
                Flip.from(state, {duration: 0.6, ease: 'power1.inOut'});
            } else {
                console.error(`Seção de detalhes com id '${secaoId}' não encontrada.`);
            }
        });
    });

    document.querySelectorAll('.index-item-card[data-page-url]').forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-page-url');
            playOpen();
            loadPlaybookPage(url, card.closest('.manual-pitstop-detalhes-section').id);
        });
    });

    document.querySelectorAll('.btn-voltar-secao').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            playClose();
            const targetSectionId = button.getAttribute('data-target-secao');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                showSection(targetSection);
            } else {
                showSection(menuSection);
            }
        });
    });

    async function loadPlaybookPage(url, returnSectionId) {
        try {
            playOpen();
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao carregar a página: ${response.statusText}`);
            }
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.querySelector('.playbook-sub-section .container');

            if (content && playbookContentContainer) {
                playbookContentContainer.innerHTML = '';
                playbookContentContainer.appendChild(content);

                const backButton = playbookContentContainer.querySelector('.btn-voltar');
                if (backButton) {
                    backButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        playClose();
                        const targetSection = document.getElementById(returnSectionId);
                        showSection(targetSection);
                    });
                }
                showSection(playbookContentSection);
            } else {
                console.error('Conteúdo não encontrado na página carregada ou container de destino não existe.');
                playbookContentContainer.innerHTML = `<p>Erro: Não foi possível carregar o conteúdo.</p>`;
                showSection(playbookContentSection);
            }
        } catch (error) {
            console.error('Falha no fetch:', error);
            playbookContentContainer.innerHTML = `<p>Ocorreu um erro ao carregar a página. Tente novamente mais tarde.</p>`;
            showSection(playbookContentSection);
        }
    }

    const themeToggleButton = document.getElementById('themeToggleButton');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    };

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    const increaseFontButton = document.getElementById('increaseFont');
    const decreaseFontButton = document.getElementById('decreaseFont');
    const htmlElement = document.documentElement;

    const changeFontSize = (direction) => {
        let currentSize = parseFloat(getComputedStyle(htmlElement).fontSize);
        let newSize;
        if (direction === 'increase') {
            newSize = currentSize * 1.1;
        } else {
            newSize = currentSize * 0.9;
        }
        htmlElement.style.fontSize = `${Math.max(10, Math.min(24, newSize))}px`;
    };

    if (increaseFontButton) {
        increaseFontButton.addEventListener('click', () => changeFontSize('increase'));
    }
    if (decreaseFontButton) {
        decreaseFontButton.addEventListener('click', () => changeFontSize('decrease'));
    }

    const readPageButton = document.getElementById('readPageBtn');
    if (readPageButton) {
        const synth = window.speechSynthesis;
        if (!synth) {
            readPageButton.style.display = 'none';
        } else {
            readPageButton.addEventListener('click', () => {
                if (synth.speaking) {
                    synth.cancel();
                    return;
                }
                let activeSection = null;
                sections.forEach(sec => {
                    if (sec && !sec.classList.contains('hidden')) activeSection = sec;
                });
                if (!activeSection) return;
                let text = '';
                activeSection.querySelectorAll('h1, h2, h3, h4, p').forEach(el => {
                    text += el.textContent + '. ';
                });
                const utterance = new SpeechSynthesisUtterance(text.trim());
                utterance.lang = 'pt-BR';
                synth.speak(utterance);
            });
        }
    }

    // Scroll progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const max = document.body.scrollHeight - window.innerHeight;
            const percent = (window.scrollY / max) * 100;
            progressBar.style.setProperty('--progress', percent + '%');
        });
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }

    showSection(capaSection);
});

/* ================================================ */
/* JS a partir de: VALIDADOR E CONSULTA DETALHADA DE CNPJ.html */
/* ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const cnpjInput = document.getElementById('cnpj');
    const consultarBtn = document.getElementById('consultarBtn');
    const resultDiv = document.getElementById('resultCnpj');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const geminiBtn = document.getElementById('geminiBtn');
    const geminiResultsContainer = document.getElementById('geminiResultsContainer');
    const geminiResults = document.getElementById('geminiResults');
    const toggle = document.getElementById('dark-toggle');
    const sunIcon = document.getElementById('sun');
    const moonIcon = document.getElementById('moon');

    let rawCnpjData = null;

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        } else {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    };
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }

    if(cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value.slice(0, 18);
        });
    }

    async function fetchCnpjData(cnpj) {
        const cleanedCnpj = cnpj.replace(/\D/g, '');
        if (cleanedCnpj.length !== 14) {
            displayResult({ error: 'CNPJ inválido. Deve conter 14 dígitos.' });
            return;
        }

        if(loadingIndicator) loadingIndicator.classList.add('active');
        if(resultDiv) resultDiv.innerHTML = '';
        if(geminiBtn) geminiBtn.style.display = 'none';
        if(geminiResultsContainer) geminiResultsContainer.style.display = 'none';

        try {
            const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.receitaws.com.br/v1/cnpj/${cleanedCnpj}`);
            if (!response.ok) {
                if (response.status === 429) {
                     throw new Error('Muitas requisições. Aguarde um minuto e tente novamente.');
                }
                throw new Error(`Erro na consulta: ${response.statusText}`);
            }
            const data = await response.json();
            rawCnpjData = data;
            displayResult(data);
            if(data.status === "OK" && geminiBtn){
                geminiBtn.style.display = 'block';
            }

        } catch (error) {
            console.error('Erro ao consultar CNPJ:', error);
            displayResult({ error: `Falha na comunicação com a API. ${error.message}` });
        } finally {
            if(loadingIndicator) loadingIndicator.classList.remove('active');
        }
    }

    function displayResult(data) {
        if (!resultDiv) return;
        if (data.error || data.status === "ERROR") {
            resultDiv.innerHTML = `<p class="error"><strong>Erro:</strong> ${data.error || data.message}</p>`;
            return;
        }

        const situacaoClass = data.situacao === 'ATIVA' ? 'success' : 'error';

        let html = `
            <h4>${data.nome}</h4>
            <p class="${situacaoClass}"><strong>Situação:</strong> ${data.situacao}</p>
            <p><strong>CNPJ:</strong> ${data.cnpj}</p>
            <p><strong>Abertura:</strong> ${data.abertura}</p>
            <p><strong>Tipo:</strong> ${data.tipo}</p>
            <p><strong>Porte:</strong> ${data.porte}</p>
            <p><strong>Natureza Jurídica:</strong> ${data.natureza_juridica}</p>
            <p><strong>Atividade Principal:</strong> ${data.atividade_principal[0].text} (${data.atividade_principal[0].code})</p>
            <p><strong>Endereço:</strong> ${data.logradouro}, ${data.numero}, ${data.complemento} - ${data.bairro}, ${data.municipio} - ${data.uf}, CEP: ${data.cep}</p>
            <p><strong>Telefone:</strong> ${data.telefone}</p>
            <p><strong>E-mail:</strong> ${data.email}</p>
        `;
        
        if (data.tipo === 'FILIAL') {
            html += `<div class="info-matriz">
                Esta é uma filial. CNPJ da Matriz: ${data.cnpj.substring(0, 10)}0001-${data.cnpj.substring(15)}
                <button onclick="consultarMatriz('${data.cnpj.substring(0, 10)}0001-${data.cnpj.substring(15)}')">Consultar Matriz</button>
            </div>`;
        }

        if (data.qsa && data.qsa.length > 0) {
            html += '<h4>Quadro de Sócios e Administradores (QSA)</h4>';
            data.qsa.forEach(socio => {
                html += `<p><strong>${socio.nome}:</strong> ${socio.qual}</p>`;
            });
        }
        
        resultDiv.innerHTML = html;
    }

    window.consultarMatriz = function(cnpjMatriz) {
        if(cnpjInput) cnpjInput.value = cnpjMatriz;
        fetchCnpjData(cnpjMatriz);
    }
    
    if(consultarBtn) {
        consultarBtn.addEventListener('click', () => {
            fetchCnpjData(cnpjInput.value);
        });
    }

    if(cnpjInput) {
        cnpjInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchCnpjData(cnpjInput.value);
            }
        });
    }

    async function getGeminiAnalysis(data) {
        if(loadingIndicator) loadingIndicator.classList.add('active');
        if(geminiResultsContainer) geminiResultsContainer.style.display = 'none';
        console.log("Enviando para o Gemini:", JSON.stringify(data, null, 2));
        setTimeout(() => {
            let simulatedResponse = `
**Potencial como Cliente:** Médio

**Justificativa:** Sendo uma empresa de "Comércio a varejo de automóveis, camionetas e utilitários usados", há uma sinergia clara com o negócio de repasse de veículos. O porte "DEMAIS" e a natureza "Sociedade Empresária Limitada" indicam uma operação estruturada, mas não gigante, podendo se beneficiar de um parceiro de repasse para otimizar seu estoque.

**Pontos de Atenção:**
* Verificar o volume de negócios e a capacidade de compra atual da empresa.
* Confirmar se a empresa já trabalha com outros fornecedores de repasse.

**Primeira Abordagem Sugerida:** "Olá! Vimos que vocês são referência no comércio de veículos usados em ${data.municipio}. Temos uma plataforma que pode agilizar a renovação do seu estoque com ótimas oportunidades. Podemos conversar?"
            `;
            if (data.atividade_principal[0].code.startsWith("49.30")) {
                 simulatedResponse = `
**Potencial como Cliente:** Alto

**Justificativa:** Empresas de "Transporte rodoviário de carga" têm necessidade contínua de renovação e manutenção de frota, tanto de veículos leves (apoio) quanto pesados. O porte da empresa sugere uma operação com múltiplos veículos, tornando-a um cliente com alto potencial para compras recorrentes.

**Pontos de Atenção:**
* Identificar o responsável pela gestão e aquisição da frota.
* Entender o ciclo de troca de veículos da empresa.

**Primeira Abordagem Sugerida:** "Olá, [Nome do Contato]. Sabemos que a eficiência da frota é crucial para a [Nome da Empresa]. Temos um portfólio de veículos leves e pesados que podem otimizar seus custos operacionais. Seria um bom momento para um bate-papo?"
                `;
            }
            if(geminiResults) geminiResults.innerHTML = simulatedResponse;
            if(geminiResultsContainer) geminiResultsContainer.style.display = 'block';
            if(loadingIndicator) loadingIndicator.classList.remove('active');
            if(geminiResultsContainer) geminiResultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 2000); 
    }

    if (geminiBtn) {
        geminiBtn.addEventListener('click', () => {
            if (rawCnpjData) {
                getGeminiAnalysis(rawCnpjData);
            } else {
                alert("Consulte um CNPJ primeiro.");
            }
        });
    }
});

/* ================================================ */
/* JS a partir de: 🏆DESAFIO DOS CAMPEÕES...!.html */
/* (Este é um componente React/JSX, o JS foi extraído) */
/* ================================================ */
function setupQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    const questions = [
        {
            question: "Qual é o principal objetivo do Playbook da Auto Arremate & Arremaq?",
            options: ["Substituir o treinamento presencial", "Servir como um guia tático de vendas e operações", "Listar todos os carros em estoque", "Apresentar o balanço financeiro da empresa"],
            answer: "Servir como um guia tático de vendas e operações",
            explanation: "O Playbook é um guia estratégico para alinhar a equipe e otimizar processos, funcionando como um manual tático central."
        },
        {
            question: "A Auto Arremate é focada em qual segmento de veículos?",
            options: ["Máquinas agrícolas e de construção", "Veículos leves (carros e utilitários)", "Apenas motocicletas", "Caminhões e ônibus"],
            answer: "Veículos leves (carros e utilitários)",
            explanation: "A Auto Arremate é a nossa especialista no universo dinâmico dos veículos leves, como carros de passeio e utilitários."
        },
        {
            question: "Qual empresa do grupo é especializada em veículos pesados como caminhões e máquinas?",
            options: ["Auto Arremate", "Auto Pesados", "Arremaq", "Pesadão Repasses"],
            answer: "Arremaq",
            explanation: "A Arremaq é a força bruta do grupo, dominando o segmento de veículos pesados, máquinas agrícolas e de construção."
        },
        {
            question: "O que significa o termo 'ICP' mencionado no Playbook?",
            options: ["Índice de Compra Previsto", "Cliente Potencialmente Interessado", "Ideal Customer Profile (Perfil de Cliente Ideal)", "Investimento de Curto Prazo"],
            answer: "Ideal Customer Profile (Perfil de Cliente Ideal)",
            explanation: "ICP (Ideal Customer Profile) define o perfil de cliente que mais se beneficia com nossa solução e gera mais valor para a empresa."
        },
        {
            question: "Na Jornada do Cliente, qual etapa vem imediatamente APÓS a 'Prospecção'?",
            options: ["Fechamento", "Pós-venda", "Qualificação", "Negociação"],
            answer: "Qualificação",
            explanation: "Após prospectar um lead, o passo seguinte é a Qualificação, onde verificamos se ele tem o perfil e a necessidade para se tornar um cliente."
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;
    let gameStarted = false;

    const render = () => {
        if (!gameStarted) {
            quizContainer.innerHTML = `
                <div class="text-center animate-fade-in">
                    <h2 class="text-3xl font-bold font-sora mb-2">🏆 Desafio dos Campeões!</h2>
                    <p class="mb-6 text-slate-600 dark:text-slate-300">Teste seu conhecimento sobre nosso Playbook e mostre que você está pronto para a pole position!</p>
                    <button id="start-btn" class="btn-iniciar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Começar o Desafio
                    </button>
                </div>
            `;
            document.getElementById('start-btn').addEventListener('click', startGame);
        } else if (currentQuestionIndex < questions.length) {
            renderQuestion();
        } else {
            renderFinalScore();
        }
    };
    
    const startGame = () => {
        gameStarted = true;
        currentQuestionIndex = 0;
        score = 0;
        render();
    };

    const renderQuestion = () => {
        const question = questions[currentQuestionIndex];
        quizContainer.innerHTML = `
            <div class="animate-slide-in-left">
                <div class="mb-4">
                    <p class="text-sm font-semibold text-teal-600 dark:text-teal-400">Pergunta ${currentQuestionIndex + 1} de ${questions.length}</p>
                    <h3 class="text-2xl font-bold font-sora mt-1">${question.question}</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${question.options.map(option => `
                        <button class="option-btn text-left p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-slate-700 transition-all duration-200">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.querySelectorAll('.option-btn').forEach(button => {
            button.addEventListener('click', handleAnswer);
        });
    };

    const handleAnswer = (e) => {
        const selectedOption = e.target.textContent.trim();
        const question = questions[currentQuestionIndex];
        const buttons = document.querySelectorAll('.option-btn');

        buttons.forEach(button => {
            button.disabled = true;
            const optionText = button.textContent.trim();
            if (optionText === question.answer) {
                button.classList.add('bg-green-200', 'border-green-500', 'dark:bg-green-800', 'dark:border-green-600');
            } else if (optionText === selectedOption) {
                button.classList.add('bg-red-200', 'border-red-500', 'dark:bg-red-800', 'dark:border-red-600');
            }
        });
        
        if (selectedOption === question.answer) {
            score++;
            const scoreElement = document.getElementById('score-display');
            if(scoreElement) {
                scoreElement.textContent = score;
                scoreElement.classList.add('animate-score-pop');
                setTimeout(() => scoreElement.classList.remove('animate-score-pop'), 300);
            }
        }

        quizContainer.insertAdjacentHTML('beforeend', `
            <div class="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg animate-fade-in">
                <p class="font-semibold">Explicação:</p>
                <p class="text-slate-700 dark:text-slate-300">${question.explanation}</p>
            </div>
        `);

        setTimeout(() => {
            currentQuestionIndex++;
            render();
        }, 3500);
    };
    
    const renderFinalScore = () => {
        const percentage = (score / questions.length) * 100;
        let message, emoji;

        if (percentage === 100) {
            message = "Performance de Campeão! Você dominou o Playbook!";
            emoji = "🏆";
        } else if (percentage >= 75) {
            message = "Excelente resultado! Você está na reta final para o pódio!";
            emoji = "🚀";
        } else if (percentage >= 50) {
            message = "Bom trabalho! Continue estudando o Playbook para chegar ao topo.";
            emoji = "👍";
        } else {
            message = "Quase lá! Releia o Playbook para afiar suas estratégias.";
            emoji = "📖";
        }

        quizContainer.innerHTML = `
            <div class="text-center animate-fade-in confetti">
                <h2 class="text-4xl font-bold font-sora mb-3">${emoji} Fim do Desafio! ${emoji}</h2>
                <p class="text-xl mb-4 text-slate-700 dark:text-slate-200">Você acertou <span class="font-bold text-teal-500 text-2xl">${score}</span> de <span class="font-bold text-2xl">${questions.length}</span> perguntas.</p>
                <p class="text-lg font-semibold mb-6">${message}</p>
                <button id="restart-btn" class="btn-iniciar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 9a9 9 0 0114.13-6.36M20 15a9 9 0 01-14.13 6.36" /></svg>
                    Tentar Novamente
                </button>
            </div>
        `;
        document.getElementById('restart-btn').addEventListener('click', startGame);
    };

    render();
}
setupQuiz();

/* ================================================ */
/* JS a partir de: 💨GRANDE PRÊMIO...html          */
/* (Assume que phaser.js é carregado externamente) */
/* ================================================ */
function setupGame() {
    const gameContainer = document.getElementById('game-canvas-container');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const restartButton = document.getElementById('restart-button');

    if (!gameContainer || !Phaser) {
        if(gameContainer) gameContainer.innerHTML = "<p>Erro ao carregar o motor do jogo (Phaser.js).</p>";
        return;
    };
    
    let player, cursors, obstacles, scoreText, score, gameOver;

    const config = {
        type: Phaser.AUTO,
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight,
        parent: 'game-canvas-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    function preload() {
    }

    function create() {
        this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0x4A4A4A);
        this.add.rectangle(config.width / 2, config.height / 2, config.width - 40, config.height - 40, 0x5A5A5A);
        
        for (let i = 0; i < config.height; i += 40) {
            this.add.rectangle(config.width / 2, i, 10, 20, 0xFFFFFF);
        }

        player = this.physics.add.sprite(config.width / 2, config.height - 50, null).setCollideWorldBounds(true);
        player.setBodySize(30, 50);
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00FF00, 1.0);
        playerGraphics.fillRect(-15, -25, 30, 50);
        playerGraphics.fillStyle(0x000000, 1.0);
        playerGraphics.fillRect(-10, -20, 20, 15);
        player.add(playerGraphics);
        
        cursors = this.input.keyboard.createCursorKeys();

        obstacles = this.physics.add.group();

        score = 0;
        gameOver = false;
        scoreText = this.add.text(16, 16, 'Pontos: 0', { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: 4 });

        this.time.addEvent({
            delay: 1000,
            callback: addObstacleRow,
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(player, obstacles, hitObstacle, null, this);
    }
    
    function update() {
        if (gameOver) return;

        player.setVelocityX(0);
        if (cursors.left.isDown) {
            player.setVelocityX(-300);
        } else if (cursors.right.isDown) {
            player.setVelocityX(300);
        }
        
        score += 1;
        scoreText.setText('Pontos: ' + score);
    }

    function addObstacleRow() {
        if (gameOver) return;
        const obstacleX = Phaser.Math.Between(50, config.width - 50);
        const obstacle = obstacles.create(obstacleX, -50, null);
        obstacle.setBodySize(40, 40);
        
        const obstacleGraphics = this.add.graphics();
        obstacleGraphics.fillStyle(0xFF4500, 1.0);
        obstacleGraphics.fillRect(-20, -20, 40, 40);
        obstacle.add(obstacleGraphics);
        
        obstacle.setVelocityY(Phaser.Math.Between(200, 400));
        obstacle.checkWorldBounds = true;
        obstacle.outOfBoundsKill = true;
    }

    function hitObstacle(player, obstacle) {
        this.physics.pause();
        player.setTint(0xff0000);
        gameOver = true;
        
        modalMessage.textContent = `Fim de Jogo! Sua pontuação: ${score}`;
        modal.classList.remove('hidden');
    }

    restartButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        game.scene.start('default');
    });

    window.addEventListener('resize', () => {
        game.scale.resize(gameContainer.clientWidth, gameContainer.clientHeight);
    });
}
setupGame();

/* ================================================ */
/* JS a partir de: guia tatico de vendas.html       */
/* ================================================ */
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;
            const targetContent = document.getElementById(targetId);

            tabs.forEach(t => {
                t.classList.remove('tab-active');
                t.classList.add('tab-inactive');
            });
            tab.classList.add('tab-active');
            tab.classList.remove('tab-inactive');

            contents.forEach(content => {
                content.classList.add('content-hidden');
            });
            if (targetContent) {
                targetContent.classList.remove('content-hidden');
                targetContent.classList.add('fade-in');
            }
        });
    });

    const aiModalOverlay = document.getElementById('ai-modal-overlay');
    const aiModal = document.getElementById('ai-modal');
    const openAiModalButtons = document.querySelectorAll('.open-ai-modal');
    const closeAiModalButton = document.getElementById('close-ai-modal');
    const aiPromptInput = document.getElementById('ai-prompt');
    const generateAiResponseButton = document.getElementById('generate-ai-response');
    const aiResponseContainer = document.getElementById('ai-response');
    const aiSpinner = document.getElementById('ai-spinner');
    
    openAiModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const context = button.dataset.context;
            const placeholder = `Ex: "Crie 3 opções de mensagem de prospecção no WhatsApp para um dono de concessionária em ${context}, focando em renovação de estoque."`;
            aiPromptInput.placeholder = placeholder;
            aiPromptInput.value = '';
            aiResponseContainer.innerHTML = '';
            aiModalOverlay.classList.remove('hidden');
        });
    });

    const closeModal = () => {
        aiModalOverlay.classList.add('hidden');
    };
    closeAiModalButton.addEventListener('click', closeModal);
    aiModalOverlay.addEventListener('click', (event) => {
        if (event.target === aiModalOverlay) {
            closeModal();
        }
    });

    generateAiResponseButton.addEventListener('click', () => {
        const prompt = aiPromptInput.value;
        if (!prompt) {
            aiResponseContainer.innerHTML = '<p class="text-red-500">Por favor, insira um comando.</p>';
            return;
        }

        aiSpinner.classList.remove('hidden');
        aiResponseContainer.innerHTML = '';
        generateAiResponseButton.disabled = true;
        
        setTimeout(() => {
            const simulatedResponse = `
                <p class="font-semibold text-gray-800">Claro! Aqui estão 3 opções de mensagem:</p>
                <ol class="list-decimal list-inside mt-2 space-y-3">
                    <li><strong class="text-sky-700">Opção 1 (Direta):</strong> "Olá [Nome do Cliente]! Vi que você tem uma ótima seleção de veículos em [Cidade]. Sou da Auto Arremate e temos um lote de [Exemplo: Sedans 2021] que pode interessar para renovar seu estoque. Posso enviar os detalhes?"</li>
                    <li><strong class="text-sky-700">Opção 2 (Benefício):</strong> "Fala [Nome do Cliente]! A gente sabe como é difícil manter o pátio girando com veículos de qualidade. Na Auto Arremate, ajudamos lojas como a sua a terem acesso rápido a carros de repasse com procedência. Faz sentido conversarmos por 5 minutos?"</li>
                    <li><strong class="text-sky-700">Opção 3 (Exclusividade):</strong> "Prezado [Nome do Cliente], tudo bem? Meu nome é [Seu Nome], da Auto Arremate. Nossos parceiros em [Cidade] estão tendo ótimos resultados com nosso sistema de repasse. Temos uma oferta especial de boas-vindas. Gostaria de saber mais?"</li>
                </ol>
            `;
            aiResponseContainer.innerHTML = simulatedResponse;
            aiSpinner.classList.add('hidden');
            generateAiResponseButton.disabled = false;
        }, 1500);
    });
});
/* JS a partir de: Indice.html & Playbook.html & 🚦 CENTRAL DE COMANDO...html */
/* (Estes arquivos compartilham a mesma lógica JS)   */
/* ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const capaSection = document.getElementById('capa');
    const menuSection = document.getElementById('menuPrincipal');
    const detalhesSection = document.getElementById('manualPitstopDetalhes');
    const playbookContentSection = document.getElementById('playbookContentSection');
    const playbookContentContainer = document.getElementById('playbookContentContainer');

    const sections = [capaSection, menuSection, detalhesSection, playbookContentSection];

    function showSection(sectionToShow) {
        sections.forEach(section => {
            if (section) section.classList.add('hidden');
        });
        if (sectionToShow) {
            sectionToShow.classList.remove('hidden');
            sectionToShow.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const btnIniciar = document.getElementById('btnIniciar');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(menuSection);
        });
    }

    document.querySelectorAll('.menu-card[data-secao]').forEach(card => {
        card.addEventListener('click', () => {
            const secaoId = card.getAttribute('data-secao');
            const secaoDetalhes = document.getElementById(secaoId);
            if (secaoDetalhes) {
                showSection(secaoDetalhes);
            } else {
                console.error(`Seção de detalhes com id '${secaoId}' não encontrada.`);
            }
        });
    });

    document.querySelectorAll('.index-item-card[data-page-url]').forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-page-url');
            loadPlaybookPage(url, card.closest('.manual-pitstop-detalhes-section').id);
        });
    });

    document.querySelectorAll('.btn-voltar-secao').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = button.getAttribute('data-target-secao');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                showSection(targetSection);
            } else {
                showSection(menuSection);
            }
        });
    });

    async function loadPlaybookPage(url, returnSectionId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro ao carregar a página: ${response.statusText}`);
            }
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.querySelector('.playbook-sub-section .container');

            if (content && playbookContentContainer) {
                playbookContentContainer.innerHTML = '';
                playbookContentContainer.appendChild(content);

                const backButton = playbookContentContainer.querySelector('.btn-voltar');
                if (backButton) {
                    backButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetSection = document.getElementById(returnSectionId);
                        showSection(targetSection);
                    });
                }
                showSection(playbookContentSection);
            } else {
                console.error('Conteúdo não encontrado na página carregada ou container de destino não existe.');
                playbookContentContainer.innerHTML = `<p>Erro: Não foi possível carregar o conteúdo.</p>`;
                showSection(playbookContentSection);
            }
        } catch (error) {
            console.error('Falha no fetch:', error);
            playbookContentContainer.innerHTML = `<p>Ocorreu um erro ao carregar a página. Tente novamente mais tarde.</p>`;
            showSection(playbookContentSection);
        }
    }

    const themeToggleButton = document.getElementById('themeToggleButton');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    };

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    const increaseFontButton = document.getElementById('increaseFont');
    const decreaseFontButton = document.getElementById('decreaseFont');
    const htmlElement = document.documentElement;

    const changeFontSize = (direction) => {
        let currentSize = parseFloat(getComputedStyle(htmlElement).fontSize);
        let newSize;
        if (direction === 'increase') {
            newSize = currentSize * 1.1;
        } else {
            newSize = currentSize * 0.9;
        }
        htmlElement.style.fontSize = `${Math.max(10, Math.min(24, newSize))}px`;
    };

    if (increaseFontButton) {
        increaseFontButton.addEventListener('click', () => changeFontSize('increase'));
    }
    if (decreaseFontButton) {
        decreaseFontButton.addEventListener('click', () => changeFontSize('decrease'));
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }

    showSection(capaSection);
});

/* ================================================ */
/* JS a partir de: VALIDADOR E CONSULTA DETALHADA DE CNPJ.html */
/* ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const cnpjInput = document.getElementById('cnpj');
    const consultarBtn = document.getElementById('consultarBtn');
    const resultDiv = document.getElementById('resultCnpj');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const geminiBtn = document.getElementById('geminiBtn');
    const geminiResultsContainer = document.getElementById('geminiResultsContainer');
    const geminiResults = document.getElementById('geminiResults');
    const toggle = document.getElementById('dark-toggle');
    const sunIcon = document.getElementById('sun');
    const moonIcon = document.getElementById('moon');

    let rawCnpjData = null;

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        } else {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    };
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }

    if(cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value.slice(0, 18);
        });
    }

    async function fetchCnpjData(cnpj) {
        const cleanedCnpj = cnpj.replace(/\D/g, '');
        if (cleanedCnpj.length !== 14) {
            displayResult({ error: 'CNPJ inválido. Deve conter 14 dígitos.' });
            return;
        }

        if(loadingIndicator) loadingIndicator.classList.add('active');
        if(resultDiv) resultDiv.innerHTML = '';
        if(geminiBtn) geminiBtn.style.display = 'none';
        if(geminiResultsContainer) geminiResultsContainer.style.display = 'none';

        try {
            const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.receitaws.com.br/v1/cnpj/${cleanedCnpj}`);
            if (!response.ok) {
                if (response.status === 429) {
                     throw new Error('Muitas requisições. Aguarde um minuto e tente novamente.');
                }
                throw new Error(`Erro na consulta: ${response.statusText}`);
            }
            const data = await response.json();
            rawCnpjData = data;
            displayResult(data);
            if(data.status === "OK" && geminiBtn){
                geminiBtn.style.display = 'block';
            }

        } catch (error) {
            console.error('Erro ao consultar CNPJ:', error);
            displayResult({ error: `Falha na comunicação com a API. ${error.message}` });
        } finally {
            if(loadingIndicator) loadingIndicator.classList.remove('active');
        }
    }

    function displayResult(data) {
        if (!resultDiv) return;
        if (data.error || data.status === "ERROR") {
            resultDiv.innerHTML = `<p class="error"><strong>Erro:</strong> ${data.error || data.message}</p>`;
            return;
        }

        const situacaoClass = data.situacao === 'ATIVA' ? 'success' : 'error';

        let html = `
            <h4>${data.nome}</h4>
            <p class="${situacaoClass}"><strong>Situação:</strong> ${data.situacao}</p>
            <p><strong>CNPJ:</strong> ${data.cnpj}</p>
            <p><strong>Abertura:</strong> ${data.abertura}</p>
            <p><strong>Tipo:</strong> ${data.tipo}</p>
            <p><strong>Porte:</strong> ${data.porte}</p>
            <p><strong>Natureza Jurídica:</strong> ${data.natureza_juridica}</p>
            <p><strong>Atividade Principal:</strong> ${data.atividade_principal[0].text} (${data.atividade_principal[0].code})</p>
            <p><strong>Endereço:</strong> ${data.logradouro}, ${data.numero}, ${data.complemento} - ${data.bairro}, ${data.municipio} - ${data.uf}, CEP: ${data.cep}</p>
            <p><strong>Telefone:</strong> ${data.telefone}</p>
            <p><strong>E-mail:</strong> ${data.email}</p>
        `;
        
        if (data.tipo === 'FILIAL') {
            html += `<div class="info-matriz">
                Esta é uma filial. CNPJ da Matriz: ${data.cnpj.substring(0, 10)}0001-${data.cnpj.substring(15)}
                <button onclick="consultarMatriz('${data.cnpj.substring(0, 10)}0001-${data.cnpj.substring(15)}')">Consultar Matriz</button>
            </div>`;
        }

        if (data.qsa && data.qsa.length > 0) {
            html += '<h4>Quadro de Sócios e Administradores (QSA)</h4>';
            data.qsa.forEach(socio => {
                html += `<p><strong>${socio.nome}:</strong> ${socio.qual}</p>`;
            });
        }
        
        resultDiv.innerHTML = html;
    }

    window.consultarMatriz = function(cnpjMatriz) {
        if(cnpjInput) cnpjInput.value = cnpjMatriz;
        fetchCnpjData(cnpjMatriz);
    }
    
    if(consultarBtn) {
        consultarBtn.addEventListener('click', () => {
            fetchCnpjData(cnpjInput.value);
        });
    }

    if(cnpjInput) {
        cnpjInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchCnpjData(cnpjInput.value);
            }
        });
    }

    async function getGeminiAnalysis(data) {
        if(loadingIndicator) loadingIndicator.classList.add('active');
        if(geminiResultsContainer) geminiResultsContainer.style.display = 'none';
        console.log("Enviando para o Gemini:", JSON.stringify(data, null, 2));
        setTimeout(() => {
            let simulatedResponse = `
**Potencial como Cliente:** Médio

**Justificativa:** Sendo uma empresa de "Comércio a varejo de automóveis, camionetas e utilitários usados", há uma sinergia clara com o negócio de repasse de veículos. O porte "DEMAIS" e a natureza "Sociedade Empresária Limitada" indicam uma operação estruturada, mas não gigante, podendo se beneficiar de um parceiro de repasse para otimizar seu estoque.

**Pontos de Atenção:**
* Verificar o volume de negócios e a capacidade de compra atual da empresa.
* Confirmar se a empresa já trabalha com outros fornecedores de repasse.

**Primeira Abordagem Sugerida:** "Olá! Vimos que vocês são referência no comércio de veículos usados em ${data.municipio}. Temos uma plataforma que pode agilizar a renovação do seu estoque com ótimas oportunidades. Podemos conversar?"
            `;
            if (data.atividade_principal[0].code.startsWith("49.30")) {
                 simulatedResponse = `
**Potencial como Cliente:** Alto

**Justificativa:** Empresas de "Transporte rodoviário de carga" têm necessidade contínua de renovação e manutenção de frota, tanto de veículos leves (apoio) quanto pesados. O porte da empresa sugere uma operação com múltiplos veículos, tornando-a um cliente com alto potencial para compras recorrentes.

**Pontos de Atenção:**
* Identificar o responsável pela gestão e aquisição da frota.
* Entender o ciclo de troca de veículos da empresa.

**Primeira Abordagem Sugerida:** "Olá, [Nome do Contato]. Sabemos que a eficiência da frota é crucial para a [Nome da Empresa]. Temos um portfólio de veículos leves e pesados que podem otimizar seus custos operacionais. Seria um bom momento para um bate-papo?"
                `;
            }
            if(geminiResults) geminiResults.innerHTML = simulatedResponse;
            if(geminiResultsContainer) geminiResultsContainer.style.display = 'block';
            if(loadingIndicator) loadingIndicator.classList.remove('active');
            if(geminiResultsContainer) geminiResultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 2000); 
    }

    if (geminiBtn) {
        geminiBtn.addEventListener('click', () => {
            if (rawCnpjData) {
                getGeminiAnalysis(rawCnpjData);
            } else {
                alert("Consulte um CNPJ primeiro.");
            }
        });
    }
});

/* ================================================ */
/* JS a partir de: 🏆DESAFIO DOS CAMPEÕES...!.html */
/* (Este é um componente React/JSX, o JS foi extraído) */
/* ================================================ */
function setupQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    const questions = [
        {
            question: "Qual é o principal objetivo do Playbook da Auto Arremate & Arremaq?",
            options: ["Substituir o treinamento presencial", "Servir como um guia tático de vendas e operações", "Listar todos os carros em estoque", "Apresentar o balanço financeiro da empresa"],
            answer: "Servir como um guia tático de vendas e operações",
            explanation: "O Playbook é um guia estratégico para alinhar a equipe e otimizar processos, funcionando como um manual tático central."
        },
        {
            question: "A Auto Arremate é focada em qual segmento de veículos?",
            options: ["Máquinas agrícolas e de construção", "Veículos leves (carros e utilitários)", "Apenas motocicletas", "Caminhões e ônibus"],
            answer: "Veículos leves (carros e utilitários)",
            explanation: "A Auto Arremate é a nossa especialista no universo dinâmico dos veículos leves, como carros de passeio e utilitários."
        },
        {
            question: "Qual empresa do grupo é especializada em veículos pesados como caminhões e máquinas?",
            options: ["Auto Arremate", "Auto Pesados", "Arremaq", "Pesadão Repasses"],
            answer: "Arremaq",
            explanation: "A Arremaq é a força bruta do grupo, dominando o segmento de veículos pesados, máquinas agrícolas e de construção."
        },
        {
            question: "O que significa o termo 'ICP' mencionado no Playbook?",
            options: ["Índice de Compra Previsto", "Cliente Potencialmente Interessado", "Ideal Customer Profile (Perfil de Cliente Ideal)", "Investimento de Curto Prazo"],
            answer: "Ideal Customer Profile (Perfil de Cliente Ideal)",
            explanation: "ICP (Ideal Customer Profile) define o perfil de cliente que mais se beneficia com nossa solução e gera mais valor para a empresa."
        },
        {
            question: "Na Jornada do Cliente, qual etapa vem imediatamente APÓS a 'Prospecção'?",
            options: ["Fechamento", "Pós-venda", "Qualificação", "Negociação"],
            answer: "Qualificação",
            explanation: "Após prospectar um lead, o passo seguinte é a Qualificação, onde verificamos se ele tem o perfil e a necessidade para se tornar um cliente."
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;
    let gameStarted = false;

    const render = () => {
        if (!gameStarted) {
            quizContainer.innerHTML = `
                <div class="text-center animate-fade-in">
                    <h2 class="text-3xl font-bold font-sora mb-2">🏆 Desafio dos Campeões!</h2>
                    <p class="mb-6 text-slate-600 dark:text-slate-300">Teste seu conhecimento sobre nosso Playbook e mostre que você está pronto para a pole position!</p>
                    <button id="start-btn" class="btn-iniciar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Começar o Desafio
                    </button>
                </div>
            `;
            document.getElementById('start-btn').addEventListener('click', startGame);
        } else if (currentQuestionIndex < questions.length) {
            renderQuestion();
        } else {
            renderFinalScore();
        }
    };
    
    const startGame = () => {
        gameStarted = true;
        currentQuestionIndex = 0;
        score = 0;
        render();
    };

    const renderQuestion = () => {
        const question = questions[currentQuestionIndex];
        quizContainer.innerHTML = `
            <div class="animate-slide-in-left">
                <div class="mb-4">
                    <p class="text-sm font-semibold text-teal-600 dark:text-teal-400">Pergunta ${currentQuestionIndex + 1} de ${questions.length}</p>
                    <h3 class="text-2xl font-bold font-sora mt-1">${question.question}</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${question.options.map(option => `
                        <button class="option-btn text-left p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-slate-700 transition-all duration-200">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.querySelectorAll('.option-btn').forEach(button => {
            button.addEventListener('click', handleAnswer);
        });
    };

    const handleAnswer = (e) => {
        const selectedOption = e.target.textContent.trim();
        const question = questions[currentQuestionIndex];
        const buttons = document.querySelectorAll('.option-btn');

        buttons.forEach(button => {
            button.disabled = true;
            const optionText = button.textContent.trim();
            if (optionText === question.answer) {
                button.classList.add('bg-green-200', 'border-green-500', 'dark:bg-green-800', 'dark:border-green-600');
            } else if (optionText === selectedOption) {
                button.classList.add('bg-red-200', 'border-red-500', 'dark:bg-red-800', 'dark:border-red-600');
            }
        });
        
        if (selectedOption === question.answer) {
            score++;
            const scoreElement = document.getElementById('score-display');
            if(scoreElement) {
                scoreElement.textContent = score;
                scoreElement.classList.add('animate-score-pop');
                setTimeout(() => scoreElement.classList.remove('animate-score-pop'), 300);
            }
        }

        quizContainer.insertAdjacentHTML('beforeend', `
            <div class="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg animate-fade-in">
                <p class="font-semibold">Explicação:</p>
                <p class="text-slate-700 dark:text-slate-300">${question.explanation}</p>
            </div>
        `);

        setTimeout(() => {
            currentQuestionIndex++;
            render();
        }, 3500);
    };
    
    const renderFinalScore = () => {
        const percentage = (score / questions.length) * 100;
        let message, emoji;

        if (percentage === 100) {
            message = "Performance de Campeão! Você dominou o Playbook!";
            emoji = "🏆";
        } else if (percentage >= 75) {
            message = "Excelente resultado! Você está na reta final para o pódio!";
            emoji = "🚀";
        } else if (percentage >= 50) {
            message = "Bom trabalho! Continue estudando o Playbook para chegar ao topo.";
            emoji = "👍";
        } else {
            message = "Quase lá! Releia o Playbook para afiar suas estratégias.";
            emoji = "📖";
        }

        quizContainer.innerHTML = `
            <div class="text-center animate-fade-in confetti">
                <h2 class="text-4xl font-bold font-sora mb-3">${emoji} Fim do Desafio! ${emoji}</h2>
                <p class="text-xl mb-4 text-slate-700 dark:text-slate-200">Você acertou <span class="font-bold text-teal-500 text-2xl">${score}</span> de <span class="font-bold text-2xl">${questions.length}</span> perguntas.</p>
                <p class="text-lg font-semibold mb-6">${message}</p>
                <button id="restart-btn" class="btn-iniciar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 9a9 9 0 0114.13-6.36M20 15a9 9 0 01-14.13 6.36" /></svg>
                    Tentar Novamente
                </button>
            </div>
        `;
        document.getElementById('restart-btn').addEventListener('click', startGame);
    };

    render();
}
setupQuiz();

/* ================================================ */
/* JS a partir de: 💨GRANDE PRÊMIO...html          */
/* (Assume que phaser.js é carregado externamente) */
/* ================================================ */
function setupGame() {
    const gameContainer = document.getElementById('game-canvas-container');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const restartButton = document.getElementById('restart-button');

    if (!gameContainer || !Phaser) {
        if(gameContainer) gameContainer.innerHTML = "<p>Erro ao carregar o motor do jogo (Phaser.js).</p>";
        return;
    };
    
    let player, cursors, obstacles, scoreText, score, gameOver;

    const config = {
        type: Phaser.AUTO,
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight,
        parent: 'game-canvas-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    function preload() {
    }

    function create() {
        this.add.rectangle(config.width / 2, config.height / 2, config.width, config.height, 0x4A4A4A);
        this.add.rectangle(config.width / 2, config.height / 2, config.width - 40, config.height - 40, 0x5A5A5A);
        
        for (let i = 0; i < config.height; i += 40) {
            this.add.rectangle(config.width / 2, i, 10, 20, 0xFFFFFF);
        }

        player = this.physics.add.sprite(config.width / 2, config.height - 50, null).setCollideWorldBounds(true);
        player.setBodySize(30, 50);
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00FF00, 1.0);
        playerGraphics.fillRect(-15, -25, 30, 50);
        playerGraphics.fillStyle(0x000000, 1.0);
        playerGraphics.fillRect(-10, -20, 20, 15);
        player.add(playerGraphics);
        
        cursors = this.input.keyboard.createCursorKeys();

        obstacles = this.physics.add.group();

        score = 0;
        gameOver = false;
        scoreText = this.add.text(16, 16, 'Pontos: 0', { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: 4 });

        this.time.addEvent({
            delay: 1000,
            callback: addObstacleRow,
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(player, obstacles, hitObstacle, null, this);
    }
    
    function update() {
        if (gameOver) return;

        player.setVelocityX(0);
        if (cursors.left.isDown) {
            player.setVelocityX(-300);
        } else if (cursors.right.isDown) {
            player.setVelocityX(300);
        }
        
        score += 1;
        scoreText.setText('Pontos: ' + score);
    }

    function addObstacleRow() {
        if (gameOver) return;
        const obstacleX = Phaser.Math.Between(50, config.width - 50);
        const obstacle = obstacles.create(obstacleX, -50, null);
        obstacle.setBodySize(40, 40);
        
        const obstacleGraphics = this.add.graphics();
        obstacleGraphics.fillStyle(0xFF4500, 1.0);
        obstacleGraphics.fillRect(-20, -20, 40, 40);
        obstacle.add(obstacleGraphics);
        
        obstacle.setVelocityY(Phaser.Math.Between(200, 400));
        obstacle.checkWorldBounds = true;
        obstacle.outOfBoundsKill = true;
    }

    function hitObstacle(player, obstacle) {
        this.physics.pause();
        player.setTint(0xff0000);
        gameOver = true;
        
        modalMessage.textContent = `Fim de Jogo! Sua pontuação: ${score}`;
        modal.classList.remove('hidden');
    }

    restartButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        game.scene.start('default');
    });

    window.addEventListener('resize', () => {
        game.scale.resize(gameContainer.clientWidth, gameContainer.clientHeight);
    });
}
setupGame();

/* ================================================ */
/* JS a partir de: guia tatico de vendas.html       */
/* ================================================ */
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;
            const targetContent = document.getElementById(targetId);

            tabs.forEach(t => {
                t.classList.remove('tab-active');
                t.classList.add('tab-inactive');
            });
            tab.classList.add('tab-active');
            tab.classList.remove('tab-inactive');

            contents.forEach(content => {
                content.classList.add('content-hidden');
            });
            if (targetContent) {
                targetContent.classList.remove('content-hidden');
                targetContent.classList.add('fade-in');
            }
        });
    });

    const aiModalOverlay = document.getElementById('ai-modal-overlay');
    const aiModal = document.getElementById('ai-modal');
    const openAiModalButtons = document.querySelectorAll('.open-ai-modal');
    const closeAiModalButton = document.getElementById('close-ai-modal');
    const aiPromptInput = document.getElementById('ai-prompt');
    const generateAiResponseButton = document.getElementById('generate-ai-response');
    const aiResponseContainer = document.getElementById('ai-response');
    const aiSpinner = document.getElementById('ai-spinner');
    
    openAiModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const context = button.dataset.context;
            const placeholder = `Ex: "Crie 3 opções de mensagem de prospecção no WhatsApp para um dono de concessionária em ${context}, focando em renovação de estoque."`;
            aiPromptInput.placeholder = placeholder;
            aiPromptInput.value = '';
            aiResponseContainer.innerHTML = '';
            aiModalOverlay.classList.remove('hidden');
        });
    });

    const closeModal = () => {
        aiModalOverlay.classList.add('hidden');
    };
    closeAiModalButton.addEventListener('click', closeModal);
    aiModalOverlay.addEventListener('click', (event) => {
        if (event.target === aiModalOverlay) {
            closeModal();
        }
    });

    generateAiResponseButton.addEventListener('click', () => {
        const prompt = aiPromptInput.value;
        if (!prompt) {
            aiResponseContainer.innerHTML = '<p class="text-red-500">Por favor, insira um comando.</p>';
            return;
        }

        aiSpinner.classList.remove('hidden');
        aiResponseContainer.innerHTML = '';
        generateAiResponseButton.disabled = true;
        
        setTimeout(() => {
            const simulatedResponse = `
                <p class="font-semibold text-gray-800">Claro! Aqui estão 3 opções de mensagem:</p>
                <ol class="list-decimal list-inside mt-2 space-y-3">
                    <li><strong class="text-sky-700">Opção 1 (Direta):</strong> "Olá [Nome do Cliente]! Vi que você tem uma ótima seleção de veículos em [Cidade]. Sou da Auto Arremate e temos um lote de [Exemplo: Sedans 2021] que pode interessar para renovar seu estoque. Posso enviar os detalhes?"</li>
                    <li><strong class="text-sky-700">Opção 2 (Benefício):</strong> "Fala [Nome do Cliente]! A gente sabe como é difícil manter o pátio girando com veículos de qualidade. Na Auto Arremate, ajudamos lojas como a sua a terem acesso rápido a carros de repasse com procedência. Faz sentido conversarmos por 5 minutos?"</li>
                    <li><strong class="text-sky-700">Opção 3 (Exclusividade):</strong> "Prezado [Nome do Cliente], tudo bem? Meu nome é [Seu Nome], da Auto Arremate. Nossos parceiros em [Cidade] estão tendo ótimos resultados com nosso sistema de repasse. Temos uma oferta especial de boas-vindas. Gostaria de saber mais?"</li>
                </ol>
            `;
            aiResponseContainer.innerHTML = simulatedResponse;
            aiSpinner.classList.add('hidden');
            generateAiResponseButton.disabled = false;
        }, 1500);
    });
});
