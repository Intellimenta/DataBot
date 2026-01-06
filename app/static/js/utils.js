// Function to scroll to the bottom
async function scrollToBottom() {

    // in full-screen mode, scroll is on content div
    const contentDiv = document.getElementById('content');
    contentDiv.scrollTo({
        top: contentDiv.scrollHeight,
        behavior: 'smooth'
    });

    // in chatbot+dashboard mode, scroll is on conversation div
    const conversationtDiv = document.getElementById('conversation');
    conversationtDiv.scrollTo({
        top: conversationtDiv.scrollHeight,
        behavior: 'smooth'
    });
}


async function scrollUpMetadataSection() {
    document.getElementById('db_ref').scrollTo({ top: 0, behavior: 'smooth' });
}


async function scrollToTop(elementId) {
    document.getElementById(elementId).scrollTo({ top: 0, behavior: 'smooth' });
}


function togglePopup() {
    if (popup.style.display === "none" || popup.style.display === "") {
        popup.style.display = "block";
    } else {
        popup.style.display = "none";
    }
}


function closePopup() {
    popup.style.display = "none";
}



function openPopupScreen(elementId, refId='', groupName='') {

    document.getElementById(elementId).style.display = "block";

    if (elementId == 'groupCreation') {
        // clear the text field
        var groupName = document.getElementById('userProvidedgroupName');
        groupName.value = '';
    }
    if (elementId == 'deleteGroupConfirmation') {
        groupBtnToDelete = document.getElementById(refId);
    }
    if (elementId == 'removeUserFromGroupConfirmation') {
        userRowToDelete = document.getElementById(refId);
        userToDeleteGroupName = groupName;
    }
    if (elementId == 'renameGroup') {
        groupBtnToRename = document.getElementById(refId);
    }
}

function closePopupScreen(elementId) {
    document.getElementById(elementId).style.display = "none";
}


function showFailedTestError(error) {
    const failedTestScreen = document.getElementById('failed_test_results_popup_screen');
    failedTestScreen.value = error;
    document.getElementById('failed_test_results_popup_screen_div').style.display = 'block';
}

function showFailureReason(error) {
    const failedTestScreen = document.getElementById('test_result_failure_reason_popup_screen');
    failedTestScreen.value = error;
    document.getElementById('test_result_failure_reason_popup_screen_div').style.display = 'block';
}



async function loadArchivedChatSession(chatSession) {
    try {
        for (const [query, response] of chatSession) {
            addToConversation(query);
            await handleBotResponse(response, false, '', false, true);
        }
    } catch (error) {
        await handleBotResponse("An error occurred: " + error.stack); // show the error to the user
    }
}

async function clearConversationFromFrontend() {
    try {
        loadingOverlay.style.display = 'block';
        conversationDiv.innerHTML = '';
        loadingOverlay.style.display = 'none';
    } catch (error) {
        loadingOverlay.style.display = 'none';
        await handleBotResponse("An error occurred: " + error.stack); // show the error to the user
    }
};


function showNotification(message, isSuccess, timeout = 2000) {
    const notificationId = 'notification-' + Date.now();
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'notification';
    notification.innerHTML = message;
    notification.style.background = isSuccess 
        ? "linear-gradient(135deg, #644883 0%, #ae9bc4 100%)" 
        : "linear-gradient(135deg, #ff4444 0%, #ff8888 100%)";
    
    document.body.appendChild(notification);
    
    // Trigger reflow to ensure the transition works
    notification.offsetHeight;
    
    notification.classList.add('show');
    activeNotifications++;
    
    // Position the notification
    notification.style.bottom = (30 + (activeNotifications - 1) * 50) + 'px';
    
    setTimeout(() => {
        notification.classList.remove('show');
        notification.style.bottom = '-100px'; // Slide out to bottom
        
        // Remove the notification after the slide-out animation completes
        notification.addEventListener('transitionend', function handler() {
            document.body.removeChild(notification);
            activeNotifications--;
            notification.removeEventListener('transitionend', handler);
        });
    }, timeout);
}


