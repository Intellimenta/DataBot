
function addToConversation(message) {
    const messageDiv = document.createElement('div');
    if (mediaQuery.matches) {
        messageDiv.style.cssText = 'padding: 5px; background-color: #6448833e; font-size: 15px; font-family:"Merriweather", "Rubik", sans-serif';
    } else {
        messageDiv.style.cssText = 'padding: 5px; background-color: #6448833e; font-size: 15px; font-family:"Merriweather", "Rubik", sans-serif; border-radius: 5px; margin: 10px 0px;';
    }
    messageDiv.className = 'user-message';

    if (language === 'ar-SA' || language === 'fa-IR' || language === 'he-IL') {
        messageDiv.style.textAlign = 'right';
        messageDiv.style.direction = 'rtl';
    } else {
        messageDiv.style.textAlign = 'left';
        messageDiv.style.direction = 'ltr';
    }

    // Preserve newlines by replacing them with <br>
    messageDiv.innerHTML = message
        .replace(/\r/g, '')   // remove carriage returns
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    conversationDiv.appendChild(messageDiv);

    // ask user to start a new chat on high message count
    const messages = conversationDiv.getElementsByClassName('user-message');
    const messageCount = messages.length;
    if (isChatSessionArchivePage == false && (messageCount == 6 || messageCount == 11 || messageCount == 16)) {
        showNotification(get_translation(`If your next question is on a different topic, for the best results, start a new chat by clicking the plus icon at the top.`, language), true, 5000);
    }
}


async function submitUserMessage(event) {
    event.preventDefault();
    try {
        const userMessage = document.getElementById('user_message').value;
        await askBotPipeline(userMessage);
    } catch (error) {
        await handleBotResponse("An error occurred: " + error.stack); // show the error to the user
    }
}


async function askBot(userQuery) {
    
    await scrollToBottom();

    let activeDbId = 0;
    let activeDbEngine = '';
    if (userQuery != 'show_personal_dashboard' && userQuery != 'clear_session') {
        // get the id of the selected active database
        const dropdown = document.getElementById("ActiveDatabaseDropdown");
        const selectedIndex = dropdown.selectedIndex;
        if (selectedIndex !== -1) {
            activeDbId = dropdown.options[selectedIndex].id;
            activeDbEngine = dropdown.options[selectedIndex].getAttribute('engine');
        }
        if (activeDbId == 0 && !userQuery.startsWith('?')) {
            if (isAdmin === true) {
                return {'main_response':'You need to first select a database from the dropdown at the top. If no option is available, please first add a database connection in the admin panel.'};
            } else {
                return {'main_response':'You need to first select a database from the dropdown at the top. If no option is available, please ask the admin to add a database connection.'};
            }
        }
    }

    const response = await fetch('/chat', {
        method: 'POST',
        body: new URLSearchParams({ userMessage: userQuery, activeDbId: activeDbId, activeDbEngine:activeDbEngine, chatSessionHash: window.chatSessionHash }),
    });
    const botResponse = await response.json();
    return botResponse;
}



async function askBotPipeline(userMessage) {

    try {

        document.getElementById('user_message').value = ''; // Clear the input field

        statusUpdatesDiv.innerHTML = '';
        loadingOverlay.style.display = 'block';  // show spinner
        await removeGreetingsAndSuggestionsDivs();
        
        // addToCommandHistory(userMessage.trim());  // this is the temp command history accessed by arrow keys. 
        // [removed in favor of shift+enter functionality which requires multiple lines and therefore the up/down arrow keys cannot be used for command history]

        addToConversation(userMessage);  // Append user's message to the current conversation

        await scrollToBottom();

        let activeDbId = 0;
        let activeDbEngine = '';
        if (userMessage != 'show_personal_dashboard' && userMessage != 'clear_session') {
            // get the id of the selected active database
            const dropdown = document.getElementById("ActiveDatabaseDropdown");
            const selectedIndex = dropdown.selectedIndex;
            if (selectedIndex !== -1) {
                activeDbId = dropdown.options[selectedIndex].id;
                activeDbEngine = dropdown.options[selectedIndex].getAttribute('engine');
            }
            if (activeDbId == 0 && !userMessage.startsWith('?')) {
                loadingOverlay.style.display = 'none'; 
                if (isAdmin === true) {
                    await handleBotResponse('You need to first select a database from the dropdown at the top. If no option is available, please first add a database connection in the admin panel.');
                } else {
                    await handleBotResponse('You need to first select a database from the dropdown at the top. If no option is available, please ask the admin to add a database connection.');
                }
                return;
            }
        }

        const data = {
            userMessage: userMessage,
            activeDbId: activeDbId,
            activeDbEngine: activeDbEngine,
            chatSessionHash: window.chatSessionHash
        };
        
        socket.send(JSON.stringify(data));  // chat() function will be called by the /ws endpoint
    
    } catch (error) {
        loadingOverlay.style.display = 'none';  
        await handleBotResponse("An error occurred: " + error.stack); // show the error to the user
    }    
}


