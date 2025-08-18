async function saveLLMconfig() {
    const llm_openai_api_key = document.getElementById('llm_openai_api_key').value;
    const responseDiv = document.getElementById('responseLLMconfig');
    const spinner = document.getElementById('spinnerSaveLLMconfig');

    try {
        responseDiv.textContent = '';
        spinner.style.display = 'block'; 

        const response = await fetch('/save-llm-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ llm_openai_api_key: llm_openai_api_key })
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