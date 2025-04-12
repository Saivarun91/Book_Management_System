const API_URL = 'http://localhost:3000/books';
let updateModal;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal
    updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
    
    // Fetch initial books
    fetchBooks();
    
    // Add event listeners
    document.getElementById('addBookForm').addEventListener('submit', handleAdd);
    document.getElementById('updateForm').addEventListener('submit', handleUpdate);
    
    // Initialize tooltips
    const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltips.map(tooltip => new bootstrap.Tooltip(tooltip));
});

// Fetch all books
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch books');
        const books = await response.json();
        renderBooks(books);
    } catch (err) {
        showMessage('Error loading books', 'danger');
    }
}

// Render books table
function renderBooks(books) {
    const tbody = document.getElementById('booksList');
    document.getElementById('bookCount').textContent = `${books.length} books`;
    
    tbody.innerHTML = books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td class="text-center">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="handleEdit('${book._id}')"
                            data-bs-toggle="tooltip" 
                            title="Edit book">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="handleDelete('${book._id}')"
                            data-bs-toggle="tooltip" 
                            title="Delete book">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Add new book
async function handleAdd(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookData = Object.fromEntries(formData);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        if (!response.ok) throw new Error('Failed to add book');

        showMessage('Book added successfully', 'success');
        e.target.reset();
        await fetchBooks();
    } catch (err) {
        showMessage('Error adding book', 'danger');
    }
}

// Update the handleEdit function
async function handleEdit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch book');
        }
        
        const book = await response.json();
        
        // Set values in the modal form
        document.getElementById('updateId').value = book._id;
        document.getElementById('updateTitle').value = book.title;
        document.getElementById('updateAuthor').value = book.author;
        document.getElementById('updateGenre').value = book.genre;
        
        // Show modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateModal')) 
            || new bootstrap.Modal(document.getElementById('updateModal'));
        modal.show();
    } catch (err) {
        console.error('Edit error:', err);
        showMessage('Error loading book details', 'danger');
    }
}

// Update book - Update this function
async function handleUpdate(e) {
    e.preventDefault();
    
    const id = document.getElementById('updateId').value;
    const bookData = {
        title: document.getElementById('updateTitle').value.trim(),
        author: document.getElementById('updateAuthor').value.trim(),
        genre: document.getElementById('updateGenre').value.trim()
    };

    // Validate input
    if (!bookData.title || !bookData.author || !bookData.genre) {
        showMessage('All fields are required', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update book');
        }

        // Close modal
        const modalEl = document.getElementById('updateModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        showMessage('Book updated successfully', 'success');
        await fetchBooks();
    } catch (err) {
        console.error('Update error:', err);
        showMessage(err.message || 'Error updating book', 'danger');
    }
}

// Delete book
async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete book');

        showMessage('Book deleted successfully', 'success');
        await fetchBooks();
    } catch (err) {
        showMessage('Error deleting book', 'danger');
    }
}

// Show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => messageDiv.style.display = 'none', 3000);
}
