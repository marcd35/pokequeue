// js/ui/ui-handler.js

// DOM Elements
const startQueueCard = document.getElementById('start-queue-card');
const updateQueueCard = document.getElementById('update-queue-card');
const startQueueSize = document.getElementById('start-queue-size');
const startQueueBtn = document.getElementById('start-queue-btn');
const updateQueueSize = document.getElementById('update-queue-size');
const updateQueueBtn = document.getElementById('update-queue-btn');
const queueMessage = document.getElementById('queue-message');
const statusContainer = document.getElementById('status-container');
const statusDetails = document.getElementById('status-details');
const raidBossSelect = document.getElementById('raid-boss-select'); // Raid boss dropdown reference

// Create queue tracker instance
const queueTracker = new QueueTracker();

// Update UI Timer
let updateTimer;

// Start queue button click
startQueueBtn.addEventListener('click', () => {
    const queueSize = parseInt(startQueueSize.value);
    if (isNaN(queueSize) || queueSize <= 0) {
        alert('Please enter a valid queue size (greater than 0)');
        return;
    }
    
    const raidBoss = raidBossSelect.value;
    if (!raidBoss) {
        alert('Please select a raid boss');
        return;
    }
    
    const status = queueTracker.startQueue(queueSize, raidBoss);
    updateQueueSize.value = queueSize;
    updateStatus(status);
    
    // Save to localStorage
    saveQueueData();
    
    // Start the update timer
    if (updateTimer) clearInterval(updateTimer);
    updateTimer = setInterval(updateTimerUI, 1000);
});

// Update queue button click
updateQueueBtn.addEventListener('click', () => {
    const queueSize = parseInt(updateQueueSize.value);
    if (isNaN(queueSize) || queueSize < 0) {
        alert('Please enter a valid queue size (0 or greater)');
        return;
    }
    
    const status = queueTracker.updateQueue(queueSize);
    updateStatus(status);
    
    // Save to localStorage if queue is still active, otherwise clear data
    if (queueTracker.isActive) {
        saveQueueData();
    } else {
        clearSavedData();
    }
});

// Update the UI every second (just the time values, not the whole status)
function updateTimerUI() {
    if (!queueTracker.isActive) {
        clearInterval(updateTimer);
        return;
    }
    
    const status = queueTracker.getStatus();
    
    // Update only time-based fields for efficiency
    const currentTimeEl = document.getElementById('current-time');
    const elapsedTimeEl = document.getElementById('elapsed-time');
    const remainingTimeEl = document.getElementById('remaining-time');
    
    if (currentTimeEl) currentTimeEl.textContent = status.currentTime;
    if (elapsedTimeEl) elapsedTimeEl.textContent = status.elapsedTime;
    if (remainingTimeEl) remainingTimeEl.textContent = status.remainingTime;
    
    // Update the main message
    if (queueMessage) {
        queueMessage.textContent = `Estimated completion time: ${status.estimatedFinishTime}`;
    }
}

// Update UI with status
function updateStatus(status) {
    if (status.isActive) {
        startQueueCard.classList.add('hidden');
        updateQueueCard.classList.remove('hidden');
        statusContainer.classList.remove('hidden');
        queueMessage.classList.remove('hidden');
        
        queueMessage.textContent = `Estimated completion time: ${status.estimatedFinishTime}`;
        
        statusDetails.innerHTML = `
            <div class="status-item">
                <div class="status-label">Raid Boss</div>
                <div class="status-value">${status.raidBoss}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Current Queue Size</div>
                <div id="current-size" class="status-value">${status.currentSize} people</div>
            </div>
            <div class="status-item">
                <div class="status-label">Initial Queue Size</div>
                <div class="status-value">${status.initialSize} people</div>
            </div>
            <div class="status-item">
                <div class="status-label">Queue Started</div>
                <div class="status-value">${status.startTime}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Current Time</div>
                <div id="current-time" class="status-value">${status.currentTime}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Elapsed Time</div>
                <div id="elapsed-time" class="status-value">${status.elapsedTime}</div>
            </div>
            <div class="status-item">
                <div class="status-label">Average Time Per Person</div>
                <div class="status-value">${status.estimatedTimePerPerson} (${status.rawSecondsPerPerson} seconds)</div>
            </div>
            <div class="status-item">
                <div class="status-label">Remaining Time</div>
                <div id="remaining-time" class="status-value">${status.remainingTime}</div>
            </div>
        `;
    } else if (status.message === "Queue complete") {
        if (updateTimer) clearInterval(updateTimer);
        
        startQueueCard.classList.remove('hidden');
        updateQueueCard.classList.add('hidden');
        statusContainer.classList.add('hidden');
        queueMessage.classList.remove('hidden');
        queueMessage.textContent = `Queue completed at ${status.finishTime} for ${status.raidBoss}`;
    } else {
        startQueueCard.classList.remove('hidden');
        updateQueueCard.classList.add('hidden');
        statusContainer.classList.add('hidden');
        queueMessage.classList.add('hidden');
    }
}
// Add this to js/ui/ui-handler.js

// Get reference to leave queue button
const leaveQueueBtn = document.getElementById('leave-queue-btn');

// Add event listener for leave queue button
leaveQueueBtn.addEventListener('click', () => {
    // Ask for confirmation
    if (confirm('Are you sure you want to leave the queue? Your current progress will be lost.')) {
        leaveQueue();
    }
});

// Function to handle leaving the queue
function leaveQueue() {
    // Reset queue tracker
    queueTracker.isActive = false;
    queueTracker.startTime = null;
    queueTracker.initialQueueSize = 0;
    queueTracker.currentQueueSize = 0;
    queueTracker.queueHistory = [];
    queueTracker.estimatedTimePerPerson = 60;
    queueTracker.finishTime = null;
    queueTracker.raidBoss = null;
    
    // Clear the update timer
    if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
    }
    
    // Clear saved data
    clearSavedData();
    
    // Reset UI elements
    startQueueSize.value = '';
    updateQueueSize.value = '';
    raidBossSelect.selectedIndex = 0;
    
    // Show start screen, hide others
    startQueueCard.classList.remove('hidden');
    updateQueueCard.classList.add('hidden');
    statusContainer.classList.add('hidden');
    queueMessage.classList.add('hidden');
}