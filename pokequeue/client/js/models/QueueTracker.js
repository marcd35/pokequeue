// js/models/QueueTracker.js
class QueueTracker {
    constructor() {
        this.isActive = false;
        this.startTime = null;
        this.initialQueueSize = 0;
        this.currentQueueSize = 0;
        this.queueHistory = [];
        this.estimatedTimePerPerson = 60; // Default: 60 seconds per person
        this.finishTime = null;
        this.raidBoss = null; // Raid boss property
        this.raidBossHistory = {}; // Storage for raid boss statistics
    }
    
    startQueue(queueSize, raidBoss) {
        // Input validation
        if (isNaN(queueSize) || queueSize <= 0) {
            throw new Error("Queue size must be a positive number");
        }
        
        if (!raidBoss || raidBoss.trim() === '') {
            throw new Error("A raid boss must be selected");
        }
        
        this.isActive = true;
        this.startTime = new Date();
        this.initialQueueSize = queueSize;
        this.currentQueueSize = queueSize;
        this.raidBoss = raidBoss; // Set the selected raid boss
        this.queueHistory = [{ time: this.startTime, size: queueSize }];
        
        // Initialize or update raid boss history entry
        if (!this.raidBossHistory[raidBoss]) {
            this.raidBossHistory[raidBoss] = {
                totalQueues: 0,
                completedQueues: [],
                averageTimePerPerson: this.estimatedTimePerPerson
            };
        }
        
        this.raidBossHistory[raidBoss].totalQueues++;
        
        // Use historical average if available
        if (this.raidBossHistory[raidBoss].completedQueues.length > 0) {
            this.estimatedTimePerPerson = this.raidBossHistory[raidBoss].averageTimePerPerson;
        }
        
        this.calculateEstimate();
        return this.getStatus();
    }
    
    updateQueue(queueSize) {
        if (!this.isActive) {
            return false;
        }
        
        const now = new Date();
        
        // If the queue size hasn't changed, just return current status
        if (this.currentQueueSize === queueSize) {
            return this.getStatus();
        }
        
        this.currentQueueSize = queueSize;
        this.queueHistory.push({ time: now, size: queueSize });
        
        // Check if queue is complete
        if (queueSize === 0) {
            this.finishTime = now;
            this.isActive = false;
            
            // Store statistics for completed queue
            this.storeCompletedQueueData();
        }
        
        // Recalculate time per person based on history
        if (this.queueHistory.length >= 2) {
            let totalTime = 0;
            let totalPeople = 0;
            
            for (let i = 1; i < this.queueHistory.length; i++) {
                const prevTime = this.queueHistory[i-1].time;
                const prevSize = this.queueHistory[i-1].size;
                const currTime = this.queueHistory[i].time;
                const currSize = this.queueHistory[i].size;
                
                const timeDiff = (currTime - prevTime) / 1000; // in seconds
                const peopleDiff = prevSize - currSize;
                
                // Only count positive differences (queue decreased)
                if (peopleDiff > 0 && timeDiff > 0) {
                    totalTime += timeDiff;
                    totalPeople += peopleDiff;
                }
            }
            
            // Update the estimate only if we have meaningful data
            if (totalPeople > 0 && totalTime > 0) {
                const newEstimate = totalTime / totalPeople;
                
                // Apply some dampening to avoid wild swings in the estimate
                // 70% new estimate, 30% old estimate (if we had one before)
                if (this.estimatedTimePerPerson > 0) {
                    this.estimatedTimePerPerson = (0.7 * newEstimate) + (0.3 * this.estimatedTimePerPerson);
                } else {
                    this.estimatedTimePerPerson = newEstimate;
                }
                
                // Ensure we never go below a reasonable minimum (10 seconds per person)
                if (this.estimatedTimePerPerson < 10) {
                    this.estimatedTimePerPerson = 10;
                }
            }
        }
        
        this.calculateEstimate();
        return this.getStatus();
    }
    
