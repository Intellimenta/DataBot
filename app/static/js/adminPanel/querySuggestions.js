async function saveQuerySuggestions(dbId, event) {
    event.preventDefault();
    
    const form = document.getElementById('querySuggestionForm');
    const formData = new FormData(form);
    formData.append('dbId', dbId);

    const spinner = document.getElementById('spinnerQuerySuggestionSetup');
    spinner.style.display = 'block';
    const responseElement = document.getElementById('responseQuerySuggestionSetup');

    try {
        const response = await fetch('/save-query-suggestions', {
            method: 'POST',
            body: formData
        });
        
        spinner.style.display = 'none';

        const result = await response.text();
        responseElement.innerText = result;
        if (result.includes('Error')) {
            responseElement.style.color = 'red';
        }
        else {
            responseElement.style.color = 'green';
        }
    } catch (error) {
        spinner.style.display = 'none';
        responseElement.innerText = `An error occured while submitting the form (${error})`;
        responseElement.style.color = 'red'; 
    }
}