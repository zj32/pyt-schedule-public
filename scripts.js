// Store the processed data globally
let scheduleData = [];
let isDebugVisible = false;
let filterTimeout = null;

// Special cast names that match all filters
const ALL_MATCH_CAST_NAMES = new Set(['both', 'all', 'tba', 'tbd', 'cast']);

// Debounced filter function
function debouncedFilterTable() {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }
    filterTimeout = setTimeout(() => {
        filterTable();
        // Save filter state after the debounce delay
        saveFilterState();
    }, 300); // 300ms delay
}

// Function to save filter state
function saveFilterState() {
    const castFilter = document.getElementById('castFilter').value;
    const callFilter = document.getElementById('callFilter').value;
    const remainingToggle = document.getElementById('remainingToggle').checked;
    const spreadsheetUrl = document.getElementById('spreadsheetUrl').value;

    localStorage.setItem('castFilter', castFilter);
    localStorage.setItem('callFilter', callFilter);
    localStorage.setItem('remainingToggle', remainingToggle);
    localStorage.setItem('spreadsheetUrl', spreadsheetUrl);
}

// Function to load filter state
function loadFilterState() {
    const castFilter = localStorage.getItem('castFilter') || 'All';
    const callFilter = localStorage.getItem('callFilter') || '';
    const remainingToggle = localStorage.getItem('remainingToggle') === 'true';
    const spreadsheetUrl = localStorage.getItem('spreadsheetUrl') || '';

    document.getElementById('castFilter').value = castFilter;
    document.getElementById('callFilter').value = callFilter;
    document.getElementById('remainingToggle').checked = remainingToggle;
    document.getElementById('spreadsheetUrl').value = spreadsheetUrl;
}

// Function to toggle debug information panel
function toggleDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    const toggleButton = document.querySelector('.debug-toggle');
    isDebugVisible = !isDebugVisible;
    
    debugInfo.style.display = isDebugVisible ? 'block' : 'none';
    toggleButton.textContent = isDebugVisible ? 'Hide Debug Information' : 'Show Debug Information';
    toggleButton.classList.toggle('active', isDebugVisible);
}

// Function to update debug information
function updateDebugInfo(message) {
    const debugDiv = document.getElementById('status');
    debugDiv.innerHTML += `<p>${new Date().toLocaleTimeString()}: ${message}</p>`;
    console.log(message);
}

// Function to get unique cast options from the data
function getCastOptions(data) {
    try {
        const castSet = new Set();
        
        data.forEach(row => {
            const cast = (row[3] || '').trim();
            if (cast && cast !== '') {
                const castLower = cast.toLowerCase();
                // Only add if it's not in the special ALL_MATCH_CAST_NAMES set
                if (!ALL_MATCH_CAST_NAMES.has(castLower)) {
                    castSet.add(cast);
                }
            }
        });
        
        const castOptions = Array.from(castSet).sort();
        updateDebugInfo(`Found ${castOptions.length} unique cast options (excluding special names): ${castOptions.join(', ')}`);
        return castOptions;
    } catch (error) {
        updateDebugInfo(`Error extracting cast options: ${error.message}`);
        console.error('Error extracting cast options:', error);
        return [];
    }
}

