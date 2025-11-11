async function saveComplianceConfig() {
    
    const emailDomainsStr = document.getElementById('email-domains-for-compliance').value;

    const responseDiv = document.getElementById('responseComplianceConfig');
    const spinner = document.getElementById('spinnerSaveComplianceConfig');

    try {
        responseDiv.textContent = '';
        spinner.style.display = 'block'; 

        const response = await fetch('/save-compliance-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email_domains_requiring_compliance_str: emailDomainsStr, 
            })
        });
        const result = await response.text();

        spinner.style.display = 'none';

        responseDiv.textContent = result;
        if (result.startsWith('Error')) { responseDiv.style.color = 'red'; }
        else { responseDiv.style.color = 'green'; }

    } catch (error) {
        spinner.style.display = 'none';
        responseDiv.innerText = `An error occured while saving (${error})`;
        responseDiv.style.color = 'red'; 
    }
}
