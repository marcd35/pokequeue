# Pokegenie Queue Tracker

A web application to track and estimate wait times for Pokegenie raid queues. This tool helps Pokémon GO players better manage their time while waiting in remote raid queues.

## Features

- Track your position in Pokegenie remote raid queues
- Select specific raid bosses to track different queue types
- Calculate estimated wait times based on queue movement
- Persistent data storage using browser localStorage
- Real-time updates and estimations

## Project Structure

```
pokegenie-queue-tracker/
│
├── client/
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   ├── styles.css           # Main CSS styles
│   │   ├── components/
│   │   │   └── raid-boss.css    # Raid boss selection styling
│   │
│   ├── js/
│   │   ├── app.js               # Main application initialization
│   │   ├── models/
│   │   │   └── QueueTracker.js  # Queue tracker class
│   │   ├── utils/
│   │   │   └── storage.js       # Local storage utilities
│   │   ├── ui/
│   │   │   ├── ui-handler.js    # UI event handlers
│   │   │   └── updates.js       # UI update functions
│   │
│   └── assets/
│       └── icons/               # For future icons/images
│
├── server/                      # For Phase 2 and beyond
│   ├── index.js                 # Main server file (Express)
│   ├── config/
│   │   └── db.js                # Database configuration
│   ├── models/
│   │   └── QueueSubmission.js   # Database models
│   ├── routes/
│   │   ├── api.js               # API routes
│   │   └── stats.js             # Statistics routes
│   └── utils/
│       └── estimator.js         # Wait time estimation algorithms
│
├── package.json                 # NPM package config for server
└── .gitignore                   # Git ignore file
```

## Development Phases

This project is being developed in phases:

### Phase 1: Client-Side Implementation
- Raid boss selection UI ✅
- Queue tracking functionality ✅
- Local storage for data persistence ✅

### Phase 2: Basic Server Setup (Upcoming)
- Node.js Express server
- MongoDB Atlas integration
- Basic API endpoints

### Phase 3: Client-Server Integration (Planned)
- API communication
- Cross-origin request handling
- Enhanced UI for server features

### Phase 4: Wait Time Estimation Improvements (Planned)
- Data collection and analysis
- Boss-specific wait time algorithms
- Statistical endpoint development

### Phase 5: Deployment (Planned)
- Environment setup
- Server deployment
- Domain and HTTPS configuration

## How to Use

1. Open the application in your browser
2. Enter the number of people in your Pokegenie queue
3. Select the raid boss you're queuing for
4. Click "Start Queue" to begin tracking
5. Update the queue size as it changes in Pokegenie
6. View estimated completion time and other stats

## Local Development

1. Clone this repository
2. Open `client/index.html` in your browser for basic functionality
3. For server features (Phase 2+), you'll need:
   - Node.js and npm installed
   - Run `npm install` in the project root
   - Set up a MongoDB database
   - Configure environment variables
   - Run `npm start` to start the server

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend (upcoming): Node.js, Express, MongoDB
- Deployment (planned): Render/Railway, MongoDB Atlas

## Contributors

- [Your Name]

## License

This project is licensed under the MIT License - see the LICENSE file for details.