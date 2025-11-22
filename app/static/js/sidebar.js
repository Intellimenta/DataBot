function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarActiveDB = document.getElementById('active-db-container');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (sidebar.style.maxWidth === '0px') {
        sidebar.style.maxWidth = '230px';
        sidebar.style.minWidth = '230px';
        sidebarToggle.style.top = '0px';
        sidebarToggle.style.position = 'relative';
        sidebarActiveDB.style.display = 'block';

        sidebarStatus = 'open';
    } else {
        sidebar.style.maxWidth = '0px';
        sidebar.style.minWidth = '0px';
        sidebarToggle.style.position = 'absolute';
        sidebarToggle.style.top = '8px';
        
        sidebarStatus = 'closed';
    }
    
    // adjust the position of status updates
    positionStatusUpdates(statusUpdatesWrapper);
}


async function deleteArchivedChatSession(chatSessionHash) {
    const response = await fetch('/delete-archived-chat-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'chatSessionHash': chatSessionHash })
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Session Deletion Failed!", language), false);
        console.log(result);
    } else {
        const session = document.getElementById(`session_${chatSessionHash}`);
        session.style.transition = 'opacity 0.5s';
        session.style.opacity = '0';
        setTimeout(() => {
            session.style.display = 'none';
        }, 500);
    } 
}