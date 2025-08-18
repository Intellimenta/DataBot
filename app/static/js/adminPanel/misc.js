async function saveSendErrorReportsPreference(value) {
    const response = await fetch('/save-send-error-reports-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sendErrorReports:value })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}


async function saveSendAnonymosUsageDataPreference(value) {
    const response = await fetch('/save-send-anonymous-usage-data-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sendAnonymousUsageData:value })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}