async function makeViz(chartConfigString, parentDiv) {
    // when updating this function, make sure to also update the corresponding code in statusUpdates.js

    try {

        //replace 'responsive: true' with 'responsive: false' to avoid resizing issues
        chartConfigString = chartConfigString.replace(/responsive:\s*true/g, 'responsive: false');

        const canvas = document.createElement('canvas');
        canvas.id = 'customChart_' + performance.now();  // Date.now(); is not unique enough
        canvas.style.width = '100%';
        canvas.style.height = '400px';
        parentDiv.appendChild(canvas);

        const chartConfig = (new Function('return (' + chartConfigString + ')'))();  // convert string to object
    
        const ctx = document.getElementById(canvas.id).getContext('2d');
        const customChart = new Chart(ctx, chartConfig);
    
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.textAlign = 'left';
        errorDiv.style.padding = '5px';
        errorDiv.innerHTML = `An error occurred while creating the chart: ${error}`;
        parentDiv.appendChild(errorDiv);
    }
    
}


async function loadIframeInsideDiv(div, iframeSource, iframeType='card') {
    const iframe = document.createElement('iframe');
    iframe.src = iframeSource;
    if (window.innerWidth < 1000) {
        iframe.style.borderRadius = '0px';
    } else {
        iframe.style.borderRadius = '5px';
    }
    iframe.frameborder= '0px';
    if (iframeType == 'card') {
        iframe.style.width = '99%';
        iframe.style.height = cardHeightPref; //'350px';
    } else {  // dashboard
        iframe.style.width = '100%';
        iframe.style.height = '99%';

        div.innerHTML = `
        <button class="close-button" style="margin:15px; position:absolute" onclick="closePopupScreen('personalDashboard_BG')">
            <img src="${closeIconUrl}" class="close_icon">Close
        </button>
        <button style="margin: auto; cursor: pointer; position: absolute; top: 15px; padding: 5px; width: 120px; left: calc(50% - 60px);" onclick="createTab()">
            Create a Tab
        </button>
        <div id="personalDashboardSpinner" class="spinner" style="display: none; position: absolute; top: 70px; padding: 5px; width: 10px; height: 10px; left: calc(50% - 15px);">
        </div>`;
    }
    div.appendChild(iframe);
}



function decodeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
}


async function loadGreetingsAndQuerySuggestions() {
    const greetingDiv = document.createElement('div');
    greetingDiv.id = 'greetingDiv';

    const image = document.createElement('img');
    image.src = logoUrl;
    image.alt = 'Logo';
    image.style.width = `${logoMaxWidth* 0.8}px`;
    greetingDiv.appendChild(image);

    const greetingParagraph = document.createElement('p');
    greetingParagraph.id='greeting';
    greetingParagraph.textContent  = get_translation('Hi! How can I help?', language);

    greetingDiv.appendChild(greetingParagraph);
    
    if (querySuggestions && Object.keys(querySuggestions).length > 0) {
        const querySuggestionsDiv = document.createElement('div');
        querySuggestionsDiv.id = 'query-suggestions';
        
        // get active db id
        const dropdown = document.getElementById('ActiveDatabaseDropdown');
        const selectedOption = dropdown.options[dropdown.selectedIndex];
        const activeDbId = selectedOption.id;

        const maxQueryLength =  (mediaQuery.matches) ? 100 : 60; 
        if (querySuggestions[activeDbId]) {
            querySuggestions[activeDbId].forEach(query => {
                if (query != '') {
                    const button = document.createElement("button");
                    button.className = "query-suggestion";
                    button.textContent = query.length > maxQueryLength ? query.substring(0, maxQueryLength) + '...' : query;
                    if (query.length > 60) {
                        button.title = query;
                    }
                    button.onclick = () => askBotPipeline(query);
                    querySuggestionsDiv.appendChild(button);
                }
            });
        }
        greetingDiv.appendChild(querySuggestionsDiv);
    }

    conversationDiv.appendChild(greetingDiv);
}


async function removeGreetingsAndSuggestionsDivs() {
    // remove suggestions div
    let querySuggestionsDiv = document.getElementById('query-suggestions');
    if (querySuggestionsDiv) {
        querySuggestionsDiv.style.display = 'none';
    }
    
    // remove the greeting div
    const greetingsDiv = document.getElementById('greetingDiv');
    if (greetingsDiv) {
        greetingsDiv.style.display = 'none';
    }
}


// // removed in favor of shift+enter functionality which requires multiple lines and therefore the up/down arrow keys cannot be used for command history
// function addToCommandHistory(userMsg) {
//     if (userMsg && !history.includes(userMsg)) {
//         history.push(userMsg);
//         historyIndex = history.length; // Move to end of history
//     }
// }


async function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); 
        submitUserMessage(event); // Trigger form submission
    }
}


