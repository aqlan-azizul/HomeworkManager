document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Replace this with your actual Render backend URL
    const API_BASE_URL = 'https://homeworkmanager-1.onrender.com';

    let currentClassHomework = [];

    // --- Get HTML Elements ---
    const classFilter = document.getElementById('class-filter');
    const subjectFilterContainer = document.getElementById('subject-filter-container');
    const subjectFilter = document.getElementById('subject-filter');
    const homeworkList = document.getElementById('homework-list');
    
    const colorPalette = [
        'border-indigo-500', 'border-emerald-500', 'border-rose-500', 
        'border-sky-500', 'border-amber-500', 'border-fuchsia-500'
    ];
    let subjectColorMap = {};

    // --- Main Functions ---
    function renderHomework(assignments) {
        homeworkList.innerHTML = '';
        if (assignments.length === 0) {
            homeworkList.innerHTML = `<div class="text-center text-slate-500 py-16"><p>No homework found for this selection.</p></div>`;
            return;
        }

        assignments.forEach(item => {
            if (!subjectColorMap[item.subject]) {
                const colorIndex = Object.keys(subjectColorMap).length;
                subjectColorMap[item.subject] = colorPalette[colorIndex % colorPalette.length];
            }
            const subjectColorClass = subjectColorMap[item.subject];

            const card = document.createElement('div');
            card.className = `bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${subjectColorClass} transition-transform hover:scale-[1.02]`;
            
            const formattedDate = new Date(item.dueDate + 'T00:00:00');
            const today = new Date();
            today.setHours(0,0,0,0);
            const isPastDue = formattedDate < today;

            card.innerHTML = `
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-semibold text-indigo-600">${item.subject}</p>
                            <p class="text-xl font-bold text-slate-800 mt-1">${item.assignment}</p>
                        </div>
                        <div class="text-right flex-shrink-0 ml-4">
                            <p class="text-sm text-slate-500">Due Date</p>
                            <p class="font-semibold ${isPastDue ? 'text-red-500' : 'text-slate-700'}">${formattedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-slate-200 space-y-3">
                        <div>
                            <p class="text-xs font-semibold text-slate-500">Method:</p>
                            <p class="text-sm text-slate-700">${item.method || 'N/A'}</p>
                        </div>
                        ${item.notes ? `
                        <div>
                            <p class="text-xs font-semibold text-slate-500">Notes:</p>
                            <p class="text-sm text-slate-700">${item.notes}</p>
                        </div>` : ''}
                    </div>
                </div>
            `;
            homeworkList.appendChild(card);
        });
    }

    // --- Event Listeners ---
    classFilter.addEventListener('change', async () => {
        const selectedClass = classFilter.value;
        if (!selectedClass) return;

        subjectFilterContainer.classList.add('hidden');
        homeworkList.innerHTML = `<div class="text-center text-slate-500 py-16"><p>Loading assignments...</p></div>`;

        try {
            // Use the live API URL
            const response = await fetch(`${API_BASE_URL}/api/homework/${selectedClass}`);
            currentClassHomework = await response.json();

            const subjects = ['All Subjects', ...new Set(currentClassHomework.map(hw => hw.subject))];
            subjectFilter.innerHTML = '';
            subjects.forEach(subject => subjectFilter.add(new Option(subject, subject)));
            
            subjectFilterContainer.classList.remove('hidden');
            renderHomework(currentClassHomework);
        } catch (error) {
            console.error('Fetch error:', error);
            homeworkList.innerHTML = `<div class="text-center text-red-500 py-16"><p>Could not load homework data.</p></div>`;
        }
    });

    subjectFilter.addEventListener('change', () => {
        const selectedSubject = subjectFilter.value;
        let assignmentsToRender = currentClassHomework;

        if (selectedSubject !== 'All Subjects') {
            assignmentsToRender = currentClassHomework.filter(hw => hw.subject === selectedSubject);
        }
        
        renderHomework(assignmentsToRender);
    });

    // --- Initial Setup ---
    function init() {
        const classes = ["1 Al-Ghazali", "1 As-Syafie", "2 Al-Ghazali", "2 As-Syafie", "3 Al-Ghazali", "3 As-Syafie", "4 Al-Ghazali", "4 As-Syafie", "5 Al-Ghazali", "5 As-Syafie", "6 Al-Ghazali", "6 As-Syafie"];
        classFilter.innerHTML = '<option value="" selected disabled>Select a class...</option>';
        classes.forEach(className => classFilter.add(new Option(className, className)));
    }

    init();
});
