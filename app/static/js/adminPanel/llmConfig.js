async function saveLLMconfig() {
    const llmOpenaiApiKey = document.getElementById('llm_openai_api_key').value;
    const webSearchEnabled = document.getElementById('toggle-button-web-search').checked;
    const suggestFurtherQueriesEnabled = document.getElementById('toggle-button-suggest-further-queries').checked;
    const rowLimitDropdown = document.getElementById('analytical-mode-row-limit-dropdown');
    const rowLimit = rowLimitDropdown.options[rowLimitDropdown.selectedIndex].value;
    const metadata = document.getElementById('analytical-mode-metadata').value;
    const includeExplanation = document.getElementById('toggle-button-include-explanation').checked;
    const includeDataSource = document.getElementById('toggle-button-include-data-source').checked;
    const createSimpleChartsAutomatically = document.getElementById('toggle-button-create-simple-charts-automatically').checked;

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
            body: JSON.stringify({ 
                llm_openai_api_key: llmOpenaiApiKey, 
                web_search_is_enabled: webSearchEnabled, 
                suggest_further_queries_is_enabled: suggestFurtherQueriesEnabled,
                rowLimit: rowLimit, 
                metadata: metadata,
                include_explanation: includeExplanation,
                include_data_source: includeDataSource,
                create_simple_charts_automatically: createSimpleChartsAutomatically
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
