async function saveDataObfuscation(value, groupName, dbId, tableId, fieldId) {
    const response = await fetch('/save-data-obfuscation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ toggleChecked:value, groupName:groupName, dbId:dbId, tableId:tableId, fieldId:fieldId })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}