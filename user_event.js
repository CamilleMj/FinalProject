// Delete Button
events.forEach(event => {
    const descDiv = document.createElement('div');
    descDiv.className = 'desc';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';

    deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this event?')) {
            await deleteEvent(event.id, descDiv);
        }
    });

    descDiv.appendChild(deleteButton);
    gallery.appendChild(descDiv);
});

async function deleteEvent(eventId, eventElement) {
    try {
        const response = await fetch(`/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Event deleted successfully!');
            eventElement.remove();
        } else {
            const errorData = await response.json();
            alert(`Error deleting event: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert(`Error deleting event: ${error.message}`);
    }
}