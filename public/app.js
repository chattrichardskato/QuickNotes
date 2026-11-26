// app.js
// Frontend logic: fetch notes from API, render them, handle add/delete.
// Demonstrates client-server communication via fetch().

const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('note-list');

const API = '/api/notes';

// Fetch and render all notes
async function loadNotes() {
  const res = await fetch(API);
  const notes = await res.json();
  list.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${escapeHtml(note.text)}</span>
      <button data-id="${note.id}">Delete</button>
    `;
    list.appendChild(li);
  });
}

// Escape HTML to prevent XSS in user-supplied text
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Handle form submission (create note)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

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
});

// Handle delete (event delegation)
list.addEventListener('click', async (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  const id = e.target.dataset.id;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  await loadNotes();
});

// Initial load
loadNotes();