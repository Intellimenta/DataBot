function positionStatusUpdates(statusUpdatesWrapper) {
    const sidebar = document.getElementById("sidebar");
    const contentWrapper = document.getElementById("content-wrapper");

    if (!sidebar || !contentWrapper) return;

    const updatePosition = () => {
        const sidebarRect = sidebar.getBoundingClientRect();
        const contentWrapperRect = contentWrapper.getBoundingClientRect();

        // Calculate left: sidebar width + half of main width (relative to sidebar's left)
        const left = sidebarRect.width + contentWrapperRect.width / 2;
        statusUpdatesWrapper.style.left = `${left}px`;
        statusUpdatesWrapper.style.transform = "translate(-175px, -50%)";
    };

    updatePosition();

    // If the sidebar is transitioning, wait for the transition to end before updating position again
    if (getComputedStyle(sidebar).transitionDuration !== "0s") {
        const handler = () => {
            updatePosition();
            sidebar.removeEventListener("transitionend", handler);
        };
        sidebar.addEventListener("transitionend", handler);
    }
}



let socket; 
async function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    
    socket = new WebSocket(`${protocol}://${host}/ws`);

    socket.onopen = function () {
        //console.log("WebSocket connected");
    };
    
    let htmlBuffer = "";
    let currentResponseDivForStreaming = null;

    socket.onmessage = async function (event) {
        const botResponse = JSON.parse(event.data);
        
        if (botResponse.ws_msg_type === "status_update") {
            
            const statusUpdate = document.createElement('div');
            statusUpdate.textContent = botResponse.status;
            statusUpdatesDiv.appendChild(statusUpdate);

        } else if (botResponse.ws_msg_type === "final_response") {
            
            loadingOverlay.style.display = 'none';

            if (botResponse.explanation) {
                await handleBotResponse(botResponse.main_response, false, botResponse.viz_type, botResponse.is_single_color);
                await handleBotResponse(botResponse.explanation);
            } else {
                // main operation
                try {
                    await handleBotResponse(botResponse.main_response, false, botResponse.viz_type, botResponse.is_single_color, false, technicalDetails=botResponse.technical_details);
                }
                catch (error) {
                    console.error(error);
                    const errorDiv = document.createElement('div');
                    errorDiv.style.textAlign = 'left';
                    errorDiv.style.padding = '5px';
                    errorDiv.innerHTML = `An error occurred while processing the response: ${error}`;
                    conversationDiv.appendChild(errorDiv);
                }
            }
            await scrollToBottom();
        
        } else if (botResponse.ws_msg_type === "response_stream") {
            
            loadingOverlay.style.display = 'none';  // hide the status updates screen

            if (botResponse.create_new_div === true) { 
                currentResponseDivForStreaming = document.createElement('div');
                if ( language === 'ar-SA' || language === 'fa-IR' || language === 'he-IL' ) {
                    currentResponseDivForStreaming.className = 'bot-response-rtl';
                } else {
                    currentResponseDivForStreaming.className = 'bot-response-ltr';
                }
                currentResponseDivForStreaming.classList.add('bot-response');
                conversationDiv.appendChild(currentResponseDivForStreaming);  // add div to UI

                htmlBuffer = "";
            }

            if (botResponse.stream_data_type === "chunk") {

                htmlBuffer += botResponse.stream_data_content;
                
                // replace newlines with <br> but not inside <table> tags
                let formattedResponse;
                const tableStartIndex = htmlBuffer.search(/<table[\s\S]*?>/i);
                const tableEndIndex = htmlBuffer.search(/<\/table>/i);
                if (tableStartIndex !== -1 && (tableEndIndex === -1 || tableEndIndex < tableStartIndex)) {
                    // Incomplete table: don't touch newlines inside the table
                    // Only format text before <table>
                    const beforeTable = htmlBuffer.slice(0, tableStartIndex)
                        .replace(/\r/g, '')
                        .replace(/\n/g, '<br>')
                        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                    const afterTable = htmlBuffer.slice(tableStartIndex); // leave as-is
                    formattedResponse = beforeTable + afterTable;
                } else if (htmlBuffer.includes('</table>')) {
                    // Table is complete: apply selective formatting
                    const parts = htmlBuffer.split(/(<table[\s\S]*?<\/table>)/i);
                    for (let i = 0; i < parts.length; i++) {
                        if (!parts[i].toLowerCase().startsWith('<table')) {
                            parts[i] = parts[i]
                                .replace(/\n/g, '<br>')
                                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                        }
                    }
                    formattedResponse = parts.join('');
                } else {
                    // No table: format everything
                    formattedResponse = htmlBuffer
                        .replace(/\r/g, '')
                        .replace(/\n/g, '<br>')
                        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
                currentResponseDivForStreaming.innerHTML = formattedResponse;
                if (autoScrollEnabled && botResponse.scroll === true) {
                    await scrollToBottom();
                }
            } else if (botResponse.stream_data_type === "visualization") {  // this currently only applies when visualization is part of a combined request 
                                                                            // involving function calls and therefore uses streaming
                try {
                    if (autoScrollEnabled) {
                        await scrollToBottom();
                    }

                    // remove the div with the tag <tempdiv></tempdiv>
                    const tempDiv = conversationDiv.querySelector('tempdiv');
                    if (tempDiv) {
                        tempDiv.remove();
                    }
                    
                    //replace 'responsive: true' with 'responsive: false' to avoid resizing issues
                    chartConfigString = botResponse.chart_config.replace(/responsive:\s*true/g, 'responsive: false');

                    const canvas = document.createElement('canvas');
                    canvas.id = 'customChart_' + performance.now();  // Date.now(); is not unique enough
                    canvas.style.width = '100%';
                    canvas.style.height = '400px';
                    conversationDiv.appendChild(canvas);
                    const chartConfig = (new Function('return (' + chartConfigString + ')'))();
                    const ctx = document.getElementById(canvas.id).getContext('2d');
                    const customChart = new Chart(ctx, chartConfig);

                    if (autoScrollEnabled) {
                        await scrollToBottom();
                    }
                
                } catch (error) {
                    const errorDiv = document.createElement('div');
                    errorDiv.style.textAlign = 'left';
                    errorDiv.style.padding = '5px';
                    errorDiv.innerHTML = `An error occurred while creating the chart: ${error}`;
                    conversationDiv.appendChild(errorDiv);
                }

            } else if (botResponse.stream_data_type === "done") {  // end of stream

                await scrollToBottom();
                autoScrollEnabled = true;

                if (isAnalyticalMode && isChatSessionArchivePage == false) {
                    await addActionButtonsAnalyticalMode(currentResponseDivForStreaming);
                }
                
                currentResponseDivForStreaming = null;
                htmlBuffer = "";
            }

        } else if (botResponse.ws_msg_type === "test_run_result") {
            
            const testIndex = botResponse.test_index;
            const testResultsRow = document.getElementById('test_run_result_tr_' + testIndex);
            const testResult = botResponse.main_response;
            const stopSpinnerFlag = botResponse.stop_spinner;
            
            if ( stopSpinnerFlag == true ) {
                const spinnerTestRunResults = document.getElementById('spinnerTestRunResults');
                spinnerTestRunResults.style.visibility = 'hidden';
            }

            if (testResult.startsWith('Running')) {
                testResultsRow.cells[1].style.color = 'blue';
                testResultsRow.cells[1].innerHTML = testResult;
            } else if (testResult.startsWith('Passed')) {
                testResultsRow.cells[1].style.color = 'green';
                testResultsRow.cells[1].innerHTML = testResult;
            } else {
                const error = botResponse.error;
                testResultsRow.cells[1].style.color = 'red';
                testResultsRow.cells[1].innerHTML = `<a href="#" style="color: red;">${testResult}</a>`;
                testResultsRow.cells[1].onclick = function() {
                    showFailedTestError(error);
                };
            }
            
        } else {
            loadingOverlay.style.display = 'none';
            handleBotResponse('Unexpected Websocket message type: ' + botResponse.ws_msg_type);
        }
        
    };

    socket.onclose = function () {
        console.log("WebSocket closed, reconnecting...");
        setTimeout(connectWebSocket, 5000);  // Attempt to reconnect after 5s
    };

    socket.onerror = function (error) {
        console.error("WebSocket error:", error);
    };
}

connectWebSocket();