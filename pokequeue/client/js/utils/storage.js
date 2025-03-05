// js/utils/storage.js

// Save queue data to localStorage
function saveQueueData() {
    if (!queueTracker) return;
    
    const data = {
        isActive: queueTracker.isActive,
        startTime: queueTracker.startTime ? queueTracker.startTime.getTime() : null,
        initialQueueSize: queueTracker.initialQueueSize,
        currentQueueSize: queueTracker.currentQueueSize,
        queueHistory: queueTracker.queueHistory.map(entry => ({
            time: entry.time.getTime(),
            size: entry.size
        })),
        estimatedTimePerPerson: queueTracker.estimatedTimePerPerson,
        finishTime: queueTracker.finishTime ? queueTracker.finishTime.getTime() : null,
        raidBoss: queueTracker.raidBoss
    };
    
    localStorage.setItem('pokegenie_queue_data', JSON.stringify(data));
}

// Load queue data from localStorage
function loadQueueData() {
    const savedData = localStorage.getItem('pokegenie_queue_data');
    if (!savedData) return false;
    
    try {
        const data = JSON.parse(savedData);
        
        // Return early if no actual data saved
        if (!data || !data.startTime) {
            return false;
        }
        
        queueTracker.isActive = data.isActive;
        queueTracker.startTime = data.startTime ? new Date(data.startTime) : null;
        queueTracker.initialQueueSize = data.initialQueueSize;
        queueTracker.currentQueueSize = data.currentQueueSize;
        queueTracker.queueHistory = data.queueHistory.map(entry => ({
            time: new Date(entry.time),
            size: entry.size
        }));
        queueTracker.estimatedTimePerPerson = data.estimatedTimePerPerson;
        queueTracker.finishTime = data.finishTime ? new Date(data.finishTime) : null;
        queueTracker.raidBoss = data.raidBoss;
        
        if (queueTracker.isActive) {
            // Update the UI
            const updateQueueSize = document.getElementById('update-queue-size');
            if (updateQueueSize) {
                updateQueueSize.value = queueTracker.currentQueueSize;
            }
            
            // Update the status display
            updateStatus(queueTracker.getStatus());
            
            // Start the update timer
            if (typeof updateTimer !== 'undefined' && updateTimer) {
                clearInterval(updateTimer);
            }
            updateTimer = setInterval(updateTimerUI, 1000);
        }
        
        return true;
    } catch (error) {
        console.error('Error loading saved data:', error);
        localStorage.removeItem('pokegenie_queue_data');
        return false;
    }
}

// Clear saved data (when queue completes)
function clearSavedData() {
    localStorage.removeItem('pokegenie_queue_data');
}

// For Phase 3-5: Functions to prepare data for server
function prepareDataForServer() {
    // Will be implemented in Phase 3
    if (!queueTracker || !queueTracker.isActive) return null;
    
    return {
        raidBoss: queueTracker.raidBoss,
        queueSize: queueTracker.currentQueueSize,
        timestamp: new Date().toISOString(),
        waitTimePerPerson: queueTracker.estimatedTimePerPerson
    };
}