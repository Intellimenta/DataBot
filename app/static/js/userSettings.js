
async function changePassword(event) {
    event.preventDefault();
    
    const form = document.getElementById('changePasswordForm');
    const formData = new FormData(form);
    
    const responseElement = document.getElementById('responseChangePassword');
    responseElement.innerText = '';
    const spinner = document.getElementById('spinnerChangePassword');
    spinner.style.display = 'block';
    

    try {
        const response = await fetch('/change-password', {
            method: 'POST',
            body: formData
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


async function saveUserLevelInstructions() {
    const instructions = document.getElementById('user-level-instructions').value;
    const responseDiv = document.getElementById('responseUserLevelInstructions');
    const spinner = document.getElementById('spinnerSaveUserLevelInstructions');

    try {
        spinner.style.display = 'block'; 

        const response = await fetch('/save-user-level-instructions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ instructions: instructions })
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



async function saveUserPreference(preferenceName, preferenceValue) {
    if (preferenceName == 'langPreference') { 
        langPref = preferenceValue;
        const statusUpdatesDiv = document.getElementById('status-updates');
        if ( langPref == 'ar-SA' || langPref == 'fa-IR' || langPref == 'he-IL' ) {
            statusUpdatesDiv.style.textAlign = 'right';
            statusUpdatesDiv.style.direction = 'rtl';
        } else {
            statusUpdatesDiv.style.textAlign = 'left';
            statusUpdatesDiv.style.direction = 'ltr';
        }
    }
    if (preferenceName == 'showInterimResult') { showInterimResultPref = preferenceValue; }
    if (preferenceName == 'cardHeightPreference') { cardHeightPref = preferenceValue; }

    const response = await fetch('/save-user-preference', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [preferenceName]: preferenceValue })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        if (preferenceName == 'langPreference') {
            showNotification(get_translation("Saved. Refresh the page for the changes to take effect.", preferenceValue), true, 3000);
        }
        // also set the height for the currntly displayed iframes
        if (preferenceName == 'cardHeightPreference') {
            const iframes = document.querySelectorAll('#conversation iframe');
            iframes.forEach(iframe => {
                iframe.style.height = preferenceValue;
            });
        }
        
    } 
}



function logout(isWidget) {
    fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) throw new Error('Logout failed');
        closePopup();
        const url = isWidget === 'True' ? '/login?is-widget=true' : '/login';
        window.location.href = url;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}
