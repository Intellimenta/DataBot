async function markAsBadResponse() {
    const response = await fetch('/mark-as-bad-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}



async function downloadPDF(responseText, pdfTitle) {

    const res = await fetch('/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: responseText,
            title: pdfTitle || 'Chatbot Response',
        })
    });

    if (!res.ok) {
        showNotification(get_translation('Failed to generate PDF', language), false);
        console.error('Failed to generate PDF:', res.statusText);
        return; 
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chatbot_Response.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}




async function addActionButtonsAnalyticalMode(botResponseDiv) {
    // remove previous action buttons 
    var actionButtonsContainer = document.getElementById('actionButtonsContainer');
    if (actionButtonsContainer) {
        actionButtonsContainer.remove();
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


    // *** copy button ***
    const copyButton = document.createElement('button');
    copyButton.className = 'intellimenta-color-button action-buttons tooltip';
    
    copyButton.onclick = async function() {
        //  copy content of botResponseDiv to clipboard
        const textToCopy = botResponseDiv.innerText || botResponseDiv.textContent;
        try {
            await navigator.clipboard.writeText(textToCopy);
            showNotification(get_translation('Copied to clipboard.', language), true);
        } catch (err) {
            console.error('Failed to copy: ', err);
            showNotification(get_translation('Failed to copy to clipboard', language), false);
        }
    };

    const copyButtonIcon = document.createElement('img');
    copyButtonIcon.src = copyButtonIconURL;
    copyButtonIcon.style.width = '21px';

    const copyButtonTooltip = document.createElement('span');
    copyButtonTooltip.className = 'tooltiptext';
    copyButtonTooltip.style.whiteSpace = 'nowrap';
    copyButtonTooltip.textContent = get_translation('Copy', language);

    copyButton.appendChild(copyButtonIcon);
    copyButton.appendChild(copyButtonTooltip);

    
    // *** pdf button ***
    const pdfButton = document.createElement('button');
    pdfButton.className = 'intellimenta-color-button action-buttons tooltip';
    
    pdfButton.onclick = async function() {
        // get the text of the last div with class 'user-message'
        const userMessages = document.querySelectorAll('.user-message');
        const userMessageDiv = userMessages.length ? userMessages[userMessages.length - 1] : null;
        const userMessage = userMessageDiv ? userMessageDiv.innerText : '';
        const pdfContent = `<p class="user-message">User Message: <b>${userMessage}</b></p>
                            Bot Response:<br>
                            ${botResponseDiv.innerHTML}`;

        await downloadPDF(pdfContent, 'Chatbot Response');
    };

    const pdfButtonIcon = document.createElement('img');
    pdfButtonIcon.src = pdfButtonIconURL;
    pdfButtonIcon.style.width = '21px';

    const pdfButtonTooltip = document.createElement('span');
    pdfButtonTooltip.className = 'tooltiptext';
    pdfButtonTooltip.style.whiteSpace = 'nowrap';
    pdfButtonTooltip.textContent = get_translation('Download as PDF', language);

    pdfButton.appendChild(pdfButtonIcon);
    pdfButton.appendChild(pdfButtonTooltip);


    // container for the action buttons
    var actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.id = 'actionButtonsContainer';
    actionButtonsContainer.style.display = 'flex';
    actionButtonsContainer.style.justifyContent = 'flex-start';
    actionButtonsContainer.style.margin = '0px 5px';

    actionButtonsContainer.appendChild(copyButton);
    actionButtonsContainer.appendChild(pdfButton);
    actionButtonsContainer.appendChild(feedbackButton);

    conversationDiv.appendChild(actionButtonsContainer);
}
