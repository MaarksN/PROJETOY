document.addEventListener('DOMContentLoaded', () => {
    const PROGRESS_KEY = 'trilhaAprendizadoProgresso';
    const allModules = [
        { id: 'partials/trilha/0-pista-decolagem.html', title: 'Pista de Decolagem' },
        { id: 'partials/trilha/1-auto-arremate.html', title: 'Auto Arremate: Pole Position' },
        { id: 'partials/trilha/2-arremaq.html', title: 'Arremaq: Força Bruta' },
        { id: 'partials/trilha/3-mapeando-campeoes.html', title: 'Mapeando os Campeões' },
    ];

    const dashboardGrid = document.getElementById('dashboard-grid');
    const summaryText = document.getElementById('summary-text');
    const btnReset = document.getElementById('btn-reset-progress');

    const getProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};

    function renderDashboard() {
        const progress = getProgress();
        dashboardGrid.innerHTML = '';
        let completedCount = 0;
        allModules.forEach(module => {
            let status = 'locked';
            let statusIcon = '<i class="fas fa-lock w-6 text-center text-gray-500"></i>';
            let actionButton = '<span class="text-sm text-gray-500">Bloqueado</span>';
            const isCompleted = progress[module.id];
            if (isCompleted) {
                status = 'completed';
                statusIcon = '<i class="fas fa-check-circle w-6 text-center text-green-500"></i>';
                actionButton = `<a href="trilha.html" class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">Revisar</a>`;
                completedCount++;
            } else if (completedCount === 0 || progress[allModules[allModules.findIndex(m => m.id === module.id) - 1]?.id]) {
                status = 'current';
                statusIcon = '<i class="fas fa-map-marker-alt w-6 text-center text-yellow-500 animate-pulse"></i>';
                actionButton = `<a href="trilha.html" class="bg-accent-color hover:bg-accent-color-hover text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">Iniciar</a>`;
            }
            const itemHTML = `<div class="dashboard-item status-${status} rounded-lg p-4 flex justify-between items-center shadow-md"><div class="flex items-center">${statusIcon}<span class="ml-4 font-bold text-lg">${module.title}</span></div><div>${actionButton}</div></div>`;
            dashboardGrid.innerHTML += itemHTML;
        });
        summaryText.textContent = `Você completou ${completedCount} de ${allModules.length} módulos. Continue assim!`;
    }

    btnReset.addEventListener('click', () => {
        if (confirm('Você tem certeza que deseja reiniciar todo o seu progresso?')) {
            localStorage.removeItem(PROGRESS_KEY);
            renderDashboard();
        }
    });

    renderDashboard();
});
