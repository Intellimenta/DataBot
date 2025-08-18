
async function saveAnalyticalModeConfig() {
    event.preventDefault();
    const spinner = document.getElementById('spinnerSaveAnalyticalModeConfig');
    spinner.style.display = 'block';
    const responseElement = document.getElementById('responseAlyticalModeConfig');

    var rowLimitDropdown = document.getElementById('analytical-mode-row-limit-dropdown');
    var rowLimit = rowLimitDropdown.options[rowLimitDropdown.selectedIndex].value;
    var metadata = document.getElementById('analytical-mode-metadata').value;
    const includeExplanation = document.getElementById('toggle-button-include-explanation').checked;

    try {
        const response = await fetch('/save-analytical-mode-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rowLimit:rowLimit, 
                metadata:metadata,
                includeExplanation:includeExplanation
            })
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
        responseElement.style.color = 'red'; 
        responseElement.innerText = `Save Failed. Error: ${error}`;
    }
}


async function saveAnalyticalModePreference(value) {
    const response = await fetch('/save-analytical-mode-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analyticalMode:value })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}