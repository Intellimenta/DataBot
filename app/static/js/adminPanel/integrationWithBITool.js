async function handleConnectBItool(event) {
    event.preventDefault(); 
    
    const responseElement = document.getElementById('responseConnectBItool');
    responseElement.innerText = '';

    const formData = new FormData(document.getElementById('connectBItoolForm'));
    const action = event.submitter.value;
    formData.append('action', action);
    
    const spinner = document.getElementById('spinnerConnectBItool');
    spinner.style.display = 'block';  // Show the spinner
    try {
        const response = await fetch('/connect-bi-tool', {
            method: 'POST',
            body: formData
        });
        
        spinner.style.display = 'none';  // Hide the spinner
        const result = await response.text();
        
        responseElement.innerText = result;
        if (result.startsWith('Error')) { responseElement.style.color = 'red'; }
        else { responseElement.style.color = 'green'; }
    } catch (error) {
        spinner.style.display = 'none';
        responseElement.innerText = `An error occured while submitting the form (${error})`;
        responseElement.style.color = 'red'; 
    }
}


function getTableMapping(tableId) {
    // Get the table element
    const table = document.getElementById(tableId);
    
    const result = {};

    // Get all rows except the header row
    const rows = Array.from(table.getElementsByTagName('tr')).slice(1);

    // Process each row
    rows.forEach(row => {
        // Get the group name from the first cell
        const groupName = row.getElementsByTagName('td')[0].textContent.trim();
        
        // Get the input value from the second cell
        const input = row.getElementsByTagName('input')[0];
        const value = input ? input.value : '';
        
        // Add to result object
        result[groupName] = value;
    });

    return result;
}


async function saveTwoColConfig() {
    const spinner = document.getElementById('saveTwoColumnSpinner');
    spinner.style.display = 'block';
    const responseDiv = document.getElementById('saveTwoColumnResponse');
    
    try {    
        // get user group assignments
        const userGroupMapping = getTableMapping('two_column_assignment_table');
        const filterDashboardsByUserAttributes = document.getElementById('toggle-button-filter-dashboards-by-user-attributes').checked;
        const useDashboardsAndWidgetMode = document.getElementById('toggle-button-use-dashboards-and-widget-mode').checked;
        const widgetTitle = document.getElementById('widget_name_bi_integration').value;

        const response = await fetch('/save-two-column-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userGroupMapping:userGroupMapping, 
                filterDashboardsByUserAttributes:filterDashboardsByUserAttributes, 
                useDashboardsAndWidgetMode:useDashboardsAndWidgetMode, 
                widgetTitle:widgetTitle
            })
        });
        spinner.style.display = 'none';  // Hide the spinner
        const result = await response.text();
        
        responseDiv.textContent = result;
        if (result.startsWith('Error')) { responseDiv.style.color = 'red'; }
        else { responseDiv.style.color = 'green'; }
    } catch (error) {
        spinner.style.display = 'none';
        responseDiv.innerText = `An error occured while saving the assignments (${error})`;
        responseDiv.style.color = 'red'; 
    }
}



async function saveDashboardCardIDsList() {
    const dashboardCardIDsList = document.getElementById('dashboard_card_ids_list').value;
    const response = await fetch('/save-dashboard-card-ids-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dashboardCardIDsList:dashboardCardIDsList})
    });
    const result = await response.text();
    if (result.startsWith('Error')) {
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    }
    else {
        showNotification(get_translation("Saved.", language), true);
    }
}


async function toggleUseDashboardsAsDataSource() {
    const section = document.getElementById('use_dashboards_as_data_source_div');
    const toggleBtn = document.getElementById('toggle-button-use-dashboard-cards-data-as-data-source');
    
    if (toggleBtn.checked) {
        section.style.display = 'flex';
    } else {
        section.style.display = 'none';
    }

    // also save the toggle preference
    const useDashboardCardsAsDataSource = document.getElementById('toggle-button-use-dashboard-cards-data-as-data-source').checked;
    const response = await fetch('/save-bi-integration-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            useDashboardCardsAsDataSource:useDashboardCardsAsDataSource,
        })
    });
    
    const result = await response.text();
    if (result.includes('Error')) {
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    }
    else {
        showNotification(get_translation("Saved.", language), true);
    }
}



async function refreshDashboardsCardsInDb() {
    
    const spinner = document.getElementById('spinnerRefreshCardData');
    const resultDiv = document.getElementById('responseRefreshCardData');

    spinner.style.display = 'block';

    const response = await fetch('/refresh-dashboards-cards-in-db', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        spinner.style.display = 'none';
        resultDiv.style.color = 'red';
        resultDiv.innerText = 'Sorry, there was an error while refreshing the cards data. You can see the error in the browser console and in the erorr_logs table.';
        console.log(result);
    } else {
        spinner.style.display = 'none';
        // green if result == 'Saved.' else blue
        resultDiv.style.color = result === 'Saved.' ? 'green' : 'blue';
        resultDiv.innerText = result;
    } 
}