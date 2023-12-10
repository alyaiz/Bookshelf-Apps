const body = document.querySelector("body");
const modeToggle = body.querySelector(".mode-toggle");

// ========== DARK MODE LIGHT MODE ==========
let getMode = localStorage.getItem("MODE_I");
if (getMode && getMode === "dark") {
  body.classList.toggle("dark");
}

modeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  if (body.classList.contains("dark")) {
    localStorage.setItem("MODE_I", "dark");
  } else {
    localStorage.setItem("MODE_I", "light");
  }
});

// ========== KEY ==========
const LOCAL_JUMLAH_BUKU = "LOCAL_JUMLAH_BUKU_I";
const LOCAL_SELESAI_DIBACA = "LOCAL_SELESAI_DIBACA_I";
const LOCAL_BELUM_SELESAI_DIBACA = "LOCAL_BELUM_SELESAI_DIBACA_I";
const SAVED_EVENT = "SAVED_TODO_I";
const STORAGE_KEY = "BOOKSHELF_APPS_I";
const RENDER_EVENT = "RENDER_TODO_I";

// ========== CREATE OBJECT ==========
const books = [];

// ========== LOAD PAGE ==========
document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    const countValue = sumDataProperty();
    if (countValue === null) {
      localStorage.setItem(LOCAL_JUMLAH_BUKU, 0);
    } else {
      localStorage.setItem(LOCAL_JUMLAH_BUKU, countValue);
    }

    const countStatus2 = sumDataByStatus(false);
    if (countStatus2 === null) {
      localStorage.setItem(LOCAL_BELUM_SELESAI_DIBACA, 0);
    } else {
      localStorage.setItem(LOCAL_BELUM_SELESAI_DIBACA, countStatus2);
    }

    const countStatus3 = sumDataByStatus(true);
    if (countStatus3 === null) {
      localStorage.setItem(LOCAL_SELESAI_DIBACA, 0);
    } else {
      localStorage.setItem(LOCAL_SELESAI_DIBACA, countStatus3);
    }
  } else {
    Swal.fire("Gagal", "Browser kamu tidak mendukung local storage", "error");
  }

  const box1 = document.querySelector(".shortcut-count.shortcut-count-1 span");
  const box2 = document.querySelector(".shortcut-count.shortcut-count-2 span");
  const box3 = document.querySelector(".shortcut-count.shortcut-count-3 span");

  box1.innerText = localStorage.getItem(LOCAL_JUMLAH_BUKU);
  box2.innerText = localStorage.getItem(LOCAL_BELUM_SELESAI_DIBACA);
  box3.innerText = localStorage.getItem(LOCAL_SELESAI_DIBACA);

  const submitForm = document.getElementById("form-submit");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const formModal = document.getElementById("form-submit-modal");
  formModal.addEventListener("submit", (event) => {
    event.preventDefault();
    editBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// ========== CHECK STORAGE EXIST OR NOT ==========
function isStorageExist() {
  if (typeof Storage === undefined) {
    Swal.fire("Gagal", "Browser kamu tidak mendukung local storage", "error");
    return false;
  }
  return true;
}

// ========== SAVE DATA TO STORAGE ==========
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));

    const modal = document.getElementById("myModal");
    modal.style.display = "none";

    Swal.fire("Sukses", "Data buku berhasil disimpan", "success").then(() => {
      location.reload();
    });
  }
}

// ========== LOAD DATA FROM STORAGE ==========
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// ========== SUM DATA BY STATUS  ==========
function sumDataByStatus(status) {
  let count = 0;
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      if (book.isComplete === status) {
        count += 1;
      }
    }
    return count;
  } else {
    return null;
  }
}

// ========== SUM ALL DATA ==========
function sumDataProperty() {
  let totalSum = 0;
  const serializedData = localStorage.getItem(STORAGE_KEY);

  if (serializedData !== null) {
    let data = JSON.parse(serializedData);

    for (const item of data) {
      totalSum += 1;
    }
    return totalSum;
  } else {
    return null;
  }
}

