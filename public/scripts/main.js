$(document).ready(function () {
  const $countdownDisplay = $("#countdown");
  const $startPomodoroButton = $("#startPomodoro");
  const $pauseButton = $("<button>")
    .text("Pause")
    .attr("id", "pauseButton")
    .hide();
  $startPomodoroButton.after($pauseButton);
  const $workDurationInput = $("#work-duration");
  const $breakDurationInput = $("#break-duration");
  const $timerSound = $("#timerSound")[0];

  const $taskInput = $("#taskInput");
  const $addTaskButton = $("#addTaskButton");
  const $taskList = $("#taskList");

  let isRunning = false;
  let isBreak = false;
  let isPaused = false;
  let timer;
  let timeLeft;

  // ---- Timer Functions ----

  function startCountdown(duration) {
    timeLeft = duration;
    $pauseButton.show();
    $startPomodoroButton.text("Cancel");
    isRunning = true;

    timer = setInterval(() => {
      if (!isPaused) {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        $countdownDisplay.text(`${minutes}:${seconds}`);

        timeLeft--;

        // when the timer reaches 0, stop the timer, play sound and switch to the next session
        if (timeLeft < 0) {
          clearInterval(timer);
          $timerSound.play();

          if (isBreak) {
            $pauseButton
              .text("Begin Working")
              .off("click")
              .on("click", () => {
                $timerSound.pause();
                startWorkSession();
              });
          } else {
            $pauseButton
              .text("Begin Break")
              .off("click")
              .on("click", () => {
                $timerSound.pause();
                startBreakSession();
              });
          }
        }
      }
    }, 1000);
  }

  function startWorkSession() {
    const workDuration = parseInt($workDurationInput.val()) * 60;
    isBreak = false;
    startCountdown(workDuration);
    $pauseButton.text("Pause").off("click").on("click", togglePause);
  }

  function startBreakSession() {
    const breakDuration = parseInt($breakDurationInput.val()) * 60;
    isBreak = true;
    startCountdown(breakDuration);
    $pauseButton.text("Pause").off("click").on("click", togglePause);
  }

  // Toggle pause/resume functionality
  function togglePause() {
    if (isPaused) {
      $pauseButton.text("Pause");
      isPaused = false;
    } else {
      $pauseButton.text("Resume");
      isPaused = true;
    }
  }

  // Event listener to start or cancel the Pomodoro when button is clicked
  $startPomodoroButton.on("click", function () {
    if (isRunning) {
      clearInterval(timer);
      $countdownDisplay.text("--:--");
      $startPomodoroButton.text("Start Pomodoro");
      $pauseButton.hide();
      isRunning = false;
      isPaused = false;
      $pauseButton.text("Pause");
    } else {
      startWorkSession();
    }
  });

  // ---- To-Do List Functions ----

  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    savedTasks.forEach((task) => addTaskToDOM(task));
  }

  function addTaskToDOM(task) {
    const $li = $("<li>");

    const $taskText = $("<span>").text(task.text);

    const $completeButton = $("<button>").text(
      task.completed ? "Undo" : "Complete"
    );
    $completeButton.on("click", function () {
      task.completed = !task.completed;
      saveTasks();
      $taskText.toggleClass("completed");
      $completeButton.text(task.completed ? "Undo" : "Complete");
    });

    const $deleteButton = $("<button>").text("Delete");
    $deleteButton.on("click", function () {
      $li.remove();
      deleteTask(task); 
    });

    if (task.completed) {
      $taskText.addClass("completed"); 
    }

    // Append task text and buttons to list item
    $li.append($taskText, $completeButton, $deleteButton);
    $taskList.append($li);
  }

  // Save tasks to localStorage
  function saveTasks() {
    const tasks = [];
    $taskList.find("li").each(function () {
      const taskText = $(this).find("span").text(); // Get text from span
      const completed = $(this).find("span").hasClass("completed"); // Check if span has completed class
      tasks.push({ text: taskText, completed });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Delete a task
  function deleteTask(taskToDelete) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.filter(
      (task) => task.text !== taskToDelete.text
    );
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  }

  // Add task event listener
  $addTaskButton.on("click", function () {
    const taskText = $taskInput.val().trim();
    if (taskText) {
      const task = { text: taskText, completed: false };
      addTaskToDOM(task);
      saveTasks();
      $taskInput.val(""); // Clear input field
    }
  });

  // Load tasks when the page is loaded
  loadTasks();
});
