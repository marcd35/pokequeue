# **Pokegenie Queue Tracker: Implementation Plan**

This plan outlines how to add the raid boss selection feature and create a server to track wait times for your Pokegenie queue tracker app, allowing users to find current wait time estimates from a crowdsourced dataset. We'll focus on free/low-cost options and a gradual learning approach.

## **Phase 1: Client-Side Raid Boss Selection**

### **Step 1: Add the Raid Boss Selection UI**

1. Create a dropdown menu in the HTML form  
2. Style it to match your existing UI  
3. Add event listeners to capture the selected raid boss

### **Step 2: Update the QueueTracker Class**

1. Modify the constructor to include a raidBoss property  
2. Update the startQueue() method to accept the raid boss  
3. Include the raid boss in the status object returned by getStatus()

### **Step 3: Update the UI to Display Raid Boss Information**

1. Modify the updateStatus() function to show the selected raid boss  
2. Add the raid boss to the status display card  
3. Test the feature thoroughly with different selections

### **Step 4: Add Local Storage for Persistence**

1. Save queue data and raid boss to localStorage when updated  
2. Retrieve this data when the page loads  
3. Test page refreshes to ensure data persists

## **Phase 2: Basic Server Setup**

### **Step 1: Set Up Development Environment**

1. Install Node.js and npm if not already installed  
2. Create a new directory for your server  
3. Initialize a new npm project (`npm init`)  
4. Install Express (`npm install express`)

### **Step 2: Create a Simple Express Server**

1. Create an index.js file with a basic Express server  
2. Set up routes for handling queue data  
3. Implement CORS to allow your client to connect  
4. Test the server locally using Postman

### **Step 3: Set Up MongoDB Atlas**

1. Create a free MongoDB Atlas account  
2. Set up a new cluster (free tier)  
3. Create a database user and get your connection string  
4. Install Mongoose (`npm install mongoose`)

### **Step 4: Create Database Models**

1. Define a schema for queue submissions  
2. Include fields for position, raid boss, timestamp, etc.  
3. Create methods for calculating statistics

## **Phase 3: Client-Server Integration**

### **Step 1: Update Client to Send Data to Server**

1. Add fetch or Axios for API calls  
2. Modify the existing code to send updates to the server  
3. Handle responses from the server  
4. Add error handling for network issues

### **Step 2: Implement Cross-Origin Request Handling**

1. Set up CORS properly on the server  
2. Test connections between your local client and server  
3. Debug any communication issues

### **Step 3: Enhance the Client UI for Server Features**

1. Add indicators for server connection status  
2. Create UI elements to display global statistics  
3. Add a way to compare personal wait time with global average

## **Phase 4: Wait Time Estimation Algorithm**

### **Step 1: Collect and Analyze Data**

1. Store user submissions with timestamps  
2. Track position changes to calculate throughput  
3. Group data by raid boss

### **Step 2: Implement Basic Estimation Algorithm**

1. Calculate average wait times per position for each raid boss  
2. Factor in time of day and day of week if possible  
3. Create an endpoint to return estimates based on position and raid boss

### **Step 3: Add Statistics Endpoints**

1. Create routes for retrieving general statistics  
2. Include endpoints for specific raid bosses  
3. Add time-based filtering (e.g., last hour, last day)

## **Phase 5: Deployment**

### **Step 1: Prepare for Deployment**

1. Set up environment variables for sensitive information  
2. Create a proper configuration system  
3. Implement logging

### **Step 2: Deploy to Free Hosting Platforms**

1. Client: Deploy to GitHub Pages or Netlify (free)  
2. Server: Deploy to Render.com or Railway.app (free tier)  
3. Ensure your MongoDB Atlas is properly secured

### **Step 3: Set Up Domain and HTTPS**

1. Use a free subdomain from your hosting provider initially  
2. Configure HTTPS for security  
3. Test thoroughly after deployment

