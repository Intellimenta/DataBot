
async function handleEmailSetup(event) {
    event.preventDefault(); 
    
    const responseElement = document.getElementById('responseEmailSetup');
    responseElement.innerText = '';

    const formData = new FormData(document.getElementById('emailSetupForm'));
    const action = event.submitter.value;
    formData.append('action', action);
    
    const spinner = document.getElementById('spinnerEmailSetup');
    spinner.style.display = 'block';  // Show the spinner
    try {
        const response = await fetch('/email-setup', {
            method: 'POST',
            body: formData
        });
        
        spinner.style.display = 'none';  // Hide the spinner
        const result = await response.text();
        
        responseElement.innerText = result;
        if (result.startsWith('Error')) { responseElement.style.color = 'red'; }
        else { responseElement.style.color = 'green'; }
    } catch (error) {
        spinner.style.display = 'none';
        responseElement.innerText = `An error occured while submitting the form (${error})`;
        responseElement.style.color = 'red'; 
    }
}