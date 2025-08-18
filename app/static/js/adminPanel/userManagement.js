async function createGroup() {
    var groupName = document.getElementById('userProvidedgroupName').value.replace(/_/g, " ");
    var errorDiv = document.getElementById('groupCreationErrorDiv');
    errorDiv.innerHTML = "";

    if (['admins', 'default'].includes(groupName.toLowerCase())){
        errorDiv.innerHTML = "<p style='color: red;'>'Admins' and 'Default' are reserved group names. Please select a different name.</p>"
    } else {
        // add to backend
        const response = await fetch('/modify-groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ groupName: groupName, updateType: 'add' }) 
        }).catch(error => console.error('Error:', error)); 

        const result = await response.text();
        if (result.startsWith('Error')) {
            errorDiv.innerHTML = '<p style="color: red;">' + result;
        } else {
            // add to frontend

            // Create the button element
            const button = document.createElement('button');
            button.setAttribute('id', `usergroup_${groupName}`);
            button.className = 'tablinks';
            button.setAttribute('onclick', `openTabNoPreLoadGroupUserList('groupUserList_${groupName}')`);

            // Create the user_groups icon image element
            const img1 = document.createElement('img');
            img1.src = userGroupsIconURL;
            img1.style.paddingRight = '10px';
            
            // Create the arrow image element
            const img2 = document.createElement('img');
            img2.src = arrowForwardIconURL;
            img2.className = 'arrow';

            // Create the text node
            const textNode = document.createTextNode(groupName);

            button.appendChild(img1);
            button.appendChild(textNode);
            button.appendChild(img2);

            const groupsListDiv = document.getElementById('groupsList');
            groupsListDiv.appendChild(button);
            
            // add the inner page
            const innerDiv = document.createElement('div');
            innerDiv.setAttribute('id', `groupUserList_${groupName}`);
            innerDiv.className = 'tabcontent tabAdmin';
            innerDiv.innerHTML = `
                    <button class="back-button" style="max-width: 72px; max-height: 30px; margin-bottom: 50px; margin-top:22px;" onclick="closeTab('groupUserList_${groupName}')"><img src="${arrowBackwardIconURL}" class="back_icon">Back</button>
                    <h3 class="settings_inner_page_title" style="justify-content: center; padding-bottom: 10px;"><img src="${userGroupsIconURL}" style="padding-right: 10px;">${groupName}</h3>
                    
                    <div id="groupUserList_${groupName}_users">
                    </div>
                
                    <div style="margin-bottom: 20px; margin-top: 30px;">
                        <!-- <input value="Rename Group" onclick="openPopupScreen('renameGroup', 'usergroup_${groupName}')" class="intellimenta-color-button" style="text-align: center;"> -->
                        <input value="Delete Group" onclick="openPopupScreen('deleteGroupConfirmation', 'usergroup_${groupName}')" class="intellimenta-color-button" style="background-color: #d82222; text-align:center;">
                    </div>

                    <div id="responseDeleteGroup_${groupName}" style="margin: 20px;"></div>
                    <div id="spinnerDeleteGroup_${groupName}" class="spinner"></div>
            `
            
            userGroupsDiv = document.getElementById('userGroups');
            userGroupsDiv.appendChild(innerDiv);

            // close the popup
            closePopupScreen('groupCreation')   
        }
    }
}


async function deleteGroup() {

    var groupName = groupBtnToDelete.textContent;

    const spinner = document.getElementById(`spinnerDeleteGroup_${groupName}`);
    spinner.style.display = 'block';

    // remove from frontend
    closePopupScreen('deleteGroupConfirmation');
    groupBtnToDelete.style.display = "none";
    
    // remove from backend
    const response = await fetch('/modify-groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupName: groupName, updateType: 'remove' }) 
    });
    const result = await response.text();
    
    spinner.style.display = 'none';

    if (result.startsWith('Error') ) {
        var errorElement = document.getElementById(`responseDeleteGroup_${groupName}`);
        errorElement.style.color = 'red';
        errorElement.innerText = result;
    } else {
        // close the tab
        closeTab(`groupUserList_${groupName}`);
    }

}


async function renameGroup() {
    oldGroupName = groupBtnToRename.textContent;
    newGroupName = document.getElementById('userProvidedNewgroupName').value;

    //make changes in the backend
    const response = await fetch('/modify-groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupName: oldGroupName, newGroupName:newGroupName, updateType:'rename' }) 
    }); 
    const result = await response.text();
    
    var responseElement = document.getElementById(`responseDeleteGroup_${oldGroupName}`);

    if (result.startsWith('Error') ) {    
        responseElement.style.color = 'red';
        responseElement.innerText = result;
    } else {
        responseElement.style.color = 'green';
        responseElement.innerText = result;
    }

    closePopupScreen('renameGroup');

}


