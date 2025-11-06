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


async function clearConversationHistory(withSpinner=true, clearSessionFromDB=false) { 
    
    if (isSession !== true) {  // if it is not a session page (i.e. it's the regular main page)
        try {
            if (withSpinner) {
                loadingOverlay.style.display = 'block';  // show spinner
            }
            
            // clear frontend
            document.getElementById('conversation').innerHTML = '';

            // clear backend
            if (clearSessionFromDB) {
                const botResponse = await askBot('clear_session');
                await handleBotResponse(botResponse.main_response, true);
            }

            if (withSpinner) {
                loadingOverlay.style.display = 'none';  // hide spinner
            }

        } catch (error) {
            if (withSpinner) {
                loadingOverlay.style.display = 'none';  // hide spinner
            }
            await handleBotResponse("An error occurred: " + error.stack); // show the error to the user
        }
    } else {
        for (const [query, response] of chatSession) {
            addToConversation(query);
            await handleBotResponse(response, false, '', false, true);
        }
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
    try {
        const canvas = document.createElement('canvas');
        canvas.id = 'customChart_' + performance.now();  // Date.now(); is not unique enough
        canvas.style.width = '100%';
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
    if (window.innerWidth < 1000 || isChatbotAndDashboards) {
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



async function loadGreetingsAndQuerySuggestions() {
    const greetingDiv = document.createElement('div');
    greetingDiv.id = 'greetingDiv';
    greetingDiv.style.marginTop = '23%';

    const image = document.createElement('img');
    image.src = logoUrl;
    image.alt = 'Logo';
    image.style.width = `${logoMaxWidth* 0.8}px`;
    greetingDiv.appendChild(image);

    const greetingParagraph = document.createElement('p');
    greetingParagraph.id='greeting';
    if ( isFirstTimeUser === true ) {
        greetingParagraph.style.padding = '25px';
        greetingParagraph.style.fontSize = '17px';
        if ( wla ) {
            greetingParagraph.innerHTML = demoUrl 
                ? `For a quick overview of the app, please watch this <a href="${demoUrl}" target="_blank">demo video</a>.` 
                : get_translation('Hi! How can I help?', language);
        } else {
            greetingParagraph.innerHTML = isAnalyticalMode
                ? 'For a quick overview of the app, please watch this <a href="https://www.loom.com/share/2271af6de3c04a2b8b07dbc48dfb2963" target="_blank">demo video</a>.'
                : 'For a quick overview of the app, please watch this <a href="https://www.loom.com/share/d1af20ba05f94be2b9d84c5c26937463" target="_blank">demo video</a>.';
        }
        
    } else {
        greetingParagraph.textContent  = get_translation('Hi! How can I help?', language);
    }
    greetingDiv.appendChild(greetingParagraph);
    
    if (querySuggestions && Object.keys(querySuggestions).length > 0) {
        const querySuggestionsDiv = document.createElement('div');
        querySuggestionsDiv.id = 'query-suggestions';
        
        // get active db id
        const dropdown = document.getElementById('ActiveDatabaseDropdown');
        const selectedOption = dropdown.options[dropdown.selectedIndex];
        const activeDbId = selectedOption.id;

        const maxQueryLength =  (mediaQuery.matches || isChatbotAndDashboards) ? 120 : 60; 
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


async function registerActiveDB() {

    const initialLoadingSpinner = document.getElementById('initialLoadingSpinner');
    initialLoadingSpinner.style.display = 'block';
    
    const dropdown = document.getElementById('ActiveDatabaseDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const activeDbId = selectedOption.id;
    const activeDbEngine = selectedOption.getAttribute('engine');
    
    // // show spinner
    // const loadingOverlay = document.getElementById('loading-overlay');  
    // loadingOverlay.style.display = 'block';

    await clearConversationHistory();
    
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

    // loadingOverlay.style.display = 'none';

    await loadGreetingsAndQuerySuggestions();

    initialLoadingSpinner.style.display = 'none';  // Hide the spinner
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
    statusUpdatesDiv.innerHTML = '';  // since we show the spinner, we need to clear the previous status updates
    await clearConversationHistory(true, true);
    await loadGreetingsAndQuerySuggestions();
}
