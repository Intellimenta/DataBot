
function showSelectedConnectionTypeFields() {
    // Hide all input groups and remove 'required' attribute from their input elements
    document.querySelectorAll('.input-group').forEach(group => {
        group.style.display = 'none';
        group.querySelectorAll('input, textarea').forEach(input => {
            input.removeAttribute('required');
        });
    });

    // Show the selected input group and add 'required' attribute to its input elements 
    // (except for 'Additional Connection String Options' field and ssl checkbox)
    const selectedValue = document.getElementById('ConnectionTypesDropdown').value;
    if (selectedValue) {
        const selectedGroup = document.getElementById(selectedValue);
        selectedGroup.style.display = 'flex';
        selectedGroup.querySelectorAll('input, textarea').forEach(input => {
            if (!input.name.includes('additional_options') && !input.name.includes('use_ssl')) {
                input.setAttribute('required', '');
            }
        });
    }

    // clear any prior messages
    const responseElement = document.getElementById('responseAddConnection');
    responseElement.innerText = '';
}



async function addDBConnection(event) {
    
    event.preventDefault();
    const responseElement = document.getElementById('responseAddConnection');
    const spinner = document.getElementById('spinnerDatabaseAdd');
    const form = document.getElementById('AddConnectionForm');
    const formData = new FormData(form);

    responseElement.innerText = '';  // clear previous messages
    spinner.style.display = 'block';  // Show the spinner

    try {
        const res = await fetch('/manage-db-connection', {
            method: 'POST',
            body: formData
        });
        
        spinner.style.display = 'none';  // Hide the spinner

        const response = await res.json();
        
        const responseMsg = response.message;
        responseElement.innerText = responseMsg;
        if (responseMsg.startsWith('Error')) {
            responseElement.style.color = 'red';
        }
        else {
            responseElement.style.color = 'green';
        }

        // add connection to list of manually-added connections
        if (!responseMsg.startsWith('Error')) {
            const dbId = response.db_id;
            const dbEngine = formData.get('connectionDropdown');
            const dbDisplayName = formData.get(`display_name_${dbEngine}`);
            
            const connectionRow = document.createElement('tr');
            connectionRow.id = `tr_db_ref_${dbId}`;
            connectionRow.innerHTML = `
                <tr id="tr_db_ref_${dbId}">
                    <td><a href="#" id="td_db_ref_${dbId}" onclick="openTabNoPreloadDatabaseConnection(${dbId})">${dbDisplayName}</a></td>
                    <td>${dbEngine}</td>
                </tr>
            `;
            document.getElementById('manualConnectionsTable').appendChild(connectionRow);
        }
    } catch (error) {
        spinner.style.display = 'none';
        responseElement.innerText = 'Error submitting form';
        responseElement.style.color = 'red'; 
    }
}



