
async function createResponseQualityTest(dbId) {
    const spinner = document.getElementById('spinnerAdminPanel');
    spinner.style.display = 'block';

    const testsSection = document.getElementById('responseQualityTestCases');
    const newTestDiv = document.createElement('div');
    newTestDiv.className = 'response-quality-test-container';
    newTestDiv.innerHTML = `
        <div style="display: flex; flex-direction: row; width: 100%;">
            <input type="text" placeholder="Query (e.g. 'number of orders')" class="input-with-shadow" style="padding: 8px 10px; margin-bottom: 10px; font-size: 13px; min-width: 100%;">
            <div class="response-quality-test-icons-container">
                <img src="${runTestButtonURL}" title='Run the Test' onclick="openTabNoPreLoadRunResponseQualityTests(${dbId}, [this.parentElement.parentElement.querySelector('input').value])" class="disabled">
                <img src="${deleteButtonURL}" class="response-quality-test-delete-button" title='Delete Test' onclick="deleteResponseQualityTest(this)">
            </div>
        </div>        
        <textarea placeholder="Expected SQL Query (e.g. 'SELECT COUNT(*) FROM orders')" class="input-with-shadow" style="padding: 8px 10px; height: 50px; width:100%; min-width: 100%; "></textarea>
    `;
    testsSection.appendChild(newTestDiv);
    spinner.style.display = 'none';
}


async function deleteResponseQualityTest(button) {
    const testCaseDiv = button.closest('.response-quality-test-container');
    if (testCaseDiv) {
      testCaseDiv.remove();
    }
  }



async function saveResponseQualityTests(dbId) {
    const spinner = document.getElementById('spinnerSaveResponseQualityTests');
    const responseElement = document.getElementById('responseSaveResponseQualityTests');
    responseElement.innerText = '';
    spinner.style.display = 'block';
    
    const testsSection = document.getElementById('responseQualityTestCases');
    const testCases = [];

    for (const testDiv of testsSection.children) {
        const inputElement = testDiv.querySelector('input');
        const textAreaElement = testDiv.querySelector('textarea');
        const query = inputElement.value;
        const queryColor = window.getComputedStyle(inputElement).color;
        const last_run_result = (queryColor === 'rgb(0, 128, 0)') ? 'Passed' : ((queryColor === 'rgb(255, 0, 0)') ? 'Failed' : 'Not Run');
        const expected_sql = textAreaElement.value;
        if (query.trim() != '' ) {
            testCases.push({ query, expected_sql, last_run_result });
        }
    }

    try {
        const response = await fetch('/save-response-quality-tests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dbId: dbId, testCases:testCases })
        });
        
        spinner.style.display = 'none';

        const result = await response.text();
        responseElement.innerText = result;
        if (result.includes('Error')) {
            responseElement.style.color = 'red';
        }
        else {
            responseElement.style.color = 'green';

            // remove disabled class from <img> elements in responseQualityTestCases
            const testsSection = document.getElementById('responseQualityTestCases');
            const runTestButtons = testsSection.querySelectorAll('img[title="Run the Test"].disabled');
            runTestButtons.forEach(button => button.classList.remove('disabled'));

        }
    } catch (error) {
        spinner.style.display = 'none';
        responseElement.innerText = `An error occured while saving: ${error}`;
        responseElement.style.color = 'red'; 
    }
}
