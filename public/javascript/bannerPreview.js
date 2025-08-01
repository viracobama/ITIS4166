// public/javascript/bannerPreview.js
// This script handles the preview of a banner image before uploading it.

document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('banner');
  const bannerPreview = document.getElementById('bannerPreview');
  const dropZone = document.getElementById('bannerDropZone');

  if (!imageInput || !bannerPreview || !dropZone) return;

  // Click on drop zone triggers file input click
  dropZone.addEventListener('click', () => {
    imageInput.click();
  });

  // Handle file input change (regular file selection)
  imageInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
  });

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Highlight drop zone on dragover
  dropZone.addEventListener('dragover', () => {
    dropZone.style.borderColor = '#333';
    dropZone.style.backgroundColor = '#fafafa';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
    dropZone.style.backgroundColor = 'transparent';
  });

  // Handle dropped files
  dropZone.addEventListener('drop', (event) => {
    dropZone.style.borderColor = '#ccc';
    dropZone.style.backgroundColor = 'transparent';
    const dt = event.dataTransfer;
    if (dt.files && dt.files.length) {
      imageInput.files = dt.files; // update input files (optional)
      handleFiles(dt.files);
    }
  });

  function handleFiles(files) {
    if (!files.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      bannerPreview.src = e.target.result;
      bannerPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});