async function syncDBs() {

    const spinner = document.getElementById('spinnerSyncDBs');
    const responseElement = document.getElementById('responseSyncDBs');
    const syncButton = document.getElementById('sync_with_bi_tool');
    syncButton.disabled = true;  // Disable the button to prevent multiple clicks
    syncButton.style.cursor = 'not-allowed';  // Change cursor to indicate button is disabled
    responseElement.innerText = '';  // clear previous messages
    spinner.style.display = 'block';

    try {
        const response = await fetch('/sync-bi-dbs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(error => console.error('Error:', error)); 
        const res = await response.json();
        const result = res['response'];
        const res_type = res['response_type'];
        
        spinner.style.display = 'none';
        syncButton.disabled = false;  // Re-enable the button
        syncButton.style.cursor = '';  // Reset cursor

        if (res_type == 'list') {
            showNotification(get_translation('Sync completed.', language), true);
 
            html_content = `<div>
                <table>
                    <tr>
                        <th style="min-width: 300px;">Name</th>
                        <th>Engine</th>
                    </tr>`;
            result.forEach(db => {
                html_content += `
                    <tr id="tr_db_ref_${db[0]}">
                        <td><a href="#" id="td_db_ref_${db[0]}" onclick="openTabNoPreloadDatabaseConnection(${db[0]})">${db[2]}</a></td>
                        <td>${db[1]}</td>
                    </tr>`;
            });
            html_content += `</table></div>`;
            responseElement.innerHTML = html_content;
        } else {
            if (result.startsWith('Error')) {
                responseElement.style.color = 'red';
            }
            if (result.startsWith('No database connection found')) {
                responseElement.style.color = 'blue';
            }
            responseElement.innerText = result;
        }

    } catch (error) {
        spinner.style.display = 'none';
        syncButton.disabled = false;  // Re-enable the button
        syncButton.style.cursor = '';  // Reset cursor
        responseElement.style.color = 'red'; 
        responseElement.innerText = `Sorry. Something Went Wrong (${error})`;
    }
}


async function refreshManualDBs() {

    const spinner = document.getElementById('spinnerRefreshManualDBs');
    const responseElement = document.getElementById('responseRefreshManualDBs');
    const refreshButton = document.getElementById('refresh_manual_dbs_btn');
    refreshButton.disabled = true;  // Disable the button to prevent multiple clicks
    refreshButton.style.cursor = 'not-allowed';  // Change cursor to indicate button is disabled
    responseElement.innerText = '';  // clear previous messages
    spinner.style.visibility = 'visible';

    try {
        const response = await fetch('/refresh-manually-added-dbs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(error => console.error('Error:', error)); 
        const res = await response.json();
        const result = res['response'];
        
        spinner.style.visibility = 'hidden';
        refreshButton.disabled = false;  // Re-enable the button
        refreshButton.style.cursor = '';  // Reset cursor

        if (result == 'Refresh Completed.') {
            showNotification(get_translation('Refresh completed.', language), true, 3000);
        } else {
            if (result.startsWith('Error')) {
                responseElement.style.display = 'block';
                responseElement.style.color = 'red';
            }
            responseElement.innerText = result;
        }

    } catch (error) {
        spinner.style.visibility = 'hidden';
        refreshButton.disabled = false;  // Re-enable the button
        refreshButton.style.cursor = '';  // Reset cursor
        responseElement.style.display = 'block';
        responseElement.style.color = 'red'; 
        responseElement.innerText = `Sorry. Something Went Wrong (${error})`;
    }
}



async function saveMetadata(event, db_id, table_id) {
    event.preventDefault();
    
    const form = document.getElementById('save_metadata_' + table_id);
    const formData = new FormData(form);
    formData.append('db_id', db_id);
    formData.append('table_id', table_id);
    
    const spinner = document.getElementById('spinnerSaveMetadata_' + table_id);
    spinner.style.display = 'block';
    const responseElement = document.getElementById('responseSaveMetadata_' + table_id);

    try {
        const response = await fetch('/save-metadata', {
            method: 'POST',
            body: formData
        });
        
        spinner.style.display = 'none';

        const result = await response.text();
        responseElement.innerText = result;
        if (result.includes('Error')) {
            responseElement.style.color = 'red';
        }
        else {
            responseElement.style.color = 'green';
        }
    } catch (error) {
        spinner.style.display = 'none';
        responseElement.innerText = `An error occured while submitting the form (${error})`;
        responseElement.style.color = 'red'; 
    }
}



async function deleteConnection(dbId) {

    const responseElement = document.getElementById('spinnerDeleteConnection');
    const spinner = document.getElementById('responseDeleteConnection');
    spinner.style.display = 'block';
    
    // remove from backend
    const response = await fetch('/delete-db-connection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dbId: dbId }) 
    });
    const result = await response.text();
    spinner.style.display = 'none';

    if (result.startsWith('Error') ) {
        responseElement.style.color = 'red';
        responseElement.innerText = result;
    } else {

        // remove the connection table row from frontend
        const connectionRow = document.getElementById(`tr_db_ref_${dbId}`);
        if (connectionRow) {
            connectionRow.style.display = 'none';
        }

        closePopupScreen('deleteConnectionConfirmation');

        // close the tab
        closeTab("db_ref");
    }

}


async function saveDBdesc(dbId) {

    const spinner = document.getElementById('spinnerMetadataUpdate');
    spinner.style.display = 'block';

    const dbDescription = document.getElementById(`db_${dbId}`).value;

    const response = await fetch('/save-db-description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({  'dbId': dbId, 'dbDescription': dbDescription })
    });
    spinner.style.display = 'none';
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}


async function saveTablePermission(dbId, tableId, group, updateType) {
    const response = await fetch('/save-table-permission', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'dbId':dbId, 'tableId': tableId, 'group': group, 'update_type': updateType })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved. Refresh the page for the changes to take effect.", language), true, 3000);
    } 
}


function toggleCheckmarkTablePermissions(checkbox) {
    const dbId = checkbox.getAttribute('dbId');
    const tableId = checkbox.getAttribute('tableId');
    const groupMembership = checkbox.getAttribute('value');
    

    if (checkbox.checked) {
        checkbox.parentElement.classList.add('checked');
        saveTablePermission(dbId, tableId, groupMembership, 'add');
    } else {
        checkbox.parentElement.classList.remove('checked');
        saveTablePermission(dbId, tableId, groupMembership, 'remove');
    }
}