async function registerActiveDB(onPageLoad=false) {

    const initialLoadingSpinner = document.getElementById('initialLoadingSpinner');
    
    if (!onPageLoad) {
        initialLoadingSpinner.style.display = 'block';  // Show the spinner
    }
    
    const dropdown = document.getElementById('ActiveDatabaseDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const activeDbId = selectedOption.id;
    const activeDbEngine = selectedOption.getAttribute('engine');

    await clearConversationFromFrontend();
    
    const response = await fetch('/save-active-db', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activeDbId: activeDbId, activeDbEngine:activeDbEngine })
    });
    const result = await response.text();
    if (result != 'Saved.') {
        await handleBotResponse(result);
    }

    if (!onPageLoad) {
        await createNewChatSession();
    }

    await loadGreetingsAndQuerySuggestions();

    if (!onPageLoad) {
        initialLoadingSpinner.style.display = 'none';
    }
}


function startVoiceRecognition() {
    if (!SpeechRecognition) {
        const errorMessage = 'Speech recognition is not supported in this browser. Please use a different browser, or type your query.';
        const conversationDiv = document.getElementById('conversation');
        const errorDiv = document.createElement('div');
        errorDiv.style.textAlign = 'left';
        errorDiv.style.padding = '5px';
        errorDiv.innerHTML = errorMessage;
        conversationDiv.appendChild(errorDiv);
        return;
    }

    userMsgArea = document.getElementById('user_message');
    transcriptionDiv = document.getElementById('transcription');
    transcriptionDiv.textContent = '';  // clear the previous transcription
    
    // Create a new instance of the SpeechRecognition API
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = showInterimResultPref;
    recognition.maxAlternatives = 10;
    
    recognition.onstart = () => {
        listeningDiv.style.visibility = 'visible';
    };

    if (language === 'ar-SA' || language === 'fa-IR' || language === 'he-IL') {
        transcriptionDiv.style.direction = 'rtl';
        userMsgArea.style.direction = 'rtl';
    } else {
        transcriptionDiv.style.direction = 'ltr';
        userMsgArea.style.direction = 'ltr';
    }

    if ( showInterimResultPref == 'True'  ) {
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            transcriptionDiv.textContent = transcript.replace(/\.$/, '');
            if (transcriptionDiv.style.direction == 'rtl') {
                transcript = transcript.replace(/\?/g, '؟');
            }
        };
    } else {
        recognition.onresult = (event) => {
            const currentResultIndex = event.resultIndex;
            let transcript = event.results[currentResultIndex][0].transcript.replace(/\.$/, '');
            if (transcriptionDiv.style.direction == 'rtl') {
                transcript = transcript.replace(/\?/g, '؟');
            }
            transcriptionDiv.textContent = transcript;
        };
    }

    recognition.onend = () => {
        recognition.stop();

        setTimeout(() => {
            listeningDiv.style.visibility = 'hidden';
        }, 600);

        userMsgArea.value = transcriptionDiv.textContent;
    };

    recognition.start();
}


async function startNewSession() {
    
    try {
        loadingOverlay.style.display = 'block';
        
        statusUpdatesDiv.innerHTML = '';  // since we show the spinner, we need to clear the previous status updates
        
        await clearConversationFromFrontend();

        await createNewChatSession();  // this also updates the global variable chatSessionHash

        loadingOverlay.style.display = 'none';

        await loadGreetingsAndQuerySuggestions();

    } catch (error) {
        loadingOverlay.style.display = 'none';
        await handleBotResponse("An error occurred: " + error.stack);
    }
}


async function createNewChatSession() {
    const response = await fetch('/create-new-chat-session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ oldChatSessionHash: window.chatSessionHash })
    });
    const result = await response.text();
    if (response.status === 200) {
        window.chatSessionHash = result;  // update the global variable with the new chat session hash
    } else {
        await handleBotResponse("An error occurred while creating a new chat session: " + result);
    }
}


async function loadMaps() {

    // world
    const w_response = await fetch(MAPS_PATH_URL + '/world.json');
    const world = await w_response.json();
    window.countryFeatures = ChartGeo.topojson.feature(world, world.objects.countries).features;

    // us
    const us_response = await fetch(MAPS_PATH_URL + '/us_states.json');
    const us = await us_response.json();
    window.usStateFeatures = ChartGeo.topojson.feature(us, us.objects.states).features;

    // canada
    const ca_response = await fetch(MAPS_PATH_URL + '/ca_provinces.json');
    const ca = await ca_response.json();
    window.caProvinceFeatures = ca.features;

}