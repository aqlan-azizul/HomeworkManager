document.addEventListener('DOMContentLoaded', () => {
    // The live backend URL for your application
    const API_BASE_URL = 'https://homeworkmanager.onrender.com';

    // --- Dropdown Content Lists ---
    const subjectList = ["Al-Quran", "Feqah", "Sirah", "Hadis", "Hafazan", "Akhlak", "Bahasa Arab", "Khat", "Jawi", "Tauhid", "UPKK A", "UPKK B", "UPKK C", "UPSRA A", "UPSRA B", "UPSRA C"];
    const classList = ["1 Al-Ghazali", "1 As-Syafie", "2 Al-Ghazali", "2 As-Syafie", "3 Al-Ghazali", "3 As-Syafie", "4 Al-Ghazali", "4 As-Syafie", "5 Al-Ghazali", "5 As-Syafie", "6 Al-Ghazali", "6 As-Syafie"];
    const methodList = ["Buku Aktiviti", "Buku Tulis", "Kertas A4", "Lain-lain (Rujuk nota tambahan)"];

    // --- Get HTML Elements ---
    const homeworkTableBody = document.getElementById('homework-table-body');
    const addHomeworkForm = document.getElementById('add-homework-form');
    
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-homework-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // --- Main Functions ---
    const populateDropdowns = (formId, lists) => {
        for (const [list, id] of lists) {
            const dropdown = document.querySelector(`${formId} #${id}`);
            const isMultiSelect = dropdown.multiple;
            if (isMultiSelect) {
                dropdown.innerHTML = '';
            } else {
                 dropdown.innerHTML = `<option value="" disabled selected>Select a ${id.replace('edit-','') }...</option>`;
            }
            list.forEach(item => dropdown.add(new Option(item, item)));
        }
    };
    
    const fetchAndDisplayHomework = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/homework`);
            const homeworks = await response.json();
            
            homeworkTableBody.innerHTML = '';

            homeworks.forEach(hw => {
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="py-3 px-2">${hw.class}</td>
                    <td class="py-3 px-2">${hw.subject}</td>
                    <td class="py-3 px-2">${hw.method || 'N/A'}</td>
                    <td class="py-3 px-2">${hw.assignment}</td>
                    <td class="py-3 px-2">${new Date(hw.dueDate + 'T00:00:00').toLocaleDateString()}</td>
                    <td class="py-3 px-2">
                        <button class="text-blue-500 hover:text-blue-700 mr-2 edit-btn" data-id="${hw.id}">Edit</button>
                        <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${hw.id}">Delete</button>
                    </td>
                `;
                homeworkTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching homework:', error);
        }
    };

    const openModal = () => editModal.classList.replace('hidden', 'flex');
    const closeModal = () => editModal.classList.replace('flex', 'hidden');

    // --- Event Listeners ---
    addHomeworkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addHomeworkForm);
        const classes = formData.getAll('class');
        const methods = formData.getAll('method');
        
        const newHomeworkData = {
            classes: classes,
            subject: formData.get('subject'),
            method: methods.join(', '), 
            assignment: formData.get('assignment'),
            dueDate: formData.get('dueDate'),
            notes: formData.get('notes'),
        };

        try {
            await fetch(`${API_BASE_URL}/api/homework`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHomeworkData)
            });
            addHomeworkForm.reset();
            document.getElementById('subject').selectedIndex = 0;
            fetchAndDisplayHomework();
        } catch (error) {
            console.error('Error adding homework:', error);
        }
    });

    homeworkTableBody.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this assignment?')) {
                try {
                    await fetch(`${API_BASE_URL}/api/homework/${id}`, { method: 'DELETE' });
                    fetchAndDisplayHomework();
                } catch (error) {
                    console.error('Error deleting homework:', error);
                }
            }
        }
        
        if (e.target.classList.contains('edit-btn')) {
            const response = await fetch(`${API_BASE_URL}/api/homework/item/${id}`);
            const hw = await response.json();
            
            editForm.elements.id.value = hw.id;
            editForm.elements['edit-subject'].value = hw.subject;
            editForm.elements['edit-class'].value = hw.class;
            editForm.elements['edit-assignment'].value = hw.assignment;
            editForm.elements['edit-dueDate'].value = hw.dueDate;
            editForm.elements['edit-notes'].value = hw.notes;

            const selectedMethods = hw.method ? hw.method.split(', ') : [];
            Array.from(editForm.elements['edit-method'].options).forEach(option => {
                option.selected = selectedMethods.includes(option.value);
            });
            
            openModal();
        }
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const id = formData.get('id');
        const methods = formData.getAll('method');
        
        // BUG FIX: Use the correct form field names for the edit form
        const updatedHomework = {
            subject: formData.get('edit-subject'),
            class: formData.get('edit-class'),
            method: methods.join(', '),
            assignment: formData.get('edit-assignment'),
            dueDate: formData.get('edit-dueDate'),
            notes: formData.get('edit-notes')
        };
        
        await fetch(`${API_BASE_URL}/api/homework/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedHomework)
        });

        closeModal();
        fetchAndDisplayHomework();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);

    // --- Initial Page Load ---
    populateDropdowns('#add-homework-form', [ [subjectList, 'subject'], [classList, 'class'], [methodList, 'method'] ]);
    populateDropdowns('#edit-homework-form', [ [subjectList, 'edit-subject'], [classList, 'edit-class'], [methodList, 'edit-method'] ]);
    fetchAndDisplayHomework();
});