async function removeUserFromGroup() {
    
    var userEmail = userRowToDelete.cells[0].textContent;
    userRowToDelete.style.display = "none";

    // remove from frontend
    closePopupScreen('removeUserFromGroupConfirmation');

    // remove from backend
    const response = await fetch('/remove-user-from-group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userEmail: userEmail, groupName:userToDeleteGroupName }) 
    }).catch(error => console.error('Error:', error)); 

    const result = await response.text();
    if (result.startsWith('Error')) {
        console.error('Failed to remove user from group:', result);
        showNotification('Failed. Check the browser console for more details.', false, 5000);
    }
}


async function createCustomUserAttribute() {
    var attributeName = document.getElementById('userProvidedAttributeName').value;
    var errorDiv = document.getElementById('customUserAttributeCreationErrorDiv');
    errorDiv.innerHTML = "";

    // add to backend
    const response = await fetch('/create-custom-attribute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attributeName: attributeName }) 
    }).catch(error => console.error('Error:', error)); 

    const result = await response.text();
    if (result.startsWith('Error')) {
        errorDiv.innerHTML = '<p style="color: red;">' + result;
    } else {
        // add to frontend

        // Create the button element
        const button = document.createElement('button');
        button.setAttribute('id', `userAttribute_${attributeName}`);
        button.className = 'tablinks';
        button.setAttribute('onclick', `openTabNoPreLoadCustomUserAttributeAssignment('${attributeName}')`);

        // Create the icon image element
        const img1 = document.createElement('img');
        img1.src = userAttributeIconURL;
        img1.style.paddingRight = '10px';
        
        // Create the arrow image element
        const img2 = document.createElement('img');
        img2.src = arrowForwardIconURL;
        img2.className = 'arrow';

        // Create the text node
        const textNode = document.createTextNode(attributeName);

        button.appendChild(img1);
        button.appendChild(textNode);
        button.appendChild(img2);
        
        const attributesListDiv = document.getElementById('customUserAttributeList');
        attributesListDiv.appendChild(button);

        // close the popup
        closePopupScreen('customUserAttributeCreation')   
    }

}


async function saveCustomUserAttributeAssignment() {
    
    // show spinner 
    const spinner = document.getElementById('customUserAttributeAssignmentSpinner');
    spinner.style.display = 'block';
    const responseDiv = document.getElementById('customUserAttributeAssignmentResponse');
    const assignmentDiv = document.getElementById('customAttributeAssignmentDiv')

    try {
        // loop over all input elements in the div and get their id and value
        const inputs = assignmentDiv.getElementsByTagName('input');
        const assignmentMapping = {};
        const attributeName = inputs[0].id.split('|')[1];  // the id has the format "attribute|{attribute_name}|{email}"
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            const idParts = input.id.split('|');
            const email = idParts[2];
            const value = input.value;
            assignmentMapping[email] = value;
        }
        
        const response = await fetch('/save-attribute-assignment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ attributeName: attributeName, assignmentMapping: assignmentMapping }) 
        });
        
        spinner.style.display = 'none';  // Hide the spinner
        const result = await response.text();
        
        responseDiv.textContent = result;
        if (result.startsWith('Error')) { responseDiv.style.color = 'red'; }
        else { responseDiv.style.color = 'green'; }
    } catch (error) {
        spinner.style.display = 'none';
        responseDiv.innerText = `An error occured while saving the assignments (${error})`;
        responseDiv.style.color = 'red'; 
    }

}


function toggleDropdown(event) {
    event.stopPropagation();
    const dropdownMenu = event.target.nextElementSibling;
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
}


function toggleCheckmarkGroupMembership(checkbox) {
    const emailAddress = checkbox.getAttribute('emailaddress');
    const groupMembership = checkbox.getAttribute('value');
    

    if (checkbox.checked) {
        checkbox.parentElement.classList.add('checked');
        saveUserGroupMembersip(emailAddress, groupMembership, 'add');
    } else {
        checkbox.parentElement.classList.remove('checked');
        saveUserGroupMembersip(emailAddress, groupMembership, 'remove');
    }
}


async function saveUserGroupMembersip(email, group, updateType) {
    const response = await fetch('/save-user-group-membership', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({  'email': email, 'group': group, 'update_type': updateType })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}


async function saveUserAccess(email, hasAccess) {
    const response = await fetch('/save-user-access', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({  'email': email, 'hasAccess': hasAccess })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}