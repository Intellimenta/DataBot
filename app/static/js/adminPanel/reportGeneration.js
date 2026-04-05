async function saveReportGenerationConfig() {
    const companyName = document.getElementById('report-gen-company-name').value;
    const fontSize = document.getElementById('report-gen-font-size').value;

    const response = await fetch('/save-report-generation-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'companyName': companyName, 'fontSize': fontSize })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}