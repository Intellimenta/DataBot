async function toggleChatbot() {
    
    const isHidden = rightColumn.classList.contains('hidden');

    if (isHidden) { // Show panel
      
      rightColumn.classList.remove('hidden');
      divider.classList.remove('hidden');

      // Restore previous width or set default
      let savedWidth = localStorage.getItem('leftColumnWidth');
      if (!savedWidth) {
        savedWidth = '72%';
      } else {
        savedWidth += 'px';
      }
      leftColumn.style.width = savedWidth;
      localStorage.setItem('rightPanelVisible', 'true');

    } else {  // Hide panel

      rightColumn.classList.add('hidden');
      divider.classList.add('hidden');
      leftColumn.style.width = '100%';
      localStorage.setItem('rightPanelVisible', 'false');
      
    }
}


async function loadDashboard(dashboardId) {
    const leftColumnDashboardIframe = document.getElementById('left-column-dashboard-iframe');
    
    // get embedding url for the dashboard
    const response = await fetch('/get-left-column-dashboard-embedding-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'dashboardId': dashboardId })
    });
    const result = await response.text();
    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Failed to load the dashboard!", language), false);
        console.log(result);
    } else {
        leftColumnDashboardIframe.src = result;
    } 
    
}