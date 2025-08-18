async function savePerformanceTuning() {
    event.preventDefault();
    const spinner = document.getElementById('spinnerSavePerformanceTuning');
    spinner.style.display = 'block';
    const responseElement = document.getElementById('responseSavePerformanceTuning');

    const schemaPruning = document.getElementById('toggle-button-schema-pruning').checked
    var llmModel1Dropdown = document.getElementById('llm-model1-dropdown');
    var llmModel2Dropdown = document.getElementById('llm-model2-dropdown');
    var llmModel3Dropdown = document.getElementById('llm-model3-dropdown');
    var llm1 = llmModel1Dropdown.options[llmModel1Dropdown.selectedIndex].value;
    var llm2 = llmModel2Dropdown.options[llmModel2Dropdown.selectedIndex].value;
    var llm3 = llmModel3Dropdown.options[llmModel3Dropdown.selectedIndex].value;

    try {
        const response = await fetch('/save-performance-tuning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({llmModel1:llm1, llmModel2:llm2, llmModel3:llm3, schemaPruningEnabled:schemaPruning })
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