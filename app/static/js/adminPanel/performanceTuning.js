async function savePerformanceTuning() {
    event.preventDefault();
    const spinner = document.getElementById('spinnerSavePerformanceTuning');
    spinner.style.display = 'block';
    const responseElement = document.getElementById('responseSavePerformanceTuning');

    var llmModel1Dropdown = document.getElementById('llm-model1-dropdown');
    var llmModel2Dropdown = document.getElementById('llm-model2-dropdown');
    var llm1 = llmModel1Dropdown.options[llmModel1Dropdown.selectedIndex].value;
    var llm2 = llmModel2Dropdown.options[llmModel2Dropdown.selectedIndex].value;

    try {
        const response = await fetch('/save-performance-tuning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ llmModel1:llm1, llmModel2:llm2 })
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