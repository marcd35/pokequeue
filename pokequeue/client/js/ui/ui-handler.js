// js/utils/storage.js

/**
 * Save queue data to localStorage
 * @param {QueueTracker} tracker - The queue tracker instance to save
 */
function saveQueueData(tracker) {
    if (!tracker) return;
    
    try {
        // Create a data object with serialized dates
        const dataToSave = {
            isActive: tracker.isActive,
            startTime: tracker.startTime ? tracker.startTime.getTime() : null,
            finishTime: tracker.finishTime ? tracker.finishTime.getTime() : null,
            initialQueueSize: tracker.initialQueueSize,
            currentQueueSize: tracker.currentQueueSize,
            estimatedTimePerPerson: tracker.estimatedTimePerPerson,
            raidBoss: tracker.raidBoss,
            
            // Serialize queue history with timestamps instead of Date objects
            queueHistory: tracker.queueHistory.map(entry => ({
                time: entry.time.getTime(),
                size: entry.size
            })),
            
            // Serialize raid boss history with timestamps
            raidBossHistory: {}
        };
        
        // Handle raid boss history serialization
        for (const boss in tracker.raidBossHistory) {
            dataToSave.raidBossHistory[boss] = {
                totalQueues: tracker.raidBossHistory[boss].totalQueues,
                averageTimePerPerson: tracker.raidBossHistory[boss].averageTimePerPerson,
                
                // Convert Date objects to timestamps in completed queues
                completedQueues: tracker.raidBossHistory[boss].completedQueues.map(queue => ({
                    startTime: queue.startTime.getTime(),
                    finishTime: queue.finishTime.getTime(),
                    initialSize: queue.initialSize,
                    timePerPerson: queue.timePerPerson,
                    totalDuration: queue.totalDuration
                }))
            };
        }
        
        localStorage.setItem('pokegenie-queue-data', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error saving queue data:', error);
    }
}

/**
 * Load queue data from localStorage
 * @returns {Object|null} The saved data or null if none exists
 */
function loadQueueData() {
    try {
        const savedData = localStorage.getItem('pokegenie-queue-data');
        if (!savedData) return null;
        
        const parsedData = JSON.parse(savedData);
        
        // Convert timestamps back to Date objects
        if (parsedData.startTime) {
            parsedData.startTime = new Date(parsedData.startTime);
        }
        
        if (parsedData.finishTime) {
            parsedData.finishTime = new Date(parsedData.finishTime);
        }
        
        // Convert queue history timestamps to Date objects
        if (parsedData.queueHistory && Array.isArray(parsedData.queueHistory)) {
            parsedData.queueHistory = parsedData.queueHistory.map(entry => ({
                time: new Date(entry.time),
                size: entry.size
            }));
        }
        
        // Convert raid boss history timestamps
        if (parsedData.raidBossHistory) {
            for (const boss in parsedData.raidBossHistory) {
                if (parsedData.raidBossHistory[boss].completedQueues) {
                    parsedData.raidBossHistory[boss].completedQueues = 
                        parsedData.raidBossHistory[boss].completedQueues.map(queue => ({
                            startTime: new Date(queue.startTime),
                            finishTime: new Date(queue.finishTime),
                            initialSize: queue.initialSize,
                            timePerPerson: queue.timePerPerson,
                            totalDuration: queue.totalDuration
                        }));
                }
            }
        }
        
        return parsedData;
    } catch (error) {
        console.error('Error loading queue data:', error);
        return null;
    }
}

/**
 * Clear saved queue data from localStorage
 */
function clearSavedData() {
    localStorage.removeItem('pokegenie-queue-data');
}

/**
 * Restore queue tracker state from saved data
 * @param {QueueTracker} tracker - The queue tracker instance to update
 * @returns {boolean} True if state was restored successfully
 */
function restoreQueueState(tracker) {
    const savedData = loadQueueData();
    if (!savedData) return false;
    
    try {
        // Restore basic properties
        tracker.isActive = savedData.isActive;
        tracker.startTime = savedData.startTime;
        tracker.finishTime = savedData.finishTime;
        tracker.initialQueueSize = savedData.initialQueueSize;
        tracker.currentQueueSize = savedData.currentQueueSize;
        tracker.estimatedTimePerPerson = savedData.estimatedTimePerPerson;
        tracker.raidBoss = savedData.raidBoss;
        
        // Restore queue history if available
        if (savedData.queueHistory) {
            tracker.queueHistory = savedData.queueHistory;
        }
        
        // Restore raid boss history if available
        if (savedData.raidBossHistory) {
            tracker.raidBossHistory = savedData.raidBossHistory;
        }
        
        // Recalculate estimate
        if (tracker.isActive) {
            tracker.calculateEstimate();
        }
        
        return true;
    } catch (error) {
        console.error('Error restoring queue state:', error);
        return false;
    }
}