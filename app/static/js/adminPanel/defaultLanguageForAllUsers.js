async function saveDefaultLangForAllUsers(language) {
    const statusUpdatesDiv = document.getElementById('status-updates');
    if ( language == 'ar-SA' || language == 'fa-IR' || language == 'he-IL' ) {
        statusUpdatesDiv.style.textAlign = 'right';
        statusUpdatesDiv.style.direction = 'rtl';
    } else {
        statusUpdatesDiv.style.textAlign = 'left';
        statusUpdatesDiv.style.direction = 'ltr';
    }

    const response = await fetch('/save-default-language-for-all-users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ default_language: language })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved. Refresh the page for the changes to take effect.", language), true, 3000);
    } 
}