// Function to update cast filter dropdown
function updateCastFilter(castOptions) {
    const castFilter = document.getElementById('castFilter');
    const currentValue = castFilter.value;
    
    // Clear existing options except "All"
    castFilter.innerHTML = '<option value="All">All</option>';
    
    // Add cast options
    castOptions.forEach(cast => {
        const option = document.createElement('option');
        option.value = cast;
        option.textContent = cast;
        castFilter.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (castOptions.includes(currentValue)) {
        castFilter.value = currentValue;
    } else {
        castFilter.value = 'All';
    }
    
    updateDebugInfo(`Updated cast filter with ${castOptions.length} options`);
}

// Function to process the data
function processData(data) {
    updateDebugInfo('Processing data...');
    let lastDay = '';
    let lastDate = '';
    
    try {
        const processed = data.map(row => {
            const day = (row[0] || '').trim() || lastDay;
            const date = (row[1] || '').trim() || lastDate;
            const time = (row[2] || '').trim();
            const cast = (row[3] || '').trim() || 'Both';
            const call = (row[4] || '').trim();
            const note = (row[5] || '').trim();

            lastDay = day;
            lastDate = date;

            return { day, date, time, cast, call, note };
        });
        updateDebugInfo(`Processed ${processed.length} rows`);
        return processed;
    } catch (error) {
        updateDebugInfo(`Error processing data: ${error.message}`);
        console.error('Error processing data:', error);
        return [];
    }
}

// Function to filter and display the table
function filterTable() {
    updateDebugInfo('Filtering table...');
    const selectedCast = document.getElementById('castFilter').value;
    const callFilterText = document.getElementById('callFilter').value;
    const showRemaining = document.getElementById('remainingToggle').checked;
    const callFilters = callFilterText
        .split(',')
        .map(filter => filter.trim())
        .filter(filter => filter.length > 0)
        .map(filter => filter.toLowerCase());
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    try {
        let rowCount = 0;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
        updateDebugInfo(`Current date for comparison: ${currentDate.toLocaleDateString()}`);

        scheduleData.forEach(row => {
            // Check if the row's cast is a special "match all" cast name
            const isSpecialCast = ALL_MATCH_CAST_NAMES.has(row.cast.toLowerCase());
            const castMatch = selectedCast === 'All' || row.cast === selectedCast || isSpecialCast;
            const callMatch = callFilters.length === 0 || callFilters.some(filter => 
                row.call.toLowerCase().includes(filter)
            );
            
            // Date comparison for remaining filter
            let dateMatch = true;
            if (showRemaining && row.date) {
                updateDebugInfo(`Raw date string: "${row.date}"`);
                
                // Parse the date string (format: "Month Day")
                const dateParts = row.date.split(' ');
                updateDebugInfo(`Date parts: ${JSON.stringify(dateParts)}`);
                
                if (dateParts.length === 2) {
                    const month = dateParts[0];
                    const day = parseInt(dateParts[1], 10);
                    
                    // Get current year
                    const currentYear = new Date().getFullYear();
                    
                    // Convert month name to month number (0-11)
                    const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
                    
                    if (!isNaN(monthIndex) && !isNaN(day)) {
                        const rowDate = new Date(currentYear, monthIndex, day);
                        rowDate.setHours(0, 0, 0, 0);
                        
                        dateMatch = rowDate >= currentDate;
                        updateDebugInfo(`Comparing dates - Row date: ${rowDate.toLocaleDateString()}, Current date: ${currentDate.toLocaleDateString()}, Match: ${dateMatch}`);
                    } else {
                        updateDebugInfo(`Invalid date parts - skipping date comparison`);
                        dateMatch = true; // Skip date filtering for invalid dates
                    }
                } else {
                    updateDebugInfo(`Invalid date format - skipping date comparison`);
                    dateMatch = true; // Skip date filtering for invalid dates
                }
            }

            if (castMatch && callMatch && dateMatch) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.day}</td>
                    <td>${row.date}</td>
                    <td>${row.time}</td>
                    <td>${row.cast}</td>
                    <td>${row.call}</td>
                    <td>${row.note}</td>
                `;
                tableBody.appendChild(tr);
                rowCount++;
            }
        });
        document.getElementById('rowCounter').textContent = `Found ${rowCount} rows`;
        updateDebugInfo(`Displayed filtered data for ${selectedCast}${callFilterText ? ` with call filters: ${callFilterText}` : ''}${showRemaining ? ' (remaining dates only)' : ''}`);
    } catch (error) {
        updateDebugInfo(`Error filtering table: ${error.message}`);
        console.error('Error filtering table:', error);
    }
}

// Function to fetch data from Google Spreadsheet
async function fetchSpreadsheetData() {
    try {
        const spreadsheetUrl = document.getElementById('spreadsheetUrl').value;
        updateDebugInfo('Fetching data from Google Spreadsheet...');
        const response = await fetch(spreadsheetUrl);
        const html = await response.text();
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find the table in the response
        const table = tempDiv.querySelector('table');
        if (!table) {
            throw new Error('Table not found in the response');
        }

        // Convert table to array of arrays, skipping the first row (headers)
        const rows = Array.from(table.querySelectorAll('tr'));
        const data = rows.slice(1).map(row => 
            Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
        );

        updateDebugInfo(`Fetched ${data.length} rows from spreadsheet (excluding headers)`);
        return data;
    } catch (error) {
        updateDebugInfo(`Error fetching data: ${error.message}`);
        console.error('Error fetching data:', error);
        return [];
    }
}

// Function to update the spreadsheet
async function updateSpreadsheet() {
    try {
        // Save the current URL when updating
        saveFilterState();
        
        const data = await fetchSpreadsheetData();
        scheduleData = processData(data);
        
        // Update cast filter options
        const castOptions = getCastOptions(data);
        updateCastFilter(castOptions);
        
        filterTable();
    } catch (error) {
        updateDebugInfo(`Error updating spreadsheet: ${error.message}`);
        console.error('Error updating spreadsheet:', error);
    }
}

// Initialize the page
async function init() {
    try {
        // Load saved filter state
        loadFilterState();
        
        const data = await fetchSpreadsheetData();
        scheduleData = processData(data);
        
        // Update cast filter options
        const castOptions = getCastOptions(data);
        updateCastFilter(castOptions);
        
        filterTable();
    } catch (error) {
        updateDebugInfo(`Error initializing: ${error.message}`);
        console.error('Error initializing:', error);
    }
}

// Initialize when the page loads
window.onload = init;
