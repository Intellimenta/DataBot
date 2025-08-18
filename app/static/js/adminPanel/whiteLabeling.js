async function saveWhiteLabelingConfig() {
    const clientAppName = document.getElementById('client-app-name').value;
    const clientLogoUrl = document.getElementById('client-logo-url').value;
    const clientFaviconUrl = document.getElementById('client-favicon-url').value;
    const clientLogoMaxWidth = document.getElementById('client-logo-max-width').value;
    const clientDemoUrl = document.getElementById('client-demo-url').value;

    const response = await fetch('/save-white-labeling-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'clientAppName': clientAppName, 'clientLogoUrl': clientLogoUrl, 'clientLogoMaxWidth': clientLogoMaxWidth, 'clientFaviconUrl': clientFaviconUrl, 'clientDemoUrl': clientDemoUrl })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}