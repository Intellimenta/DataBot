async function toggleAllowedEmailDomainsDiv() {
    const allowedEmailDomainsDiv = document.getElementById('allowedEmailDomainsDiv');
    const allowedEmailDomainsCheckbox = document.getElementById('toggle-button-email-domain-whitelist');
    
    if (allowedEmailDomainsCheckbox.checked) {
        allowedEmailDomainsDiv.style.display = 'block';
    } else {
        allowedEmailDomainsDiv.style.display = 'none';
    }
}


async function saveAccessToAppConfig() {
    
    const toggleBtnManualAccess = document.getElementById('toggle-button-manual-access-grant').checked;
    const toggleBtnEmailDomainWhitelist = document.getElementById('toggle-button-email-domain-whitelist').checked;
    const textAreaallowedEmailDomains = document.getElementById('allowedEmailDomains').value;

    const response = await fetch('/save-access-to-app-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            'toggleBtnManualAccess': toggleBtnManualAccess, 
            'toggleBtnEmailDomainWhitelist': toggleBtnEmailDomainWhitelist, 
            'textAreaallowedEmailDomains': textAreaallowedEmailDomains 
        })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}