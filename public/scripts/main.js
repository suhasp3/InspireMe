$(document).ready(function() {
    // Get elements from the DOM using jQuery
    const $countdownDisplay = $("#countdown");
    const $startPomodoroButton = $("#startPomodoro");
    const $nextSessionButton = $("#nextSessionButton");
    const $pauseButton = $("<button>").text("Pause").attr("id", "pauseButton").hide(); // Create Pause Button
    $startPomodoroButton.after($pauseButton); // Add the Pause button after Start Pomodoro
    const $workDurationInput = $("#work-duration");
    const $breakDurationInput = $("#break-duration");
    const $timerSound = $("#timerSound")[0]; // jQuery returns an array-like object, so we need [0] to access the audio element

    // To-Do List elements
    const $taskInput = $("#taskInput");
    const $addTaskButton = $("#addTaskButton");
    const $taskList = $("#taskList");

    let isRunning = false;
    let isBreak = false; // Track if it's a break or work session
    let isPaused = false; // Track if the timer is paused
    let timer;
    let timeLeft; // Store the time left

    // ---- Timer Functions ----
    // Function to start the countdown
    function startCountdown(duration) {
        timeLeft = duration;
        $pauseButton.show(); // Show the Pause button
        $nextSessionButton.hide(); // Hide the Next Session button
        $startPomodoroButton.text("Cancel"); // Change Start button to Cancel
        isRunning = true; // Mark as running

        timer = setInterval(() => {
            if (!isPaused) {
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;

                // Format time display
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                // Update the countdown display
                $countdownDisplay.text(`${minutes}:${seconds}`);

                // Decrement time
                timeLeft--;

                // When the timer reaches 0, stop the timer, play sound and show alert
                if (timeLeft < 0) {
                    clearInterval(timer);
                    $timerSound.play(); // Play the sound when timer ends

                    if (isBreak) {
                        setTimeout(() => {
                            if (confirm("Break over! Click 'OK' to begin your next work session.")) {
                                $timerSound.pause(); // Stop the sound when alert is dismissed
                                $nextSessionButton.text("Start Work Session").show(); // Show the Next Session button
                                $pauseButton.hide(); // Hide the Pause button
                                $startPomodoroButton.text("Start Pomodoro"); // Change back to Start Pomodoro
                                isRunning = false; // Reset running state
                            }
                        }, 0); // Ensure the sound plays before the alert
                    } else {
                        setTimeout(() => {
                            if (confirm("Work session over! Click 'OK' to begin your break.")) {
                                $timerSound.pause(); // Stop the sound when alert is dismissed
                                $nextSessionButton.text("Start Break Session").show(); // Show the Next Session button
                                $pauseButton.hide(); // Hide the Pause button
                                $startPomodoroButton.text("Start Pomodoro"); // Change back to Start Pomodoro
                                isRunning = false; // Reset running state
                            }
                        }, 0); // Ensure the sound plays before the alert
                    }
                }
            }
        }, 1000);
    }

    // Function to confirm starting the next session (work or break)
    function confirmNextSession() {
        const workDuration = parseInt($workDurationInput.val()) * 60; // Convert to seconds
        const breakDuration = parseInt($breakDurationInput.val()) * 60; // Convert to seconds

        if (isBreak) {
            isBreak = false; // Switch back to work session
            startCountdown(workDuration); // Start the next work session
        } else {
            isBreak = true; // Switch to break session
            startCountdown(breakDuration); // Start the break session
        }

        $nextSessionButton.hide(); // Hide the button after starting the session
    }

    // Event listener to start or cancel the Pomodoro when button is clicked
    $startPomodoroButton.on("click", function() {
        if (isRunning) {
            // If it's running, cancel the current session
            clearInterval(timer); // Stop the timer
            $countdownDisplay.text("--:--"); // Reset the countdown display
            $startPomodoroButton.text("Start Pomodoro"); // Change back to Start Pomodoro
            $pauseButton.hide(); // Hide Pause button
            isRunning = false; // Mark as not running
            isPaused = false; // Reset pause state
            $pauseButton.text("Pause"); // Reset Pause button text
        } else {
            // If it's not running, start the Pomodoro session
            const workDuration = parseInt($workDurationInput.val()) * 60; // Convert to seconds
            startCountdown(workDuration);
        }
    });

    // Event listener to start the next session when the user clicks the button
    $nextSessionButton.on("click", confirmNextSession);

    // Event listener for Pause/Resume functionality
    $pauseButton.on("click", function() {
        if (isPaused) {
            $pauseButton.text("Pause"); // Change to "Pause"
            isPaused = false; // Resume the countdown
        } else {
            $pauseButton.text("Resume"); // Change to "Resume"
            isPaused = true; // Pause the countdown
        }
    });

    // ---- To-Do List Functions ----
    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(task => addTaskToDOM(task));
    }

    // Add a task to the DOM
    function addTaskToDOM(task) {
        const $li = $("<li>");

        // Create a span for task text
        const $taskText = $("<span>").text(task.text);

        // Add complete button
        const $completeButton = $("<button>").text(task.completed ? "Undo" : "Complete");
        $completeButton.on("click", function() {
            task.completed = !task.completed; // Toggle task completion state
            saveTasks(); // Save the updated tasks to localStorage
            $taskText.toggleClass("completed"); // Add or remove completed class (strikethrough)
            $completeButton.text(task.completed ? "Undo" : "Complete"); // Change button text
        });

        // Add delete button
        const $deleteButton = $("<button>").text("Delete");
        $deleteButton.on("click", function() {
            $li.remove(); // Remove the task from the DOM
            deleteTask(task); // Remove the task from localStorage
        });

        // Apply "completed" class if the task is already marked as completed
        if (task.completed) {
            $taskText.addClass("completed"); // Visually show completed tasks with strikethrough
        }

        // Append task text and buttons to list item
        $li.append($taskText, $completeButton, $deleteButton);
        $taskList.append($li);
    }

    // Save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        $taskList.find("li").each(function() {
            const taskText = $(this).find("span").text(); // Get text from span
            const completed = $(this).find("span").hasClass("completed"); // Check if span has completed class
            tasks.push({ text: taskText, completed });
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Delete a task
    function deleteTask(taskToDelete) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.filter(task => task.text !== taskToDelete.text);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    }

    // Add task event listener
    $addTaskButton.on("click", function() {
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
