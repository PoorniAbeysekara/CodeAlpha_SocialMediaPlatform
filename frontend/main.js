
const postTextInput = document.getElementById('postText');
const postImageUrlInput = document.getElementById('postImageUrl');
const createPostButton = document.getElementById('createPostBtn');
const postsContainer = document.getElementById('postsContainer'); // Assuming you have this for displaying posts


async function fetchAndDisplayPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts');
        if (!response.ok) {
            throw new Error('Network error. Could not load posts.');
        }
        const posts = await response.json();

        // Clear existing posts
        postsContainer.innerHTML = '';

        // Display posts
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.setAttribute('data-id', post._id); // Essential for deletion

            let imageUrlHtml = '';
            if (post.imageUrl) {
                imageUrlHtml = `<img src="${post.imageUrl}" alt="Post Image">`;
            }

            postElement.innerHTML = `
                <h4>@${post.user.username}</h4>
                <p>${post.text}</p>
                ${imageUrlHtml}
                <small>${new Date(post.date).toLocaleString()}</small>
                <button class="delete-btn" data-id="${post._id}">Delete</button>
            `;
            postsContainer.appendChild(postElement);
        });

        // Add event listeners for delete buttons (re-attach after re-rendering posts)
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeletePost);
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = `<p class="error-message">Network error. Could not load posts.</p>`;
    }
}

// --- Function to handle post deletion (from previous steps) ---
async function handleDeletePost(event) {
    const postId = event.target.dataset.id;
    const token = localStorage.getItem('token'); // Get token from local storage

    if (!token) {
        alert('You must be logged in to delete posts.');
        return;
    }

    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Send the token in the Authorization header
            }
        });

        if (response.status === 401) {
            alert('You are not authorized to delete this post.');
            // Optionally, log out user or redirect to login
            return;
        }

        if (!response.ok) {
            // Attempt to parse error message from backend if available
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`Network error during post deletion: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        alert(data.message); // Should say 'Post removed successfully'
        fetchAndDisplayPosts(); // Re-fetch and display posts to update the list

    } catch (error) {
        console.error('Error deleting post:', error);
        alert(`Failed to delete post: ${error.message}`);
    }
}


const postImageFileInput = document.getElementById('postImageFile');


createPostButton.addEventListener('click', async () => {
    const text = postTextInput.value.trim();
    const imageFile = postImageFileInput.files[0]; // Get the selected file

    // Basic validation
    if (!text) {
        alert('Please enter some text for your post.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to create a post.');
        return;
    }


    const formData = new FormData();
    formData.append('text', text);
    if (imageFile) {
        formData.append('postImage', imageFile); // 'postImage' must match the fieldname in upload.single('postImage')
    }


    try {
        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
            
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            if (errorData.errors && errorData.errors.length > 0) {
                alert('Post creation failed: ' + errorData.errors.map(err => err.msg).join(', '));
            } else {
                throw new Error(errorData.message || response.statusText || 'Failed to create post');
            }
            return;
        }

        const result = await response.json();
        alert(result.message); // "Post created successfully"

        // Clear the form fields
        postTextInput.value = '';
        postImageFileInput.value = ''; // Clear the file input

        fetchAndDisplayPosts();

    } catch (error) {
        console.error('Error creating post:', error);
        alert(`Could not create post: ${error.message}`);
    }
});


document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);