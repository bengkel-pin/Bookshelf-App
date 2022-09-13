let search = false;
const formContainer = document.getElementById('form-container');

const inputs = document.querySelectorAll('.form-input')
window.addEventListener('DOMContentLoaded', function () {
    const addButton = document.getElementById('add-book-button');
    addButton.addEventListener('click', function() {
        formContainer.style.display = 'block';
    });

    const closeButton = document.getElementById('close-form');
    closeButton.addEventListener('click', function() {
        formContainer.style.display = 'none';
    })

    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function () {
        event.preventDefault;
        addBook();
        for (let input of inputs) {
            input.value = '';
        }
    });

    const submitSearch = document.getElementById('search-form');
    submitSearch.addEventListener("keyup", function () {

        const input = document.getElementById('search-input').value;
    
        if (input == '') {
            search = false;
            for (const bookItem of books) {
                bookItem.isIncluded = true;
            }
            document.dispatchEvent(new Event(RENDER_EVENT));
        } else {
            search = true;
        }

        if (search) {
            searchBook(input);
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

const books = [];
const RENDER_EVENT = 'render-event';

function addBook() {
    const bookTitle = document.getElementById('book-title').value;
    const bookAuthor = document.getElementById('book-author').value;
    const year = document.getElementById('year-release').value;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, year, false, false, true);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

const emptyBookListShelf = document.getElementById('empty-book-list-shelf');

document.addEventListener(RENDER_EVENT, function () {

    const bookList = document.getElementById('book-list-shelf');
    bookList.innerHTML = '';

    const bookReading = document.getElementById('being-read-shelf');
    bookReading.innerHTML = '';

    const bookCompleted = document.getElementById('finished-read-shelf');
    bookCompleted.innerHTML = '';

    let userFinishedBook = false;
    let userReadingBook = false;
    for (bookItem of books) {
        if (bookItem.isRead) userReadingBook = true;
        if (bookItem.isComplete) userFinishedBook = true;
    }    

    if (books.length != 0) {
        emptyBookListShelf.setAttribute('hidden', 'true');
    } else {
        emptyBookListShelf.removeAttribute('hidden');
        bookList.append(emptyBookListShelf);
    }

    for (const bookItem of books) {
        const bookContent = makeBook(bookItem);
        if (userFinishedBook || userReadingBook) {
            const bookButton = makeBookToRead(bookContent, bookItem);
            if (bookItem.isRead && bookItem.isIncluded) {
                bookReading.append(bookButton);
            } else if (bookItem.isComplete && bookItem.isIncluded) {
                bookCompleted.append(bookButton);
            }
        }
    }

    let bookFound = false;
    let bookFoundRead = false;
    let bookFoundComplete = false;
    for (const bookItem of books) {
        if (bookItem.isIncluded) {
            bookFound = true;
            const bookContent = makeBook(bookItem);
            const bookInTheList = makeBookList(bookContent, bookItem);
            bookList.append(bookInTheList);
        }

        if(bookItem.isIncluded && bookItem.isRead){
            bookFoundRead = true;
        }

        if(bookItem.isIncluded && bookItem.isComplete){
            bookFoundComplete = true;
        }
    }

    if(!bookFound && search){
        bookList.append(emptyBookSearch());
    }else {
        if (userReadingBook) {
            emptyBookListBeing.setAttribute('hidden', 'true');
        } else {
            emptyBookListBeing.removeAttribute('hidden');
            bookReading.append(emptyBookListBeing);
        }

        if (userFinishedBook) {
            emptyBooksListAlready.setAttribute('hidden', 'true');
        } else {
            emptyBooksListAlready.removeAttribute('hidden');
            bookCompleted.append(emptyBooksListAlready);
        }
    }

    if(!bookFoundRead && search){
        bookReading.append(emptyBookSearch());
        emptyBookListBeing.setAttribute('hidden', 'true');
    }

    if(!bookFoundComplete && search){
        emptyBooksListAlready.setAttribute('hidden', 'true');
        bookCompleted.append(emptyBookSearch());
    }
});

function emptyBookSearch(){
    emptyBookListShelf.setAttribute('hidden', 'true');
    const bookNotFound = document.createElement('p');
    bookNotFound.innerText = 'Book Not Found';

    const container = document.createElement('div');
    container.classList.add('empty-book-list');
    container.append(bookNotFound);

    return container;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isRead, isComplete, isIncluded) {
    return {
        id,
        title,
        author,
        year,
        isRead,
        isComplete,
        isIncluded
    }
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h2');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = bookObject.author;
    bookAuthor.classList.add('author');

    const bookYear = document.createElement('p');
    bookYear.innerText = bookObject.year;

    const contentContainer = document.createElement('div');
    contentContainer.classList.add('content-container');
    contentContainer.append(bookTitle, bookAuthor, bookYear);

    const entireStuff = document.createElement('div');
    entireStuff.classList.add('entire-stuff');
    entireStuff.append(contentContainer);

    return entireStuff;
}

function makeBookList(bookContent, bookObject) {
    const entireStuff = bookContent;

    let readButton;
    if (bookObject.isRead) {
        readButton = document.createElement('p');
        readButton.innerText = 'You are reading this book';

    } else if (bookObject.isComplete) {
        readButton = document.createElement('p');
        readButton.innerText = 'You have read this book';
    } else {
        readButton = document.createElement('button');
        readButton.innerText = 'Read';

        readButton.addEventListener('click', function () {
            addBookToBeingRead(bookObject.id);
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';

    deleteButton.addEventListener('click', function () {
        removeBookFromList(bookObject.id);
    });

    entireStuff.append(readButton, deleteButton);

    const container = document.createElement('div');
    container.classList.add('wrapper');
    container.append(entireStuff);
    container.setAttribute('id', `book-${bookObject.id}`);

    return container;
}

function undoReadTheBook(bookObjectId) {
    const bookTarget = findBook(bookObjectId);

    if (bookTarget == null) return;

    bookTarget.isRead = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToFinished(bookObjectId) {
    const bookTarget = findBook(bookObjectId);
    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    bookTarget.isRead = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToBeingRead(bookObjectId) {
    const bookTarget = findBook(bookObjectId);

    if (bookTarget == null) return;

    bookTarget.isRead = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function removeBookFromList(bookObjectId) {
    const bookTarget = findBookIndex(bookObjectId);
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookObjectId) {
    for (const index in books) {
        if (books[index].id === bookObjectId) {
            return index;
        }
    }

    return -1;
}

const emptyBookListBeing = document.getElementById('empty-book-list-being');
const emptyBooksListAlready = document.getElementById('empty-book-list-already');

function makeBookToRead(bookContent, bookObject) {
    const entireStuff = bookContent;
    if (bookObject.isComplete) {
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';

        deleteButton.addEventListener('click', function () {
            removeBookFromFinished(bookObject.id);
        });

        const undoButton = document.createElement('button');
        undoButton.innerText = 'Cancel';

        undoButton.addEventListener('click', function () {
            undoFinishedTheBook(bookObject.id);
        });

        entireStuff.append(undoButton, deleteButton);
    } else {
        const undoButton = document.createElement('button');
        undoButton.innerText = 'Cancel';

        undoButton.addEventListener('click', function () {
            undoReadTheBook(bookObject.id);
        });

        const doneReading = document.createElement('button');
        doneReading.innerText = 'Done';

        doneReading.addEventListener('click', function () {
            addBookToFinished(bookObject.id);
        });

        entireStuff.append(undoButton, doneReading);
    }
    const container = document.createElement('div');
    container.classList.add('wrapper');
    container.setAttribute('id', `book-${bookObject.id}`);
    container.append(entireStuff);
    return container;
}

function removeBookFromFinished(bookObjectId) {
    const bookTarget = findBook(bookObjectId);

    if (bookTarget != null) {
        bookTarget.isComplete = false;

        document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
        return;
    }
    saveData();
}

function undoFinishedTheBook(bookObjectId) {
    const bookTarget = findBook(bookObjectId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    bookTarget.isRead = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBook(input) {
    const filter = input.toUpperCase();
    for (const bookItem of books) {
        if (bookItem.title.toUpperCase().indexOf(filter) > -1) {
            bookItem.isIncluded = true;
        } else {
            bookItem.isIncluded = false;
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const bookItem of data) {
        books.push(bookItem);
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}
