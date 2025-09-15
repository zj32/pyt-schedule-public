# Rehearsal Schedule

A web application for viewing and filtering rehearsal schedules from Google Spreadsheets.

## Features

- **Google Spreadsheet Integration**: Loads data directly from Google Spreadsheets
- **Cast Filtering**: Filter by specific cast members (Parfait, Gumdrop, or All)
- **Call Filtering**: Search for specific calls using comma-separated keywords
- **Remaining Dates**: Toggle to show only upcoming rehearsals
- **Responsive Design**: Works on desktop and mobile devices
- **Debug Information**: Built-in debugging tools for troubleshooting

## Local Development

To test this application locally, you can use Python's built-in HTTP server:

### Prerequisites

- Python 3.x installed on your system
- A modern web browser

### Running Locally

1. **Navigate to the project directory**:
   ```bash
   cd /path/to/pyt-schedule-public
   ```

2. **Start the HTTP server**:
   ```bash
   python3 -m http.server 8000
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

4. **Stop the server** when done by pressing `Ctrl+C` in the terminal

### Alternative Ports

If port 8000 is already in use, you can specify a different port:

```bash
python3 -m http.server 8080
```

Then access the application at `http://localhost:8080`

## Usage

1. **Load Data**: The application will automatically load data from the default Google Spreadsheet URL
2. **Update Spreadsheet**: Click "Update" to refresh data from the spreadsheet
3. **Filter by Cast**: Use the dropdown to select a specific cast or view all
4. **Filter by Call**: Enter comma-separated keywords to filter by call type
5. **Show Remaining**: Toggle the switch to show only upcoming rehearsals
6. **Debug Information**: Click "Show Debug Information" to view detailed logs

## File Structure

```
pyt-schedule-public/
├── index.html          # Main HTML file with UI and styling
├── scripts.js          # JavaScript functionality
└── README.md          # This file
```

## Browser Compatibility

This application works with all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Fetch API
- Local Storage

## Troubleshooting

If you encounter issues:

1. **Check the Debug Information**: Click "Show Debug Information" to see detailed logs
2. **Verify Spreadsheet URL**: Ensure the Google Spreadsheet is publicly accessible
3. **Check Browser Console**: Open Developer Tools (F12) to view any JavaScript errors
4. **Clear Local Storage**: If filters aren't working, try clearing your browser's local storage

## Notes

- The application requires the Google Spreadsheet to be publicly accessible
- Filter states are saved in browser local storage
- The application automatically handles date parsing and comparison for the "remaining" filter
