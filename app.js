
        function saveToLocalStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        function getFromLocalStorage(key) {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }

        const navbar = document.getElementById('main-navbar');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        
        function toggleHamburger() {
            const open = navbar.classList.toggle('open');
            hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function closeMobileMenu() {
            if (navbar.classList.contains('open')) {
                navbar.classList.remove('open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        }

        function showTab(tabName, fromMobile = false) {
            const sections = ['todo', 'pomodoro', 'habits', 'notes', 'quote'];
            sections.forEach(section => {
                const el = document.getElementById(`${section}-section`);
                if (el) el.classList.add('hidden');
            });
            const target = document.getElementById(`${tabName}-section`);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            const selector = `.nav-btn[data-tab="${tabName}"]`;
            document.querySelectorAll(selector).forEach(b => b.classList.add('active'));

            if (fromMobile) closeMobileMenu();
        }

        let todos = getFromLocalStorage('todos') || [];

        function renderTodos() {
            const list = document.getElementById('todo-list');
            if (todos.length === 0) {
                list.innerHTML = '<div class="empty-state">No tasks yet. Add one to get started!</div>';
            } else {
                list.innerHTML = todos.map(todo => `
                    <div class="item">
                        <div class="checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo('${todo.id}')"></div>
                        <span class="item-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                        <button class="delete-btn" onclick="deleteTodo('${todo.id}')">🗑</button>
                    </div>
                `).join('');
            }
            const remaining = todos.filter(t => !t.completed).length;
            document.getElementById('todo-count').textContent = `${remaining} tasks remaining`;
        }

        function addTodo() {
            const input = document.getElementById('todo-input');
            const text = input.value.trim();
            if (text) {
                todos.push({ id: Date.now().toString(), text, completed: false });
                saveToLocalStorage('todos', todos);
                input.value = '';
                renderTodos();
            }
        }

        function toggleTodo(id) {
            todos = todos.map(todo => 
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            );
            saveToLocalStorage('todos', todos);
            renderTodos();
        }

        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            saveToLocalStorage('todos', todos);
            renderTodos();
        }

        document.getElementById('todo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });

        let timerInterval = null;
        let minutes = 25;
        let seconds = 0;
        let isRunning = false;
        let isBreak = false;

        function updateTimerDisplay() {
            const display = document.getElementById('timer-display');
            display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            display.className = isBreak ? 'timer-display break' : 'timer-display';
            document.getElementById('timer-mode').textContent = isBreak ? 'Break Time' : 'Focus Time';
            document.getElementById('timer-label').textContent = isBreak ? '5 minute break' : '25 minute work session';
        }

        function toggleTimer() {
            isRunning = !isRunning;
            document.getElementById('timer-btn-text').textContent = isRunning ? 'Pause' : 'Start';
            
            if (isRunning) {
                timerInterval = setInterval(() => {
                    if (seconds === 0) {
                        if (minutes === 0) {
                            isRunning = false;
                            document.getElementById('timer-btn-text').textContent = 'Start';
                            clearInterval(timerInterval);
                            
                            if (!isBreak) {
                                isBreak = true;
                                minutes = 5;
                                seconds = 0;
                            } else {
                                isBreak = false;
                                minutes = 25;
                                seconds = 0;
                            }
                        } else {
                            minutes--;
                            seconds = 59;
                        }
                    } else {
                        seconds--;
                    }
                    updateTimerDisplay();
                }, 1000);
            } else {
                clearInterval(timerInterval);
            }
        }

        function resetTimer() {
            isRunning = false;
            isBreak = false;
            minutes = 25;
            seconds = 0;
            clearInterval(timerInterval);
            document.getElementById('timer-btn-text').textContent = 'Start';
            updateTimerDisplay();
        }

        let habits = getFromLocalStorage('habits') || [];

        function renderHabits() {
            const list = document.getElementById('habit-list');
            if (habits.length === 0) {
                list.innerHTML = '<div class="empty-state">No habits yet. Start tracking one!</div>';
            } else {
                list.innerHTML = habits.map(habit => {
                    const completed = isHabitCompletedToday(habit);
                    const streak = getHabitStreak(habit);
                    return `
                        <div class="item">
                            <div class="checkbox ${completed ? 'checked' : ''}" onclick="toggleHabit('${habit.id}')"></div>
                            <div class="item-text">
                                <div>${habit.name}</div>
                                ${streak > 0 ? `<div class="streak">🔥 ${streak} day streak</div>` : ''}
                            </div>
                            <button class="delete-btn" onclick="deleteHabit('${habit.id}')">🗑</button>
                        </div>
                    `;
                }).join('');
            }
        }

        function addHabit() {
            const input = document.getElementById('habit-input');
            const name = input.value.trim();
            if (name) {
                habits.push({ id: Date.now().toString(), name, completedDates: [] });
                saveToLocalStorage('habits', habits);
                input.value = '';
                renderHabits();
            }
        }

        function isHabitCompletedToday(habit) {
            const today = new Date().toDateString();
            return habit.completedDates.includes(today);
        }

        function toggleHabit(id) {
            const today = new Date().toDateString();
            habits = habits.map(habit => {
                if (habit.id === id) {
                    const completedDates = habit.completedDates.includes(today)
                        ? habit.completedDates.filter(date => date !== today)
                        : [...habit.completedDates, today];
                    return { ...habit, completedDates };
                }
                return habit;
            });
            saveToLocalStorage('habits', habits);
            renderHabits();
        }

        function deleteHabit(id) {
            habits = habits.filter(habit => habit.id !== id);
            saveToLocalStorage('habits', habits);
            renderHabits();
        }

        function getHabitStreak(habit) {
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                if (habit.completedDates.includes(checkDate.toDateString())) {
                    streak++;
                } else {
                    break;
                }
            }
            return streak;
        }

        document.getElementById('habit-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addHabit();
        });

        let notes = getFromLocalStorage('notes') || [];
        let editingNoteId = null;

        function renderNotes() {
            const list = document.getElementById('notes-list');
            if (notes.length === 0) {
                list.innerHTML = '<div class="empty-state">No notes yet. Create one to get started!</div>';
            } else {
                list.innerHTML = notes.map(note => `
                    <div class="note-card">
                        <div class="note-header">
                            <div class="note-title">${note.title}</div>
                            <div class="note-actions">
                                <button class="delete-btn" onclick="editNote('${note.id}')" style="color: var(--primary);">✏️</button>
                                <button class="delete-btn" onclick="deleteNote('${note.id}')">🗑</button>
                            </div>
                        </div>
                        <div class="note-content">${note.content || 'Empty note'}</div>
                        <div class="note-date">${formatDate(note.createdAt)}</div>
                    </div>
                `).join('');
            }
        }

        function createNote() {
            const newNote = {
                id: Date.now().toString(),
                title: 'New Note',
                content: '',
                createdAt: new Date().toISOString()
            };
            notes.unshift(newNote);
            editingNoteId = newNote.id;
            document.getElementById('note-title').value = newNote.title;
            document.getElementById('note-content').value = newNote.content;
            document.getElementById('note-edit-form').classList.remove('hidden');
        }

        function editNote(id) {
            const note = notes.find(n => n.id === id);
            if (note) {
                editingNoteId = id;
                document.getElementById('note-title').value = note.title;
                document.getElementById('note-content').value = note.content;
                document.getElementById('note-edit-form').classList.remove('hidden');
            }
        }

        function saveNote() {
            if (editingNoteId) {
                const title = document.getElementById('note-title').value.trim() || 'Untitled';
                const content = document.getElementById('note-content').value;
                notes = notes.map(note =>
                    note.id === editingNoteId ? { ...note, title, content } : note
                );
                saveToLocalStorage('notes', notes);
                cancelEdit();
                renderNotes();
            }
        }

        function cancelEdit() {
            editingNoteId = null;
            document.getElementById('note-title').value = '';
            document.getElementById('note-content').value = '';
            document.getElementById('note-edit-form').classList.add('hidden');
        }

        function deleteNote(id) {
            notes = notes.filter(note => note.id !== id);
            saveToLocalStorage('notes', notes);
            if (editingNoteId === id) {
                cancelEdit();
            }
            renderNotes();
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        const quotes = [
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
            { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
            { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
            { text: "Dream bigger. Do bigger.", author: "Unknown" },
            { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
            { text: "Great things never come from comfort zones.", author: "Unknown" },
            { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" }
        ];

        function displayQuote() {
            const storedQuote = getFromLocalStorage('dailyQuote');
            const storedDate = localStorage.getItem('dailyQuoteDate');
            const today = new Date().toDateString();

            let quote;
            if (storedDate === today && storedQuote) {
                quote = storedQuote;
            } else {
                quote = quotes[Math.floor(Math.random() * quotes.length)];
                saveToLocalStorage('dailyQuote', quote);
                localStorage.setItem('dailyQuoteDate', today);
            }

            document.getElementById('quote-text').textContent = `"${quote.text}"`;
            document.getElementById('quote-author').textContent = `— ${quote.author}`;
        }

        function getNewQuote() {
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            document.getElementById('quote-text').textContent = `"${quote.text}"`;
            document.getElementById('quote-author').textContent = `— ${quote.author}`;
            saveToLocalStorage('dailyQuote', quote);
        }

        renderTodos();
        renderHabits();
        renderNotes();
        displayQuote();
        updateTimerDisplay();

        document.addEventListener('click', (e) => {
            const navContainer = document.querySelector('.navbar-container');
            
            if (!navContainer.contains(e.target) && navbar.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileMenu();
        });