// ========== ADD DATA TO OBJECT ==========
function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = parseInt(document.getElementById("year").value);
  const checkBox = document.getElementById("check-box").checked;

  let checBoxStatus = false;
  if (checkBox) {
    checBoxStatus = true;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    checBoxStatus
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// ========== GENERATE ID ==========
function generateId() {
  return +new Date();
}

// ========== GENERATE OBJECT ==========
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// ========== EDIT DATA ==========
function editBook() {
  const idInput = parseInt(document.getElementById("id-modal").value);
  const isCompleteInput = document.getElementById("isComplete-modal").value;
  const titleInput = document.getElementById("title-modal").value;
  const authorInput = document.getElementById("author-modal").value;
  const yearInput = parseInt(document.getElementById("year-modal").value);

  const isCompleteBool = isCompleteInput === "true"; // Mengubah ke boolean

  const bookTarget = findBookIndex(idInput);
  if (bookTarget === -1) return;

  const updatedBook = generateBookObject(
    idInput,
    titleInput,
    authorInput,
    yearInput,
    isCompleteBool
  );

  books[bookTarget] = updatedBook;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// ========== MAKE HTML ELEMENT ==========
function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const authorYear = document.createElement("h4");
  authorYear.innerText = bookObject.author + " - " + bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("book-content");
  textContainer.append(textTitle, authorYear);

  const boxContainer = document.createElement("div");
  boxContainer.classList.add("book-box");

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(boxContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete == false) {
    const accept = document.createElement("button");
    accept.classList.add("icon", "accept");
    accept.setAttribute("type", "submit");
    accept.innerHTML = '<i class="uil uil-check-circle"></i>';

    accept.addEventListener("click", function () {
      addTaskToFinished(bookObject.id);
    });

    const edit = document.createElement("button");
    edit.classList.add("icon", "edit");
    edit.setAttribute("type", "submit");
    edit.innerHTML = '<i class="uil uil-edit-alt"></i>';

    edit.addEventListener("click", function () {
      const modal = document.getElementById("myModal");
      modal.style.display = "block";
      showValueToFormEdit(bookObject);
    });

    const remove = document.createElement("button");
    remove.classList.add("icon", "delete");
    remove.setAttribute("type", "submit");
    remove.innerHTML = '<i class="uil uil-trash-alt"></i>';

    remove.addEventListener("click", function () {
      deleteTask(bookObject.id);
    });

    const action = document.createElement("div");
    action.classList.add("icons-box");
    action.append(accept, edit, remove);

    boxContainer.append(textContainer, action);
  } else {
    const undo = document.createElement("button");
    undo.classList.add("icon", "undo");
    undo.setAttribute("type", "submit");
    undo.innerHTML = '<i class="uil uil-history"></i>';

    undo.addEventListener("click", function () {
      undoTaskToUnfinished(bookObject.id);
    });

    const edit = document.createElement("button");
    edit.classList.add("icon", "edit");
    edit.setAttribute("type", "submit");
    edit.innerHTML = '<i class="uil uil-edit-alt"></i>';

    edit.addEventListener("click", function () {
      const modal = document.getElementById("myModal");
      modal.style.display = "block";
      showValueToFormEdit(bookObject);
    });

    edit.addEventListener("click", function () {
      const modal = document.getElementById("myModal");
      modal.style.display = "block";
    });

    const remove = document.createElement("button");
    remove.classList.add("icon", "delete");
    remove.setAttribute("type", "submit");
    remove.innerHTML = '<i class="uil uil-trash-alt"></i>';

    remove.addEventListener("click", function () {
      deleteTask(bookObject.id);
    });

    const action = document.createElement("div");
    action.classList.add("icons-box");
    action.append(undo, edit, remove);

    boxContainer.append(textContainer, action);
  }

  return container;
}

// ========== ADD TASK TO FINISHED ==========
function addTaskToFinished(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// ========== UNDO TASK TO UNFINISHED ==========
function undoTaskToUnfinished(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// ========== FIND DATA ==========
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// ========== DELETE TASK ==========
function deleteTask(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  Swal.fire({
    title: "Apakah anda yakin?",
    text: "Data buku tidak bisa dikembalikan setelah dihapus",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();

      Swal.fire("Dihapus!", "Data buku berhasil dihapus", "success");
    }
  });
}

// ========== FIND BOOK INDEX ==========
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

// ========== FIND BOOKS BY KEYWORD ==========
function findBooks() {
  const searchInput = document.getElementById("keyword").value.toLowerCase();

  const findBook = books.filter((book) => {
    const regex = new RegExp(searchInput, "i");

    // Check if book.year is a number and if it matches the search criteria
    const yearMatches =
      typeof book.year === "number" && book.year.toString().match(regex);

    return (
      (typeof book.title === "string" &&
        book.title.toLowerCase().match(regex)) ||
      (typeof book.author === "string" &&
        book.author.toLowerCase().match(regex)) ||
      yearMatches
    );
  });

  return findBook;
}

// ========== SHOW VALUE TO FORM EDIT ==========
function showValueToFormEdit(bookObject) {
  const idInput = document.getElementById("id-modal");
  const isCompleteInput = document.getElementById("isComplete-modal");
  const titleInput = document.getElementById("title-modal");
  const authorInput = document.getElementById("author-modal");
  const yearInput = document.getElementById("year-modal");

  idInput.setAttribute("value", bookObject.id);
  isCompleteInput.setAttribute("value", bookObject.isComplete);
  titleInput.setAttribute("value", bookObject.title);
  authorInput.setAttribute("value", bookObject.author);
  yearInput.setAttribute("value", bookObject.year);
}

// ========== RENDER EVENT ==========
document.addEventListener(RENDER_EVENT, function () {
  const unfinished = document.getElementById("unfinished");
  const finished = document.getElementById("finished");
  const belumSelesaiDibacaP = document.querySelector("#belum-selesai-dibaca");
  const selesaiDibacaP = document.querySelector("#selesai-dibaca");

  let isSearching = false;

  const formSearch = document.getElementById("form-submit-search");
  formSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    const foundBook = findBooks();

    if (foundBook.length > 0) {
      Swal.fire("Sukses", "Buku berhasil ditemukan", "success");
    } else {
      Swal.fire("Gagal", "Buku yang anda cari tidak ditemukan", "error");
    }

    unfinished.innerHTML = "";
    finished.innerHTML = "";

    isSearching = true;

    if (isSearching) {
      for (const bookItem of foundBook) {
        const bookElement = makeBook(bookItem);

        if (bookItem.isComplete == false) {
          unfinished.append(bookElement);
        } else if (bookItem.isComplete == true) {
          finished.append(bookElement);
        }
      }
    }

    if (unfinished.children.length > 0) {
      belumSelesaiDibacaP.setAttribute("hidden", true);
    } else {
      belumSelesaiDibacaP.removeAttribute("hidden");
    }
    if (finished.children.length > 0) {
      selesaiDibacaP.setAttribute("hidden", true);
    } else {
      selesaiDibacaP.removeAttribute("hidden");
    }
  });

  unfinished.innerHTML = "";
  finished.innerHTML = "";

  if (!isSearching) {
    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);

      if (bookItem.isComplete == false) {
        unfinished.append(bookElement);
      } else if (bookItem.isComplete == true) {
        finished.append(bookElement);
      }
    }
  }

  if (unfinished.children.length > 0) {
    belumSelesaiDibacaP.setAttribute("hidden", true);
  } else {
    belumSelesaiDibacaP.removeAttribute("hidden");
  }
  if (finished.children.length > 0) {
    selesaiDibacaP.setAttribute("hidden", true);
  } else {
    selesaiDibacaP.removeAttribute("hidden");
  }
});

// ========== CLOSE MODAL ==========
const modal = document.getElementById("myModal");

const tombolTutup = modal.querySelector(".close");
tombolTutup.addEventListener("click", function () {
  modal.style.display = "none";
});