async function handleBotResponse(botResponse, isChatSessionArchivePage=false, technicalDetails='') {
    
    const conversationDiv = document.getElementById('conversation');

    if ( botResponse == 'NA') {
        if (isChatSessionArchivePage == false && technicalDetails != '') {
            // add technical details button
            var actionButtonsContainer = document.getElementById('actionButtonsContainer');
            const techDetailsButton = document.createElement('button');
            techDetailsButton.className = 'intellimenta-color-button action-buttons tooltip';
            techDetailsButton.onclick = async function() {
                alert(technicalDetails);
            };
            const techDetailsButtonIcon = document.createElement('img');
            techDetailsButtonIcon.src = technicalDetailsIconURL;
            techDetailsButtonIcon.style.width = '21px';
            techDetailsButton.appendChild(techDetailsButtonIcon);
            const techDetailsButtonTooltip = document.createElement('span');
            techDetailsButtonTooltip.className = 'tooltiptext';
            techDetailsButtonTooltip.style.whiteSpace = 'nowrap';
            techDetailsButtonTooltip.textContent = get_translation('Technical Details', language);
            techDetailsButton.appendChild(techDetailsButtonTooltip);
            actionButtonsContainer.appendChild(techDetailsButton);
        }
    }
    else {    
        if (botResponse.includes('<chartConfig>')) {  // contains one or more charts
            
            // breakdown the response into text and chartConfig parts
            const segments = botResponse.split(/(<chartConfig>[\s\S]*?<\/chartConfig>)/g);

            // loop through segments and process accordingly
            for (let segment of segments) {
                if (segment.startsWith('<chartConfig>') && segment.endsWith('</chartConfig>')) {
                    // strip the tags
                    segment = segment.replace('<chartConfig>', '').replace('</chartConfig>', '');
                    // add the chart to frontend
                    await makeViz(segment, conversationDiv);
                }
                else {
                    await addRegularMessageToChat(segment, conversationDiv);
                }
            }

            // remove previous action buttons 
            var actionButtonsContainer = document.getElementById('actionButtonsContainer');
            if (actionButtonsContainer) {
                actionButtonsContainer.remove();
            }
            // Add limited Action Buttons 
            if (isChatSessionArchivePage == false) {
                // *** feedback button ***
                const feedbackButton = document.createElement('button');
                feedbackButton.className = 'intellimenta-color-button action-buttons tooltip';
                
                feedbackButton.onclick = async function() {
                    await markAsBadResponse();
                    feedbackButton.style.backgroundColor = '#8451bc';
                };

                const feedbackButtonIcon = document.createElement('img');
                feedbackButtonIcon.src = feedbackButtonIconURL;
                feedbackButtonIcon.style.width = '21px';

                const feedbackButtonTooltip = document.createElement('span');
                feedbackButtonTooltip.className = 'tooltiptext';
                feedbackButtonTooltip.style.whiteSpace = 'nowrap';
                feedbackButtonTooltip.textContent = get_translation('Mark as Bad Response', language);

                feedbackButton.appendChild(feedbackButtonIcon);
                feedbackButton.appendChild(feedbackButtonTooltip);

                // container for the action buttons
                var actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.id = 'actionButtonsContainer';
                actionButtonsContainer.style.display = 'flex';
                actionButtonsContainer.style.justifyContent = 'flex-start';
                actionButtonsContainer.style.margin = '0px 5px';

                actionButtonsContainer.appendChild(feedbackButton);

                conversationDiv.appendChild(actionButtonsContainer);
            }
            
        } else {  // regular message

            const botResponseDiv = await addRegularMessageToChat(botResponse, conversationDiv);

            if (isChatSessionArchivePage == false) {
                await addActionButtonsAnalyticalMode(botResponseDiv, technicalDetails=technicalDetails);
            }
        }
    }
}


async function addRegularMessageToChat(botResponse, parentDiv) {
    const botResponseDiv = document.createElement('div');
    if ( language === 'ar-SA' || language === 'fa-IR' || language === 'he-IL' ) {
        botResponseDiv.className = 'bot-response-rtl';
    } else {
        botResponseDiv.className = 'bot-response-ltr';
    }
    botResponseDiv.classList.add('bot-response');
    
    if (botResponse.includes('</table>')) {  // when tables are rendered, it moves all the <br> tags (because we replace \n with <br>) to the top of table
                                                // so we exclude replacing \n with <br> for the part of the response that contains the table
        // Split around the <table>...</table> block (case-insensitive)
        const parts = botResponse.split(/(<table[\s\S]*?<\/table>)/i);
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i].toLowerCase().startsWith('<table')) {
                parts[i] = parts[i]
                    .replace(/\n/g, '<br>')
                    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            }
        }
        formattedResponse = parts.join('');
    } else {
        formattedResponse = botResponse
            .replace(/\r/g, '')   // remove carriage returns
            .replace(/\n/g, '<br>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
    botResponseDiv.innerHTML = formattedResponse;
    parentDiv.appendChild(botResponseDiv);

    return botResponseDiv;
}