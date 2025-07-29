// public/js/bannerPreview.js

document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('image');
  const bannerPreview = document.getElementById('bannerPreview');

  if (!imageInput || !bannerPreview) return;

  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        bannerPreview.src = e.target.result;
      }
      reader.readAsDataURL(file);
    } else {
      // If no file chosen, you can reset the preview or keep existing
      // Here we keep existing, but you can adjust if needed
      // bannerPreview.src = 'path/to/default/image.jpg';
    }
  });
});
