
async function loadPersonalDashboard() {
    const personalDashboardPopup = document.getElementById('personalDashboard_BG');
    personalDashboardPopup.style.display = "block";
    const personalDashboardDiv = document.getElementById('personalDashboardSection');
    personalDashboardDiv.innerHTML = '';  // clear the previous content
    try{
        const botResponse = await askBot('show_personal_dashboard');
        if (botResponse.main_response.startsWith('http')) {
            await loadIframeInsideDiv(personalDashboardDiv, botResponse.main_response, 'dashboard');
        } else {
            personalDashboardDiv.innerHTML = `
            <button class="close-button" onclick="closePopupScreen('personalDashboard_BG')">
                <img src="${closeIconUrl}" class="close_icon">Close
            </button>
            <button style="margin: auto; cursor: pointer; position: absolute; top: 30px; padding: 5px; width: 120px; left: calc(50% - 60px);" onclick="createTab()">
                Create a Tab
            </button>
            <div id="personalDashboardSpinner" class="spinner" style="display: none; position: absolute; top: 70px; padding: 5px; width: 10px; height: 10px; left: calc(50% - 15px);">
            </div>
            <p style="margin: 100px 20px;">
                Your personal dashboard is empty.<br> You can ask questions and add the results to your dashboard.
            </p>`;
        }
    } catch (error) {
        personalDashboardDiv.innerHTML = `
        <button class="close-button" onclick="closePopupScreen('personalDashboard_BG')">
            <img src="${closeIconUrl}" class="close_icon">Close
        </button>
        <p style="margin: 100px 20px;">
            An error occurred while loading the personal dashboard. (${error.stack})
        </p>`;
    }

}

async function createTab() {
    const spinner = document.getElementById('personalDashboardSpinner');
    try {

        spinner.style.display = 'block'; 
        const botResponse = await askBot('create a tab in dashboard');
        spinner.style.display = 'none';  

        if (botResponse.main_response.startsWith('Error')) {
            showNotification(get_translation('Tab Creation Failed!', language), false);
            console.log("An error occurred while creating the tab: " + botResponse.main_response);
        } else {
            showNotification(get_translation('Tab Created Successfully.', language), true);
            await loadPersonalDashboard();
        }

    } catch (error) {
        spinner.style.display = 'none';
        console.log("An error occurred: " + error.stack);
    }    
}
