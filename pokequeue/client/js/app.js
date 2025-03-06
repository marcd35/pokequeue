// js/app.js - Application initialization and debugging

// Global app namespace to avoid polluting global scope
const PokegenieApp = {
    // Store component references
    components: {
        queueTracker: null
    },
    
    // Initialize the application
    init: function() {
        console.log('Initializing Pokegenie Queue Tracker app...');
        
        try {
            // Initialize QueueTracker
            this.components.queueTracker = new QueueTracker();
            console.log('QueueTracker initialized:', this.components.queueTracker);
            
            // Initialize UI event listeners
            this.initUIHandlers();
            
            // Attempt to restore previous session
            this.restorePreviousSession();
            
            console.log('App initialization complete');
        } catch (error) {
            console.error('Error during app initialization:', error);
        }
    },
    
    // Initialize UI event handlers
    initUIHandlers: function() {
        console.log('Setting up UI event handlers...');
        
        // Get DOM elements
        const elements = {
            startQueueCard: document.getElementById('start-queue-card'),
            updateQueueCard: document.getElementById('update-queue-card'),
            startQueueSize: document.getElementById('start-queue-size'),
            startQueueBtn: document.getElementById('start-queue-btn'),
            updateQueueSize: document.getElementById('update-queue-size'),
            updateQueueBtn: document.getElementById('update-queue-btn'),
            queueMessage: document.getElementById('queue-message'),
            statusContainer: document.getElementById('status-container'),
            statusDetails: document.getElementById('status-details'),
            raidBossSelect: document.getElementById('raid-boss-select'),
            leaveQueueBtn: document.getElementById('leave-queue-btn')
        };
        
        // Log found elements
        console.log('DOM elements found:', Object.keys(elements).filter(key => elements[key] !== null));
        console.log('Missing DOM elements:', Object.keys(elements).filter(key => elements[key] === null));
        
        // Store elements globally for debugging
        window.pokegenieElements = elements;
        
        // Set up Start button event listener
        if (elements.startQueueBtn) {
            elements.startQueueBtn.addEventListener('click', () => {
                console.log('Start button clicked');
                try {
                    const queueSize = parseInt(elements.startQueueSize.value);
                    console.log('Queue size input:', queueSize);
                    
                    const raidBoss = elements.raidBossSelect.value;
                    console.log('Selected raid boss:', raidBoss);
                    
                    if (isNaN(queueSize) || queueSize <= 0) {
                        throw new Error('Please enter a valid queue size (greater than 0)');
                    }
                    
                    if (!raidBoss) {
                        throw new Error('Please select a raid boss');
                    }
                    
                    // Start tracking the queue
                    const status = this.components.queueTracker.startQueue(queueSize, raidBoss);
                    console.log('Queue started with status:', status);
                    
                    // Update UI
                    elements.updateQueueSize.value = queueSize;
                    this.updateUI(status);
                    
                    // Show stats if available
                    this.showRaidBossStats();
                    
                    // Save to localStorage
                    this.saveQueueData();
                    
                    // Start the update timer
                    this.startUpdateTimer();
                } catch (error) {
                    console.error('Error starting queue:', error);
                    alert(error.message);
                }
            });
            console.log('Start button event listener added');
        }
        
        // Set up Update button event listener
        if (elements.updateQueueBtn) {
            elements.updateQueueBtn.addEventListener('click', () => {
                console.log('Update button clicked');
                try {
                    const queueSize = parseInt(elements.updateQueueSize.value);
                    console.log('Updated queue size:', queueSize);
                    
                    if (isNaN(queueSize) || queueSize < 0) {
                        throw new Error('Please enter a valid queue size (0 or greater)');
                    }
                    
                    // Update the queue
                    const status = this.components.queueTracker.updateQueue(queueSize);
                    console.log('Queue updated with status:', status);
                    
                    // Update UI
                    this.updateUI(status);
                    
                    // Save or clear data
                    if (this.components.queueTracker.isActive) {
                        this.saveQueueData();
                    } else {
                        this.clearSavedData();
                    }
                } catch (error) {
                    console.error('Error updating queue:', error);
                    alert(error.message);
                }
            });
            console.log('Update button event listener added');
        }
        
        // Set up Leave button event listener
        if (elements.leaveQueueBtn) {
            elements.leaveQueueBtn.addEventListener('click', () => {
                console.log('Leave button clicked');
                if (confirm('Are you sure you want to leave the queue? Your current progress will be lost.')) {
                    this.leaveQueue();
                }
            });
            console.log('Leave button event listener added');
        }
    },
    
    // Update UI based on queue status
    updateUI: function(status) {
        console.log('Updating UI with status:', status);
        
        const elements = window.pokegenieElements;
        
        if (status.isActive) {
            elements.startQueueCard.classList.add('hidden');
            elements.updateQueueCard.classList.remove('hidden');
            elements.statusContainer.classList.remove('hidden');
            elements.queueMessage.classList.remove('hidden');
            
            elements.queueMessage.textContent = `Estimated completion time: ${status.estimatedFinishTime}`;
            
            elements.statusDetails.innerHTML = `
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
            this.stopUpdateTimer();
            
            elements.startQueueCard.classList.remove('hidden');
            elements.updateQueueCard.classList.add('hidden');
            elements.statusContainer.classList.add('hidden');
            elements.queueMessage.classList.remove('hidden');
            elements.queueMessage.textContent = `Queue completed at ${status.finishTime} for ${status.raidBoss}`;
        } else {
            elements.startQueueCard.classList.remove('hidden');
            elements.updateQueueCard.classList.add('hidden');
            elements.statusContainer.classList.add('hidden');
            elements.queueMessage.classList.add('hidden');
        }
    },
    
    // Show raid boss statistics if available
    showRaidBossStats: function() {
        console.log('Showing raid boss stats');
        
        // Remove any existing stats
        const existingStats = document.querySelector('.raid-boss-stats');
        if (existingStats) {
            existingStats.remove();
        }
        
        if (!this.components.queueTracker.raidBoss) {
            console.log('No raid boss selected, skipping stats');
            return;
        }
        
        const stats = this.components.queueTracker.getRaidBossStats();
        console.log('Raid boss stats:', stats);
        
        if (!stats || stats.completedQueues === 0) {
            console.log('No completed queues for this raid boss');
            return;
        }
        
        // Create stats element
        const statsElement = document.createElement('div');
        statsElement.classList.add('raid-boss-stats');
        statsElement.innerHTML = `
            <h4>Previous ${stats.name} Queues</h4>
            <p>Average time per person: ${stats.averageTimeFormatted}</p>
            <p>Data from ${stats.completedQueues} completed queues</p>
        `;
        
        // Insert after the status container
        const statusContainer = window.pokegenieElements.statusContainer;
        statusContainer.parentNode.insertBefore(statsElement, statusContainer.nextSibling);
        console.log('Raid boss stats added to DOM');
    },
    
    // Update timer variables and functions
    updateTimer: null,
    startUpdateTimer: function() {
        console.log('Starting update timer');
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.updateTimer = setInterval(() => this.updateTimerUI(), 1000);
    },
    stopUpdateTimer: function() {
        console.log('Stopping update timer');
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    },
    updateTimerUI: function() {
        if (!this.components.queueTracker.isActive) {
            this.stopUpdateTimer();
            return;
        }
        
        const status = this.components.queueTracker.getStatus();
        
        // Update only time-based fields for efficiency
        const currentTimeEl = document.getElementById('current-time');
        const elapsedTimeEl = document.getElementById('elapsed-time');
        const remainingTimeEl = document.getElementById('remaining-time');
        
        if (currentTimeEl) currentTimeEl.textContent = status.currentTime;
        if (elapsedTimeEl) elapsedTimeEl.textContent = status.elapsedTime;
        if (remainingTimeEl) remainingTimeEl.textContent = status.remainingTime;
        
        // Update the main message
        const queueMessage = window.pokegenieElements.queueMessage;
        if (queueMessage) {
            queueMessage.textContent = `Estimated completion time: ${status.estimatedFinishTime}`;
        }
    },
    
    // Leave queue
    leaveQueue: function() {
        console.log('Leaving queue');
        
        // Reset queue tracker
        this.components.queueTracker.reset();
        
        // Stop the update timer
        this.stopUpdateTimer();
        
        // Clear saved data
        this.clearSavedData();
        
        // Reset UI elements
        const elements = window.pokegenieElements;
        elements.startQueueSize.value = '';
        elements.updateQueueSize.value = '';
        elements.raidBossSelect.selectedIndex = 0;
        
        // Show start screen, hide others
        elements.startQueueCard.classList.remove('hidden');
        elements.updateQueueCard.classList.add('hidden');
        elements.statusContainer.classList.add('hidden');
        elements.queueMessage.classList.add('hidden');
        
        // Remove raid boss stats if displayed
        const raidBossStatsEl = document.querySelector('.raid-boss-stats');
        if (raidBossStatsEl) {
            raidBossStatsEl.remove();
        }
        
        console.log('Queue successfully left');
    },
    
    // Storage functions
    saveQueueData: function() {
        console.log('Saving queue data');
        try {
            saveQueueData(this.components.queueTracker);
            console.log('Queue data saved successfully');
        } catch (error) {
            console.error('Error saving queue data:', error);
        }
    },
    clearSavedData: function() {
        console.log('Clearing saved data');
        try {
            clearSavedData();
            console.log('Saved data cleared successfully');
        } catch (error) {
            console.error('Error clearing saved data:', error);
        }
    },
    
    // Restore previous session
    restorePreviousSession: function() {
        console.log('Attempting to restore previous session');
        try {
            const restored = restoreQueueState(this.components.queueTracker);
            console.log('Session restoration result:', restored);
            
            if (restored && this.components.queueTracker.isActive) {
                console.log('Active session restored');
                
                // Update UI
                const elements = window.pokegenieElements;
                elements.updateQueueSize.value = this.components.queueTracker.currentQueueSize;
                this.updateUI(this.components.queueTracker.getStatus());
                
                // Show raid boss stats
                this.showRaidBossStats();
                
                // Start timer
                this.startUpdateTimer();
                
                // Set the raid boss dropdown to match the restored boss
                if (this.components.queueTracker.raidBoss && elements.raidBossSelect) {
                    for (let i = 0; i < elements.raidBossSelect.options.length; i++) {
                        if (elements.raidBossSelect.options[i].value === this.components.queueTracker.raidBoss) {
                            elements.raidBossSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            } else {
                console.log('No active session to restore');
            }
        } catch (error) {
            console.error('Error restoring previous session:', error);
        }
    }
};

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing app...');
    PokegenieApp.init();
});

// Expose app to window for debugging
window.PokegenieApp = PokegenieApp;