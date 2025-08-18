async function saveAppMode(value) {
    const schemaModeText = document.getElementById('schema-mode-text');
    const analyticalModeText = document.getElementById('analytical-mode-text');
    if (value == true) {
        schemaModeText.style.fontWeight = 'normal';
        analyticalModeText.style.fontWeight = 'bold';
    } else {
        schemaModeText.style.fontWeight = 'bold';
        analyticalModeText.style.fontWeight = 'normal';
    }
    const response = await fetch('/save-app-mode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appMode:value })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}
