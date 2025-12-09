
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
                    handleBotResponse('You need to first select a database from the dropdown at the top. If no option is available, please first add a database connection in the admin panel.');
                } else {
                    handleBotResponse('You need to first select a database from the dropdown at the top. If no option is available, please ask the admin to add a database connection.');
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


async function handleBotResponse(botResponse, onPageLoad=false, vizType='', isSingleColor=false, isChatSessionArchivePage=false, technicalDetails='') {
    
    const conversationDiv = document.getElementById('conversation');

    if ( botResponse == 'NA') {
        if (isAnalyticalMode && isChatSessionArchivePage == false && technicalDetails != '') {
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
        if (botResponse.startsWith('http')) {  // schema mode card

            // If the bot's response is a link, create an iframe to display it
            await loadIframeInsideDiv(conversationDiv, botResponse);
            
            // remove previous action buttons 
            var actionButtonsContainer = document.getElementById('actionButtonsContainer');
            if (actionButtonsContainer) {
                actionButtonsContainer.remove();
            }

            ////// Add Action Buttons //////
            if ( onPageLoad == false && isChatSessionArchivePage == false ) {  // so action buttons are not shown under personal dashboard or in chat session pages
                
                // *** modify button ***
                if ( ['bar', 'line', 'row', 'combo', 'area', 'scatter', 'waterfall', 'funnel'].includes(vizType) ) {

                    var modifyButton = document.createElement('button');
                    modifyButton.className = 'intellimenta-color-button action-buttons tooltip';
                    modifyButton.style.transform = 'scale(1)';

                    const modifyButtonIcon = document.createElement('img');
                    modifyButtonIcon.src = modifyButtonIconURL;

                    const modifyButtonTooltip = document.createElement('span');
                    modifyButtonTooltip.className = 'tooltiptext';
                    modifyButtonTooltip.style.width = 'auto';
                    modifyButtonTooltip.style.whiteSpace = 'nowrap';
                    modifyButtonTooltip.textContent = get_translation('Modify', language);

                    modifyButton.onclick = function() {
                        modifyButtonTooltip.style.display = 'none';
                        let modifyDiv = document.getElementById('modifyDiv');
                        if (modifyDiv) {
                            modifyDiv.remove();
                        } else {
                            modifyDiv = document.createElement('div');
                            modifyDiv.id = 'modifyDiv';
                            modifyDiv.style.cssText = `
                                display: flex;
                                align-items: flex-start;
                                flex-direction: column;
                                position: absolute;
                                bottom: 100%;
                                left: 0;
                                margin-bottom: 5px;
                                border: 1px solid #ccc;
                                padding: 10px;
                                background-color: #644883;
                                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                                border-radius: 5px;
                                width: auto;
                                white-space: nowrap;
                            `;

                            const optionChangeColor = document.createElement('div');
                            optionChangeColor.style.marginBottom = '5px';
                            optionChangeColor.innerHTML = `    
                                <label for="changeColorDropdown">Change Color:</label>
                                <select id="changeColorDropdown" style="max-width: 75px; padding: 2px 0px;">
                                    <option value="" disabled selected>Select Color&nbsp;</option>
                                    <option value="Blue">Blue</option>
                                    <option value="Green">Green</option>
                                    <option value="Yellow">Yellow</option>
                                    <option value="Purple">Purple</option>
                                    <option value="Cyan">Cyan</option>
                                    <option value="Lavender">Lavender</option>
                                    <option value="Orange">Orange</option>
                                    <option value="Red">Red</option>
                                    <option value="Grey">Grey</option>
                                </select>
                            `;

                            const optionRemoveXaxisLabel = document.createElement('label');
                            optionRemoveXaxisLabel.style.display = 'block';
                            optionRemoveXaxisLabel.style.marginBottom = '5px';
                            const checkboxRemoveXaxisLabel = document.createElement('input');
                            checkboxRemoveXaxisLabel.type = 'checkbox';
                            checkboxRemoveXaxisLabel.value = 'Remove X-Axis Label';
                            optionRemoveXaxisLabel.appendChild(checkboxRemoveXaxisLabel);
                            optionRemoveXaxisLabel.appendChild(document.createTextNode(get_translation('Remove X-Axis Label', language)));

                            const optionRemoveYaxisLabel = document.createElement('label');
                            optionRemoveYaxisLabel.style.display = 'block';
                            optionRemoveYaxisLabel.style.marginBottom = '5px';
                            const checkboxRemoveYaxisLabel = document.createElement('input');
                            checkboxRemoveYaxisLabel.type = 'checkbox';
                            checkboxRemoveYaxisLabel.value = 'Remove Y-Axis Label';
                            optionRemoveYaxisLabel.appendChild(checkboxRemoveYaxisLabel);
                            optionRemoveYaxisLabel.appendChild(document.createTextNode(get_translation('Remove Y-Axis Label', language)));

                            const optionHideValues = document.createElement('label');
                            optionHideValues.style.display = 'block';
                            optionHideValues.style.marginBottom = '5px';
                            const checkboxHideValues = document.createElement('input');
                            checkboxHideValues.type = 'checkbox';
                            checkboxHideValues.value = 'Hide Values On Chart';
                            optionHideValues.appendChild(checkboxHideValues);
                            optionHideValues.appendChild(document.createTextNode(get_translation('Hide Values On Chart', language)));

                            const optionRotate = document.createElement('label');
                            optionRotate.style.display = 'block';
                            optionRotate.style.marginBottom = '5px';
                            const checkboxRotate = document.createElement('input');
                            checkboxRotate.type = 'checkbox';
                            checkboxRotate.value = 'Rotate Labels 45°';
                            optionRotate.appendChild(checkboxRotate);
                            optionRotate.appendChild(document.createTextNode(get_translation('Rotate Labels 45°', language)));

                            const submitButton = document.createElement('button');
                            submitButton.textContent = 'Submit';
                            submitButton.style.display = 'block';
                            submitButton.style.margin = 'auto';
                            submitButton.style.marginTop = '3px';
                            submitButton.style.marginBottom = '1px';
                            submitButton.style.cursor = 'pointer';
                            submitButton.onclick = async function(event) {
                                
                                event.stopPropagation();
                                
                                const selectedOptions = [];
                                if (isSingleColor) {
                                    let dropdown = document.getElementById("changeColorDropdown");
                                    let selectedValue = dropdown.value;
                                    if (selectedValue) {selectedOptions.push('change color to ' + selectedValue);}
                                }
                                if (checkboxHideValues.checked) selectedOptions.push(checkboxHideValues.value);
                                if (checkboxRemoveXaxisLabel.checked) selectedOptions.push(checkboxRemoveXaxisLabel.value);
                                if (checkboxRemoveYaxisLabel.checked) selectedOptions.push(checkboxRemoveYaxisLabel.value);
                                if (checkboxRotate.checked) selectedOptions.push(checkboxRotate.value);
                                
                                modifyDiv.remove();
                                
                                if (selectedOptions.length > 0) {
                                    
                                    addToConversation(selectedOptions);
                                    statusUpdatesDiv.innerHTML = '';
                                    loadingOverlay.style.display = 'block';
                                    
                                    for (let option of selectedOptions) {    
                                        var botResponse_ = await askBot(option);
                                    }

                                    loadingOverlay.style.display = 'none';
                                    await handleBotResponse(botResponse_.main_response, false, botResponse_.viz_type, botResponse_.is_single_color);
                                    
                                };

                                // Scroll to the bottom
                                await scrollToBottom();
                            };
                            
                            if (isSingleColor) {
                                modifyDiv.appendChild(optionChangeColor);
                            }
                            modifyDiv.appendChild(optionRemoveXaxisLabel);
                            modifyDiv.appendChild(optionRemoveYaxisLabel);
                            modifyDiv.appendChild(optionRotate);
                            modifyDiv.appendChild(optionHideValues);
                            modifyDiv.appendChild(submitButton);

                            modifyDiv.onclick = function(event) {
                                event.stopPropagation();
                            };

                            modifyButton.appendChild(modifyDiv);
                        }
                    };

                    // Close modifyDiv when clicking outside
                    window.addEventListener('click', function(event) {
                        const modifyDiv = document.getElementById('modifyDiv');
                        if (modifyDiv && !event.target.closest('#modifyDiv') && !event.target.closest('.intellimenta-color-button')) {
                            modifyDiv.remove();
                            modifyButtonTooltip.style.display = 'block';  // enable tooltip again
                        }
                    });

                    modifyButton.appendChild(modifyButtonIcon);
                    modifyButton.appendChild(modifyButtonTooltip);
                }
                

                // *** visualize button ***
                var visualizeButton = document.createElement('button');
                visualizeButton.className = 'intellimenta-color-button action-buttons tooltip';
                visualizeButton.style.transform = 'scale(1)';

                const visualizeButtonIcon = document.createElement('img');
                visualizeButtonIcon.src = visualizeButtonIconURL;

                const visualizeButtonTooltip = document.createElement('span');
                visualizeButtonTooltip.className = 'tooltiptext';
                visualizeButtonTooltip.style.width = 'auto';
                visualizeButtonTooltip.style.whiteSpace = 'nowrap';
                visualizeButtonTooltip.textContent = get_translation('Visualize', language);

                visualizeButton.onclick = function() {
                    visualizeButtonTooltip.style.display = 'none';
                    let visualizeDiv = document.getElementById('visualizeDiv');
                    if (visualizeDiv) {
                        visualizeDiv.remove();
                    } else {
                        visualizeDiv = document.createElement('div');
                        visualizeDiv.id = 'visualizeDiv';
                        visualizeDiv.style.cssText = `
                            display: flex;
                            align-items: flex-start;
                            flex-direction: column;
                            position: absolute;
                            width: 140px;
                            bottom: 100%;
                            left: 0;
                            margin-bottom: 5px;
                            border: 1px solid #ccc;
                            padding: 10px;
                            background-color: #644883;
                            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                            border-radius: 5px;
                        `;

                        const dropdown = document.createElement('select');
                        dropdown.style.width = '100%';
                        dropdown.style.marginBottom = '10px';

                        const option1 = document.createElement('option');
                        option1.value = 'Line Chart';
                        option1.textContent = 'Line Chart';

                        const option2 = document.createElement('option');
                        option2.value = 'Bar Chart';
                        option2.textContent = 'Bar Chart';

                        const option3 = document.createElement('option');
                        option3.value = 'Pie Chart';
                        option3.textContent = 'Pie Chart';

                        const option4 = document.createElement('option');
                        option4.value = 'Row Chart';
                        option4.textContent = 'Row Chart';

                        const option5 = document.createElement('option');
                        option5.value = 'Area Chart';
                        option5.textContent = 'Area Chart';

                        const option6 = document.createElement('option');
                        option6.value = 'Combo Chart';
                        option6.textContent = 'Combo Chart';

                        const option7 = document.createElement('option');
                        option7.value = 'Funnel Chart';
                        option7.textContent = 'Funnel Chart';

                        const option8 = document.createElement('option');
                        option8.value = 'Waterfall Chart';
                        option8.textContent = 'Waterfall Chart';

                        const option9 = document.createElement('option');
                        option9.value = 'Scatterplot';
                        option9.textContent = 'Scatterplot';

                        const option10 = document.createElement('option');
                        option10.value = 'Progressbar';
                        option10.textContent = 'Progressbar';

                        const option11 = document.createElement('option');
                        option11.value = 'Trend Visualization';
                        option11.textContent = 'Trend Visualization';

                        const option12 = document.createElement('option');
                        option12.value = 'Map Visualization';
                        option12.textContent = 'Map Visualization';

                        const option13 = document.createElement('option');
                        option13.value = 'Number Visualization';
                        option13.textContent = 'Number Visualization';

                        const option14 = document.createElement('option');
                        option14.value = 'Gauge Visualization';
                        option14.textContent = 'Gauge Visualization';

                        dropdown.appendChild(option1);
                        dropdown.appendChild(option2);
                        dropdown.appendChild(option5);
                        dropdown.appendChild(option3);
                        dropdown.appendChild(option4);
                        dropdown.appendChild(option6);
                        dropdown.appendChild(option8);
                        dropdown.appendChild(option9);
                        dropdown.appendChild(option10);
                        dropdown.appendChild(option11);
                        dropdown.appendChild(option12);
                        dropdown.appendChild(option13);
                        dropdown.appendChild(option14);
                        dropdown.appendChild(option7);                            
                        
                        const submitButton = document.createElement('button');
                        submitButton.textContent = 'Submit';
                        submitButton.style.display = 'block';
                        submitButton.style.margin = 'auto';
                        submitButton.style.cursor = 'pointer';
                        submitButton.onclick = async function(event) {
                            
                            event.stopPropagation();
                            const selectedOption = dropdown.value;                            
                            
                            visualizeDiv.remove();
                            
                            addToConversation(selectedOption);
                            statusUpdatesDiv.innerHTML = '';
                            loadingOverlay.style.display = 'block';
                            var botResponse_ = await askBot(selectedOption);
                            loadingOverlay.style.display = 'none';
                            await handleBotResponse(botResponse_.main_response, false, botResponse_.viz_type, botResponse_.is_single_color);

                            // Scroll to the bottom
                            await scrollToBottom();
                        };

                        visualizeDiv.appendChild(dropdown);
                        visualizeDiv.appendChild(submitButton);

                        visualizeDiv.onclick = function(event) {
                            event.stopPropagation();
                        };

                        visualizeButton.appendChild(visualizeDiv);
                    }
                };

                // Close visualizeDiv when clicking outside
                window.addEventListener('click', function(event) {
                    const visualizeDiv = document.getElementById('visualizeDiv');
                    if (visualizeDiv && !event.target.closest('#visualizeDiv') && !event.target.closest('.intellimenta-color-button')) {
                        visualizeDiv.remove();
                        visualizeButtonTooltip.style.display = 'block';  // enable tooltip again
                    }
                });

                visualizeButton.appendChild(visualizeButtonIcon);
                visualizeButton.appendChild(visualizeButtonTooltip);


                // *** share button ***
                const shareButton = document.createElement('button');
                shareButton.className = 'intellimenta-color-button action-buttons tooltip';

                const shareButtonIcon = document.createElement('img');
                shareButtonIcon.src = shareButtonIconURL;
                
                const shareButtonTooltip = document.createElement('span');
                shareButtonTooltip.className = 'tooltiptext';
                shareButtonTooltip.style.width = 'auto';
                shareButtonTooltip.style.whiteSpace = 'nowrap';
                shareButtonTooltip.textContent = get_translation('Share', language);

                shareButton.onclick = async function() {
                    await askBotPipeline('generate public link');
                };

                shareButton.appendChild(shareButtonIcon);
                shareButton.appendChild(shareButtonTooltip);


                // *** add-to-dashboard button ***
                const addToDashboardButton = document.createElement('button');
                addToDashboardButton.className = 'intellimenta-color-button action-buttons tooltip';
                addToDashboardButton.style.transform = 'scale(1)';

                const addToDashboardButtonIcon = document.createElement('img');
                addToDashboardButtonIcon.src = addToDashboardButtonIconURL;

                const addToDashboardButtonTooltip = document.createElement('span');
                addToDashboardButtonTooltip.className = 'tooltiptext';
                addToDashboardButtonTooltip.style.width = 'auto';
                addToDashboardButtonTooltip.style.whiteSpace = 'nowrap';
                addToDashboardButtonTooltip.textContent = get_translation('Add to Personal Dashboard', language);

                addToDashboardButton.onclick = function() {
                    addToDashboardButtonTooltip.style.display = 'none';
                    let addToDashboardDiv = document.getElementById('addToDashboardDiv');
                    if (addToDashboardDiv) {
                        addToDashboardDiv.remove();
                    } else {
                        addToDashboardDiv = document.createElement('div');
                        addToDashboardDiv.id = 'addToDashboardDiv';
                        addToDashboardDiv.style.cssText = `
                            display: flex;
                            align-items: flex-start;
                            flex-direction: column;
                            position: absolute;
                            width: 200px;
                            bottom: 100%;
                            left: 0;
                            margin-bottom: 5px;
                            border: 1px solid #ccc;
                            padding: 10px;
                            background-color: #644883;
                            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                            border-radius: 5px;
                        `;

                        // // 'Create Tab' button
                        // const createTabButton = document.createElement('button');
                        // createTabButton.textContent = 'Create a Tab in Dashboard';
                        // createTabButton.style.margin = 'auto';
                        // createTabButton.style.cursor = 'pointer';

                        // createTabButton.onclick = async function(event) {
                        //     event.stopPropagation();
                        //     addToDashboardDiv.remove();
                            
                        //     await askBotPipeline('create a tab in dashboard');
                        // };
                        
                        // //horizontal line
                        // const hr = document.createElement('hr');
                        // hr.style.width = '95%';
                        // hr.style.margin = '10px auto';

                        // tab number
                        const dropdown = document.createElement('select');
                        dropdown.style.margin = 'auto';
                        dropdown.style.marginLeft = '-65px';

                        for (let i = 1; i <= 10; i++) {
                            const option = document.createElement('option');
                            option.value = i;
                            option.textContent = `Tab ${i}`;
                            dropdown.appendChild(option);
                        }

                        const submitButton = document.createElement('button');
                        submitButton.textContent = 'Add to Dashboard in';
                        submitButton.style.display = 'block';
                        submitButton.style.margin = 'auto';
                        submitButton.style.cursor = 'pointer';
                        submitButton.style.width = '198px';
                        submitButton.style.textAlign = 'left';
                        submitButton.onclick = async function(event) {
                            event.stopPropagation();
                            const tabNumber = dropdown.value || '1';
                            const mapping = {'1':'first', '2':'second', '3':'third', '4':'fourth', '5':'fifth', '6':'sixth', '7':'seventh', '8':'eighth', '9':'ninth', '10':'tenth'}
                            const command = tabNumber == '1' ? 'add to dashboard' : `add to ${mapping[tabNumber]} tab of dashboard `;
                            addToDashboardDiv.remove();
                            
                            await askBotPipeline(command);
                        };
                        
                        const tabNumberAndAddToDashboardDiv = document.createElement('div');
                        tabNumberAndAddToDashboardDiv.style.display = 'flex';
                        tabNumberAndAddToDashboardDiv.appendChild(submitButton);
                        tabNumberAndAddToDashboardDiv.appendChild(dropdown);

                        //addToDashboardDiv.appendChild(createTabButton);
                        //addToDashboardDiv.appendChild(hr);
                        addToDashboardDiv.appendChild(tabNumberAndAddToDashboardDiv);

                        addToDashboardDiv.onclick = function(event) {
                            event.stopPropagation();
                        };
                    }

                    addToDashboardButton.appendChild(addToDashboardDiv);
                };

                // Close addToDashboardDiv when clicking outside
                window.addEventListener('click', function(event) {
                    const addToDashboardDiv = document.getElementById('addToDashboardDiv');
                    if (addToDashboardDiv && !event.target.closest('#addToDashboardDiv') && !event.target.closest('.intellimenta-color-button')) {
                        addToDashboardDiv.remove();
                        addToDashboardButtonTooltip.style.display = 'block';
                    }
                });

                addToDashboardButton.appendChild(addToDashboardButtonIcon);
                addToDashboardButton.appendChild(addToDashboardButtonTooltip);
                

                // *** add to Text-to-SQL translation tests ***
                const addToResponseQualityTestsButton = document.createElement('button');
                if (isAdmin === true) {
                    addToResponseQualityTestsButton.className = 'intellimenta-color-button action-buttons tooltip';

                    const addToResponseQualityTestsButtonIcon = document.createElement('img');
                    addToResponseQualityTestsButtonIcon.src = addToResponseQualityTestsButtonIconURL;
                    
                    const addToResponseQualityTestsButtonTooltip = document.createElement('span');
                    addToResponseQualityTestsButtonTooltip.className = 'tooltiptext';
                    addToResponseQualityTestsButtonTooltip.style.width = '150px';
                    addToResponseQualityTestsButtonTooltip.textContent = get_translation('Add the query and the generated SQL as a new test case to the Text-to-SQL translation tests', language);;

                    addToResponseQualityTestsButton.onclick = async function() {
                        await askBotPipeline('add to Text-to-SQL translation tests');
                    };

                    addToResponseQualityTestsButton.appendChild(addToResponseQualityTestsButtonIcon);
                    addToResponseQualityTestsButton.appendChild(addToResponseQualityTestsButtonTooltip);
                }
                
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
                actionButtonsContainer.appendChild(addToDashboardButton);
                if (isAdmin === true) {
                    actionButtonsContainer.appendChild(addToResponseQualityTestsButton);
                }
                actionButtonsContainer.appendChild(shareButton);
                actionButtonsContainer.appendChild(visualizeButton);
                if ( ['bar', 'line', 'row', 'combo', 'area', 'scatter', 'waterfall', 'funnel'].includes(vizType) ) {
                    actionButtonsContainer.appendChild(modifyButton);
                }

                conversationDiv.appendChild(actionButtonsContainer);
            }
            
        } else if (botResponse.includes('<chartConfig>')) {  // contains one or more charts
            
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
            if (isAnalyticalMode && isChatSessionArchivePage == false) {
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

            if (isAnalyticalMode && isChatSessionArchivePage == false) {
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