    storeCompletedQueueData() {
        // Only store data if we have a valid raid boss
        if (!this.raidBoss || !this.raidBossHistory[this.raidBoss]) return;
        
        // Calculate total duration
        const totalDuration = (this.finishTime - this.startTime) / 1000; // seconds
        
        // Create data object for this queue
        const queueData = {
            startTime: this.startTime,
            finishTime: this.finishTime,
            initialSize: this.initialQueueSize,
            timePerPerson: this.estimatedTimePerPerson,
            totalDuration: totalDuration
        };
        
        // Add to the raid boss history
        this.raidBossHistory[this.raidBoss].completedQueues.push(queueData);
        
        // Recalculate average time per person
        this.updateRaidBossAverage(this.raidBoss);
    }
    
    updateRaidBossAverage(raidBoss) {
        if (!this.raidBossHistory[raidBoss]) return;
        
        const completedQueues = this.raidBossHistory[raidBoss].completedQueues;
        if (completedQueues.length === 0) return;
        
        // Calculate new average
        let totalTimePerPerson = 0;
        completedQueues.forEach(queue => {
            totalTimePerPerson += queue.timePerPerson;
        });
        
        this.raidBossHistory[raidBoss].averageTimePerPerson = totalTimePerPerson / completedQueues.length;
    }
    
    calculateEstimate() {
        if (this.currentQueueSize <= 0) {
            this.finishTime = new Date();
            this.isActive = false;
        } else {
            // Make sure we have a positive value for time per person
            if (this.estimatedTimePerPerson <= 0) {
                this.estimatedTimePerPerson = 60; // Default fallback
            }
            
            const remainingTime = this.currentQueueSize * this.estimatedTimePerPerson;
            this.finishTime = new Date(new Date().getTime() + (remainingTime * 1000));
        }
    }
    
    getStatus() {
        if (!this.isActive) {
            if (!this.startTime) {
                return {
                    isActive: false,
                    message: "No active queue"
                };
            } else {
                return {
                    isActive: false,
                    message: "Queue complete",
                    finishTime: this.formatTime(this.finishTime, true),
                    raidBoss: this.raidBoss // Include raidBoss in completed status
                };
            }
        }
        
        const now = new Date();
        
        // Calculate elapsed time
        const elapsed = (now - this.startTime) / 1000; // in seconds
        
        // Calculate remaining time (ensure it's never negative)
        const remaining = Math.max(0, (this.finishTime - now) / 1000); // in seconds
        
        return {
            isActive: true,
            currentSize: this.currentQueueSize,
            initialSize: this.initialQueueSize,
            startTime: this.formatTime(this.startTime, true),
            currentTime: this.formatTime(now, true),
            elapsedTime: this.formatDuration(elapsed),
            estimatedFinishTime: this.formatTime(this.finishTime, true),
            remainingTime: this.formatDuration(remaining),
            estimatedTimePerPerson: this.formatDuration(this.estimatedTimePerPerson),
            rawSecondsPerPerson: Math.round(this.estimatedTimePerPerson * 10) / 10,
            raidBoss: this.raidBoss // Include raidBoss in active status
        };
    }
    
    // Get statistics for a specific raid boss
    getRaidBossStats(bossName = null) {
        // Use current raid boss if none specified
        const raidBoss = bossName || this.raidBoss;
        
        if (!raidBoss || !this.raidBossHistory[raidBoss]) {
            return null;
        }
        
        const stats = this.raidBossHistory[raidBoss];
        
        return {
            name: raidBoss,
            totalQueues: stats.totalQueues,
            completedQueues: stats.completedQueues.length,
            averageTimePerPerson: stats.averageTimePerPerson,
            averageTimeFormatted: this.formatDuration(stats.averageTimePerPerson)
        };
    }
    
    // Reset tracker when leaving queue
    reset() {
        this.isActive = false;
        this.startTime = null;
        this.initialQueueSize = 0;
        this.currentQueueSize = 0;
        this.queueHistory = [];
        this.estimatedTimePerPerson = 60;
        this.finishTime = null;
        this.raidBoss = null;
        
        // Note: We don't reset raidBossHistory as that's our analytics data
    }
    
    formatTime(date, use12Hour = false) {
        if (!date) return '';
        
        if (use12Hour) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toTimeString().substring(0, 8); // HH:MM:SS
        }
    }
    
    formatDuration(seconds) {
        if (seconds < 0) seconds = 0;
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Export if using modules
// if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
//     module.exports = QueueTracker;
// }