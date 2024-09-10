document.getElementById('profile-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-picture').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

async function profileDownload() {
    try {
        const response = await fetch('/events');
        const events = await response.json();

        const uploads = document.querySelector('.uploads');
        uploads.innerHTML = '';

        events.forEach(event => {
            if (event.image_url) {
                const img = document.createElement('img');
                img.src = event.image_url;
                img.alt = 'Profile Image';
                uploads.appendChild(img);

                img.onclick = function() {
                    document.getElementById('profile-picture').src = this.src;
                }
            }
        });

    } catch (error) {
        console.error('Error loading events:', error);
    }
}

window.onload = profileDownload;