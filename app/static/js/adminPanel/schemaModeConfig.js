async function savePublicSharingPreference(value) {
    const response = await fetch('/save-public-sharing-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allowPublicSharing:value })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}