class List {
  constructor(listName, tasks) {
    this.listName = listName;
    this.tasks = tasks;
  }
}

class Task {
  constructor(taskName) {
    this.taskName = taskName;
  }
}


class ListUI {
  constructor() {}

  // Prototypal method to create a new list
  createNewList(listName) {
    const toDoLists = document.querySelector("#toDoLists .card-columns");

    const newCard = document.createElement("div");
    newCard.className = "card mt-3 mr-3 d-block d-sm-inline-block"

    newCard.innerHTML = `
      <div class="card-body pb-1">
        <div class="card-title d-flex justify-content-between">
              <p class="h4 text-capitalize">${listName}</p>
              <input class="btn btn-danger" id="delList" type="button" value="Delete">
        </div>

        <div>
          <hr class="border-secondary">
        </div>

        <div>
          <form class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Enter Task" id="taskName" pattern=".{1,20}" required>
            <input class="btn btn-primary" type="submit" id="createTaskBtn" value="Create Task">
          </form>
        </div>

        <table class="table table-hover mb-0" id="taskList">
          <tbody></tbody>
        </table>
      </div>
    `;

    toDoLists.appendChild(newCard);
  }

  // Prototypal method to clear list name field
  clearListNameField() {
    document.querySelector("#listName").value = "";
  }

  delList(target) {
    if (target.id === "delList") {
      target.parentElement.parentElement.parentElement.remove();
      Store.deleteList(target.previousElementSibling.textContent);
    }
  }
}


class TaskUI {
  constructor() {}

  static createTaskRow(taskName) {
    const taskRow = document.createElement("tr");

    taskRow.innerHTML = `
      <td><input class="mt-1" type="checkbox" id="done"></td>
      <td class="w-100"><p class="h6 mt-1">${taskName}</p></td>
      <td>
        <button type="button" class="close text-danger" id="deleteTask" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </td>
      `;
    return taskRow;
  }

  //  Create a task
  createNewTask(event) {
    if (event.target.id === "createTaskBtn") {      
      if (`${event.target.previousElementSibling.value}` === "") {
        // taskUI.showError("Please give a task name.", "error");
      } else {
        const taskRow = TaskUI.createTaskRow(event.target.previousElementSibling.value);
        // Append the created element
        event.target.parentElement.parentElement.nextElementSibling.firstElementChild.appendChild(taskRow);

        // store task in local storage
        const task = new Task(event.target.previousElementSibling.value);
        Store.addTask(task, event.target.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.textContent);
      }

      event.preventDefault();
    }
  }

  // Clear the Task Name Field
  clearField(target) {
    if (target.id === "createTaskBtn") {
      target.previousElementSibling.value = "";
    }
  }

  // Delete a task
  deleteTask(target) {
    if (target.parentElement.id === "deleteTask") {
      const listName = target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.textContent;
      const taskName = target.parentElement.parentElement.previousElementSibling.firstElementChild.textContent;

      // Remove Task from storage
      Store.deleteTask(listName, taskName);
      // Remove Task from UI
      target.parentElement.parentElement.parentElement.remove();    
    }
  }
}


class Store {
  constructor() {}

  static getLists() {
    let lists;
    if (localStorage.getItem("lists") === null) {
      lists = [];
    } else {
      lists = JSON.parse(localStorage.getItem("lists"));
    }

    return lists;
  }

  // Store a list in local storage
  static addList(list) {
    const lists = Store.getLists();

    lists.push(list);

    localStorage.setItem("lists", JSON.stringify(lists));
  }

  // Display lists stored in local storage
  static displayLists() {
    const lists = Store.getLists();

    lists.forEach(function (list) {
      const listUI = new ListUI();
      const taskUI = new TaskUI();

      listUI.createNewList(list.listName);

      const taskListAll = document.querySelectorAll("#taskList");
      const taskLocation = taskListAll[taskListAll.length - 1].firstElementChild;
      // TaskUI
      list.tasks.forEach(function (task) {
        let taskRow = TaskUI.createTaskRow(task.taskName);
        taskLocation.appendChild(taskRow);
      })

    })
  }

  // Delete a list from local storage
  static deleteList(listName) {
    const lists = Store.getLists();

    lists.forEach(function (list, index) {
      if (list.listName.toLowerCase() === listName.toLowerCase()) {
        lists.splice(index, 1);
      }
    })
    localStorage.setItem("lists", JSON.stringify(lists));
  }

  static addTask(task, listName) {
    const lists = Store.getLists();

    lists.forEach(function (list) {
      if (list.listName === listName) {
        list.tasks.push(task);
      }
    })

    localStorage.setItem("lists", JSON.stringify(lists));
  }

  static deleteTask(listName, taskName) {
    const lists = Store.getLists();

    lists.forEach(function (list) {
      if (list.listName === listName) {
        list.tasks.forEach(function (task, index) {
          if (task.taskName === taskName) {
            list.tasks.splice(index, 1);
          }
        })
      }
    })

    localStorage.setItem("lists", JSON.stringify(lists));
  }
}


// DOM Content Loaded event to load lists from local storage
document.addEventListener("DOMContentLoaded", Store.displayLists());


// list create event listener
document.querySelector("#listForm").addEventListener("submit", function (e) {
  // Get the name of the list to create
  const listName = document.querySelector("#listName").value;

  // Instantiate a new List
  const list = new List(listName, []);
  // Instantiate ListUI
  const listUI = new ListUI();
  // Create a new list
  listUI.createNewList(listName);
  // Store List in local storage
  Store.addList(list);
  // Clear list Name
  listUI.clearListNameField();

  // Prevent default behaviour
  e.preventDefault();
})


// List delete event listener
document.querySelector(".card-columns").addEventListener("click", function (e) {
  const listUI = new ListUI();
  const taskUI = new TaskUI();

  // Delete the list from storage and UI
  listUI.delList(e.target);

  // Add a task 
  taskUI.createNewTask(e);
  // Clear the task name field
  taskUI.clearField(e.target);

  // Delete a task
  taskUI.deleteTask(e.target);
})