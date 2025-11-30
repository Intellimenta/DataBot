
function openTab(tabName) {
    
    if (tabName === 'querySuggestions') {
        // clear 'Saved.' message when re-opening the tab
        const response = document.getElementById('responseQuerySuggestionSetup');
        response.textContent = '';
    }
    document.getElementById(tabName).classList.add('active');   
}


async function openTabNoPreLoad(tabName, endpoint) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch(`get-html-content-for-${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}



async function openTabNoPreloadDatabaseConnection(dbId) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';

    const response = await fetch('/get-html-content-for-database-connection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dbId:dbId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById('db_ref');
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadViewPermissions(dbId, groupName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-view-current-permissions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dbId:dbId, groupName:groupName})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById('viewCurrentPermissions');
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadMetadata(tabName) {
    
    const spinner = document.getElementById('spinnerMetadataUpdate');
    spinner.style.display = 'block';
    
    const nameParts = tabName.split('_');
    const dbId = nameParts[0];
    const tableId = nameParts[1];

    const response = await fetch('/get-html-content-for-table-metadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dbId:dbId, tableId:tableId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    var fieldsDiv = document.getElementById(tabName + '_fields');
    fieldsDiv.innerHTML = result;
    tab.classList.add('active');

    await scrollUpMetadataSection();
}


async function openTabNoPreLoadRunResponseQualityTests(dbId) {
    
    const spinner = document.getElementById('spinnerSaveResponseQualityTests');
    spinner.style.display = 'block';

    const response = await fetch('/get-html-content-for-run-response-quality-tests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dbId:dbId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    const tab = document.getElementById('responseQualityTestRunResults');
    tab.innerHTML = result;
    tab.classList.add('active');

    if (!result.includes('There is no test defined.')) {
        // run the tests
        const data = { request_type: 'run_response_quality_tests', db_id: dbId };
        socket.send(JSON.stringify(data));
    }
    else {
        const spinnerTestRunResults = document.getElementById('spinnerTestRunResults');
        spinnerTestRunResults.style.visibility = 'hidden';
    }
}


async function openTabNoPreLoadCustomUserAttributeAssignment(attributeName) {
    
    const spinner = document.getElementById('spinnerAttributeAssignment');
    spinner.style.display = 'block';

    const response = await fetch('/get-html-content-for-custom-user-attributes-assignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({attributeName:attributeName})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById('customUserAttributeAssignment');
    tab.innerHTML = result;
    tab.classList.add('active');
}




async function openTabNoPreLoadrlac(tabName) {
    
    const spinner = document.getElementById('spinnerrlac');
    spinner.style.display = 'block';
    
    const nameParts = tabName.split('_');
    const groupName = nameParts[1]; 
    const dbId = nameParts[2];
    const tableId = nameParts[3];

    const response = await fetch('/get-html-content-for-rlac', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({groupName:groupName, dbId:dbId, tableId:tableId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    var fieldsDiv = document.getElementById(tabName + '_fields');
    fieldsDiv.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadDataObfuscation(tabName) {
    
    const spinner = document.getElementById('spinnerDataObfuscation');
    spinner.style.display = 'block';
    
    const nameParts = tabName.split('_');
    const groupName = nameParts[1]; 
    const dbId = nameParts[2];
    const tableId = nameParts[3];

    const response = await fetch('/get-html-content-for-data-obfuscation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({groupName:groupName, dbId:dbId, tableId:tableId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    var fieldsDiv = document.getElementById(tabName + '_fields');
    fieldsDiv.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadTwoColumnSetup(tabName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-two-column-setup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}



async function openTabNoPreLoadPerformanceTuning(tabName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-performance-tuning', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}



async function openTabNoPreLoadEmailSetup(tabName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-email-setup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadErrorLogs(tabName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-error-logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadGroupUserList(tabName) {
    
    const spinner = document.getElementById('spinnerGroups');
    spinner.style.display = 'block';
    
    const nameParts = tabName.split('_');
    const groupName = nameParts[1]; 

    const response = await fetch('/get-html-content-for-groups-user-list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({groupName:groupName})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    var fieldsDiv = document.getElementById(tabName + '_users');
    fieldsDiv.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadWhiteLabeling(tabName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';

    const response = await fetch('/get-html-content-for-white-labeling', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadResponseQualityTests(dbId) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-response-quality-tests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dbId:dbId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById('responseQualityTests');
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadQuerySuggestions(dbId) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-query-suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dbId:dbId})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById('querySuggestions');
    tab.innerHTML = result;
    tab.classList.add('active');
}


async function openTabNoPreLoadManageAccessToApp(tabName) {
    
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';
    
    const response = await fetch('/get-html-content-for-manage-access-to-app', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    spinner.style.display = 'none';
    const result = await response.text();
    
    var tab = document.getElementById(tabName);
    tab.innerHTML = result;
    tab.classList.add('active');
}


function closeTab(tabName) {
    document.getElementById(tabName).classList.remove('active');
}