## **Learning Resources for Each Step**

### **Front-End Development**

* MDN Web Docs for HTML, CSS, and JavaScript fundamentals  
* Bootstrap documentation for UI components  
* JavaScript.info for advanced JavaScript concepts

### **Back-End Development**

* Express.js documentation and tutorials  
* MongoDB University (free courses)  
* Mongoose documentation

### **Deployment and DevOps**

* Render.com documentation  
* MongoDB Atlas documentation  
* Basic networking and HTTPS concepts

## **Testing Strategy**

### **For Each Phase**

1. Create a checklist of expected behaviors  
2. Test on multiple devices and browsers  
3. Have friends test the application  
4. Fix issues before moving to the next phase

## **Timeline Recommendation**

* **Phase 1**: 1-2 weeks (part-time)  
* **Phase 2**: 2-3 weeks  
* **Phase 3**: 2 weeks  
* **Phase 4**: 2-3 weeks  
* **Phase 5**: 1 week

Total: Approximately 2-3 months of part-time work, allowing time for learning and experimentation along the way.

This plan provides a structured approach to implementing the requested features while balancing learning opportunities with practical progress. Each phase builds on the previous one, letting you see results while gradually increasing complexity.

---

Entry: g3/5/25 1450

## Phase 1 Implementation Summary

### Completed Tasks:

1. **Added Raid Boss Selection UI**
   - Created a dropdown menu in the HTML form with popular raid bosses
   - Styled it to match the existing UI
   - Added input validation to ensure a raid boss is selected

2. **Updated the QueueTracker Class**
   - Added a raidBoss property to the constructor
   - Modified the startQueue() method to accept and store the raid boss
   - Included the raid boss in the status object returned by getStatus()

3. **Updated the UI to Display Raid Boss Information**
   - Modified the updateStatus() function to show the selected raid boss
   - Added the raid boss to the status display card
   - Updated completion message to include the raid boss

4. **Added Local Storage for Persistence**
   - Implemented functions to save queue data and raid boss to localStorage
   - Created logic to retrieve and restore data when the page loads
   - Added functions to clear localStorage when a queue completes

5. **Additional Enhancement: Leave Queue Feature**
   - Added a "Leave Queue" button with warning styling
   - Implemented confirmation dialog to prevent accidental queue abandonment
   - Created a leaveQueue() function to reset the tracker and UI state

### Project Structure:

```
pokegenie-queue-tracker/
│
├── client/
│   ├── index.html               # Main HTML file with raid boss dropdown
│   ├── css/
│   │   ├── styles.css           # Main CSS styles including leave queue button
│   │   ├── components/
│   │   │   └── raid-boss.css    # Raid boss selection styling
│   │
│   ├── js/
│   │   ├── app.js               # Main application initialization
│   │   ├── models/
│   │   │   └── QueueTracker.js  # Queue tracker class with raid boss property
│   │   ├── utils/
│   │   │   └── storage.js       # Local storage utilities for data persistence
│   │   ├── ui/
│   │   │   ├── ui-handler.js    # UI event handlers with leave queue functionality
│   │   │   └── updates.js       # Additional UI functions for future phases
│   │
│   └── assets/
│       └── icons/               # For future icons/images
│
├── README.md                    # Project documentation
└── Implementation Plan.md       # Original implementation plan with summary
```

### Changes from Original Plan:

1. **Enhanced Organization**: Implemented a more structured file organization than originally outlined, separating code into logical modules and directories.

2. **Component-Based Approach**: Used a component-based structure for CSS, separating raid boss styling into its own file for better maintainability.

3. **Additional Feature**: Added a "Leave Queue" feature that wasn't in the original plan but enhances user experience.

4. **Future-Proofing**: Added placeholder files and structure for future phases to make the transition to server-side implementation smoother.

The implementation provides a solid foundation for Phase 2, with clear separation of concerns and extensible architecture that will support the upcoming server integration.
