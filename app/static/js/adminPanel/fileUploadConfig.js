
async function saveFileUploadConfig() {
    
    const spinner = document.getElementById('spinnerSaveUploadFile');
    const responseElement = document.getElementById('responseSaveUploadFileConfig');
    responseElement.innerText = '';
    spinner.style.display = 'block';

    const useUploadedFilesAsDataSource = document.getElementById('toggle-button-use-uploaded-files-as-data-source').checked;
    const vectorStoreId = document.getElementById('vectorStoreId').value;

    const response = await fetch('/save-file-upload-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ useUploadedFilesAsDataSource: useUploadedFilesAsDataSource, vectorStoreId: vectorStoreId })
    });
    const result = await response.text();
    spinner.style.display = 'none';
    responseElement.innerText = result;
    if (result.startsWith('Error')) {
        responseElement.style.color = 'red';
    }
    else {
        responseElement.style.color = 'green';
    }
}


async function toggleUseUploadedFilesAsDataSource(isChecked) {

    const response = await fetch('/save-use-uploaded-files-as-data-source', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({useAsDataSource:isChecked})
    });
    const result = await response.text();

    if (result.startsWith('Error') ) {   
        showNotification(get_translation("Save failed!", language), false);
        console.log(result);
    } else {
        showNotification(get_translation("Saved.", language), true);
    } 
}



// function displaySelectedFiles() {
//     const input = document.getElementById('file-upload-input');
//     const listDiv = document.getElementById('selected-files-list');
//     const files = input.files;
//     if (!files.length) {
//         listDiv.innerHTML = '';
//         return;
//     }
//     let html = '<ul style="padding-left: 40px; text-align: left;">';
//     for (var i = 0; i < files.length; i++) {
//         html += '<li>' + files[i].name + ' (' + Math.round(files[i].size/1024) + ' KB)</li>';
//     }
//     html += '</ul>';
//     listDiv.innerHTML = html;

//     const uploadButton = document.getElementById('upload-btn');
//     if (files.length > 0) {
//         uploadButton.style.display = 'inline-block';
//     } else {
//         uploadButton.style.display = 'none';
//     }
// }



// async function uploadFiles() {
//     const input = document.getElementById('file-upload-input');
//     const files = input.files;
    
//     const formData = new FormData();
//     for (let i = 0; i < files.length; i++) {
//         formData.append('files', files[i]); 
//     }

//     fetch('/upload-files', {
//         method: 'POST',
//         body: formData
//     }).catch(error => {
//         console.error('Upload failed:', error);
//     });
    
// }