// Function to handle tab switching
function openPage(pageName, elmnt, color) {
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"; // Hide all tab contents
    }

    var tablinks = document.getElementsByClassName("tablink");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = ""; // Remove background color from all tabs
    }

    document.getElementById(pageName).style.display = "block"; // Show the selected tab
    elmnt.style.backgroundColor = color; // Highlight the active tab
}

// Set the default open tab
document.getElementById("defaultOpen").click();

// Function to fetch and display books
function fetchBooks() {
    fetch('/book')
        .then(response => response.json())
        .then(books => {
            //mapping of status ids to tab ids 
            const tabs = {
                '1': 'Current',
                '2': 'WanttoRead',
                '3': 'DNF',
                '4': 'Read'
            };

            // Loop through each status ID and update the corresponding tab content
            Object.keys(tabs).forEach(statusId => {
                const tabId = tabs[statusId];
                const bookList = document.querySelector(`#${tabId} .book-list`);
                bookList.innerHTML = ''; // Clear existing books

                // Filter books by status and create book elements
                books.filter(book => book.Status_idStatus == statusId)
                     .forEach(book => {
                         const bookElement = document.createElement('div');
                         bookElement.classList.add('book-item');
                         //populate book items on the screen 
                         bookElement.innerHTML = `
                            <h4>${book.title}</h4>
                            <p><strong>Author:</strong> ${book.author}</p>
                            <p><strong>Review:</strong> ${book.review}</p>
                            <p><strong>Rating:</strong> ${book.rating !== null ? book.rating : 'No Rating'}</p>
                            <button onclick="deleteBook(${book.book_id})">Delete</button>
                         `;
                         bookList.appendChild(bookElement);
                     });
            });
        })
        .catch(error => console.error('Error fetching books:', error));
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    var title = document.getElementById("title").value;
    var author = document.getElementById("author").value;
    var review = document.getElementById("review").value;
    var rating = document.getElementById("rating").value;
    var status = document.getElementById("status").value;

    var ratingValue = rating === "" ? null : parseInt(rating);
    var book = {
        title: title,
        author: author,
        review: review,
        rating: ratingValue,
        statusId: status 
    };

    var url = '/addBook'; // Always add new books

    console.log("Submitting book:", book);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchBooks(); // Refresh book list
            document.getElementById("bookForm").reset(); // Clear form
            document.getElementById("bookId").value = ''; 
            alert("Book successfully added!");
        } else {
            console.error('Error adding book:', data.message);
        }
    })
    .catch(error => console.error('Fetch error:', error));
}

// Function to delete a book
function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        fetch(`/deleteBook/${bookId}`, { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchBooks(); // Refresh book list
                alert("Book successfully deleted!");
            } else {
                console.error('Error deleting book:', data.message);
                alert("Error deleting book. Please try again.");
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert("Error deleting book. Please try again.");
        });
    }
}


// Fetch and display books on page load
document.addEventListener('DOMContentLoaded', function() {
    fetchBooks();
});


