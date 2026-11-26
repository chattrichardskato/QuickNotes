// app.js
// Frontend logic: fetch notes from API, render them, handle add/delete.

const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('note-list');

const API = '/api/notes';

// Fetch and render all notes
async function loadNotes() {
  try {
    const res = await fetch(API);
    const notes = await res.json();
    
    list.innerHTML = '';

    if (notes.length === 0) {
      list.innerHTML = '<div class="empty-state">No notes yet. Add one above!</div>';
      return;
    }

    notes.forEach(note => {
      const li = document.createElement('li');
      
      const textSpan = document.createElement('span');
      textSpan.textContent = note.text; // Safe from XSS
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.dataset.id = note.id;
      
      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
}

// Handle form submission (create note)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      input.value = '';
      await loadNotes();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add note');
    }
  } catch (error) {
    alert('Network error. Is the server running?');
  }
});

// Handle delete (event delegation)
list.addEventListener('click', async (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const id = e.target.dataset.id;
  
  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    await loadNotes();
  } catch (error) {
    console.error('Failed to delete note:', error);
  }
});

// Initial load
loadNotes();