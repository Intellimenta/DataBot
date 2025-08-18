async function saverlac(groupName, dbId, tableId) {
    event.preventDefault();
    const postfix = '_' + groupName + '_' + dbId + '_' + tableId;
    const spinner = document.getElementById('spinnerSaverlac' + postfix);
    spinner.style.display = 'block';
    const responseElement = document.getElementById('responseSaverlac' + postfix);

    const inputElementForFilterValue = document.getElementById("filter_value_" + groupName + '_' + tableId);
    var dropdown = document.getElementById('rlacDropdown_' + groupName + '_' + tableId);
    var selectedOption = dropdown.options[dropdown.selectedIndex];
    var selectedOptionId = selectedOption.id;
    try {
        const response = await fetch('/save-rlac', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({groupName:groupName, dbId:dbId, tableId:tableId, fieldId:selectedOptionId, filterValue:inputElementForFilterValue.value })
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