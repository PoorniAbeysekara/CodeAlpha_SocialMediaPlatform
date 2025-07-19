
document.addEventListener('DOMContentLoaded', () => {
   
    let token = localStorage.getItem('token'); 
    let userId = localStorage.getItem('userId'); 

    // Get all necessary DOM elements
    const logoutBtn = document.getElementById('logoutBtn');
    const profileDisplay = document.getElementById('profileDisplay');
    const editProfileFormContainer = document.getElementById('editProfileFormContainer');
    const profileForm = document.getElementById('profileForm');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const profileMessage = document.getElementById('profileMessage');
    const userPostsContainer = document.getElementById('userPosts');
    const noUserPostsMessage = document.getElementById('noUserPostsMessage');

    // Profile Display Elements (for showing current profile data)
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profileBio = document.getElementById('profileBio');
    const profileLocation = document.getElementById('profileLocation');
    const profileJoinedDate = document.getElementById('profileJoinedDate');

    // Profile Form Elements (for editing profile data)
    const bioInput = document.getElementById('bio');
    const locationInput = document.getElementById('location');
    const youtubeInput = document.getElementById('youtube');
    const twitterInput = document.getElementById('twitter');
    const facebookInput = document.getElementById('facebook');
    const linkedinInput = document.getElementById('linkedin');
    const instagramInput = document.getElementById('instagram');


    if (!token) {
        console.warn('No token found on page load. Redirecting to login.');
        window.location.href = 'login.html';
        return; 
    }

    // --- Logout Functionality ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token'); // Clear token
            localStorage.removeItem('userId'); // Clear userId
            console.log('User logged out. Clearing localStorage and redirecting to login.');
            window.location.href = 'login.html'; // Redirect to login page
        });
    }

    // --- Fetch and Display Profile ---
  
    const fetchProfile = async (currentToken, currentUserId) => {
        console.log('DEBUG (profile.js): Token in fetchProfile (from argument):', currentToken ? 'PRESENT' : 'MISSING');
        console.log('DEBUG (profile.js): userId in fetchProfile (from argument):', currentUserId ? 'PRESENT' : 'MISSING');

        if (!currentToken) {
            console.error('Authentication token is null or undefined when trying to fetch profile. Redirecting to login.');
            window.location.href = 'login.html';
            return;
        }

        try {
            // --- Fetch user details (username, email) from auth/user endpoint ---
            const userResponse = await fetch('http://localhost:3000/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            const userText = await userResponse.text();
            try {
                const userData = JSON.parse(userText);

                if (!userResponse.ok) {
                    throw new Error(userData.message || 'Failed to fetch user data');
                }

                profileUsername.textContent = userData.username;
                profileEmail.textContent = userData.email;
                profileJoinedDate.textContent = new Date(userData.createdAt).toLocaleDateString();

            } catch (jsonError) {
                console.error('API call to /api/auth/user returned HTML instead of JSON:', userText);
                throw new Error(`Expected JSON from /api/auth/user, got HTML. Status: ${userResponse.status}. Raw response: ${userText.substring(0, 200)}...`);
            }

            // --- Fetch profile details from profile/me endpoint ---
            const profileResponse = await fetch('http://localhost:3000/api/profile/me', {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            const profileText = await profileResponse.text();
            try {
                const profileData = JSON.parse(profileText);

                if (profileResponse.ok) {
                    profileBio.textContent = profileData.bio || 'Not provided';
                    profileLocation.textContent = profileData.location || 'Not provided';

                    // Populate the edit form fields
                    bioInput.value = profileData.bio || '';
                    locationInput.value = profileData.location || '';

                    youtubeInput.value = profileData.social?.youtube || '';
                    twitterInput.value = profileData.social?.twitter || '';
                    facebookInput.value = profileData.social?.facebook || '';
                    linkedinInput.value = profileData.social?.linkedin || '';
                    instagramInput.value = profileData.social?.instagram || '';

                } else if (profileResponse.status === 404) {
                    // Specific handling for 404 if profile doesn't exist yet
                    profileBio.textContent = 'No profile created yet.';
                    profileLocation.textContent = 'Not provided';
                    profileMessage.textContent = 'Create your profile..!';
                    profileMessage.style.color = 'green';
                } else {
                   
                    throw new Error(profileData.message || `Failed to fetch profile. Status: ${profileResponse.status}`);
                }
            } catch (jsonError) {
               
                console.error('API call to /api/profile/me returned invalid JSON or HTML:', profileText);
                throw new Error(`Expected JSON from /api/profile/me, got invalid content. Status: ${profileResponse.status}. Raw response: ${profileText.substring(0, 200)}...`);
            }

        } catch (error) {
           
            console.error('Error in fetchProfile:', error);
            profileMessage.textContent = `Error fetching profile: ${error.message}. Please ensure backend is running and routes are correct.`;
            profileMessage.style.color = 'red';
        }
    };

    // --- Fetch and Display User's Posts ---
    const fetchUserPosts = async (currentToken, currentUserId) => {
        try {
            userPostsContainer.innerHTML = ''; 
            noUserPostsMessage.style.display = 'none'; 

           
            if (!currentToken || !currentUserId) {
                console.warn('Token or userId missing for fetching user posts. Redirecting.');
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch(`http://localhost:3000/api/posts`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            const responseText = await response.text();
            let posts;
            try {
                posts = JSON.parse(responseText); 
            } catch (jsonError) {
                console.error('API call to /api/posts returned HTML instead of JSON:', responseText);
                throw new Error(`Expected JSON from /api/posts, got HTML. Status: ${response.status}. Raw response: ${responseText.substring(0, 200)}...`);
            }

            if (!response.ok) {
                throw new Error(posts.message || `Failed to fetch posts. Status: ${response.status}`);
            }

           
            const userSpecificPosts = posts.filter(post => post.user && post.user._id === currentUserId);

            if (userSpecificPosts.length === 0) {
                noUserPostsMessage.style.display = 'block'; 
            } else {
                userSpecificPosts.forEach(post => {
                    const postCard = document.createElement('div');
                    postCard.className = 'post-card';
                    postCard.setAttribute('data-post-id', post._id);

                    let imageUrlHtml = '';
                    if (post.imageUrl) {
                        imageUrlHtml = `<img src="${post.imageUrl}" alt="Post Image">`;
                    }

                    postCard.innerHTML = `
                        <h3>@${post.user ? post.user.username : 'Unknown'}</h3>
                        ${imageUrlHtml}
                        <p>${post.text}</p>
                        <small>${new Date(post.date).toLocaleDateString()}</small>
                        <div class="post-actions">
                            <span>Likes: ${post.likes.length}</span>
                            <button class="like-btn ${post.likes.some(like => like.user === currentUserId) ? 'liked' : ''}" data-post-id="${post._id}">
                                ${post.likes.some(like => like.user === currentUserId) ? 'Unlike' : 'Like'}
                            </button>
                            ${post.user && post.user._id === currentUserId ? `<button class="delete-btn" data-post-id="${post._id}">Delete</button>` : ''}
                        </div>
                        <div class="comments-section">
                            <h4>Comments (${post.comments.length})</h4>
                            <div class="comments-list">
                                ${post.comments.map(comment => `
                                    <div class="comment-item">
                                        <strong>${comment.username || 'Anonymous'}</strong>
                                        <p>${comment.text}</p>
                                        <small>${new Date(comment.date).toLocaleDateString()}</small>
                                        ${comment.user === currentUserId ? `<button class="delete-comment-btn" data-post-id="${post._id}" data-comment-id="${comment._id}">x</button>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                            <form class="comment-form" data-post-id="${post._id}">
                                <input type="text" class="comment-input" placeholder="Add a comment..." required>
                                <button type="submit">Comment</button>
                            </form>
                        </div>
                    `;
                    userPostsContainer.appendChild(postCard);
                });
                attachPostEventListeners(); 
            }
        } catch (error) {
            console.error('Error in fetchUserPosts:', error);
            userPostsContainer.innerHTML = `<p class="message" style="color:red; text-align: center;">Error loading posts: ${error.message}</p>`;
        }
    };


    // --- Event Listeners for Edit/Cancel Profile Buttons ---
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            profileDisplay.style.display = 'none';
            editProfileFormContainer.style.display = 'block';
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editProfileFormContainer.style.display = 'none';
            profileDisplay.style.display = 'block';
            profileMessage.textContent = ''; 
            profileMessage.style.color = '';
        });
    }

    // --- Handle Profile Form Submission (Create/Update Profile) ---
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentToken = localStorage.getItem('token'); 
            console.log('DEBUG (profile.js): Token on profile form submission:', currentToken ? 'PRESENT' : 'MISSING');

            if (!currentToken) {
                alert('You are not authenticated. Please log in again.');
                window.location.href = 'login.html';
                return;
            }

            // Collect form data
            const profileData = {
                bio: bioInput.value,
                location: locationInput.value,
                social: {
                    youtube: youtubeInput.value,
                    twitter: twitterInput.value,
                    facebook: facebookInput.value,
                    linkedin: linkedinInput.value,
                    instagram: instagramInput.value
                }
            };

            // Clean up empty social media fields
            for (const key in profileData.social) {
                if (!profileData.social[key]) {
                    delete profileData.social[key];
                }
            }
            if (Object.keys(profileData.social).length === 0) {
                delete profileData.social; 
            }

            try {
                const response = await fetch('http://localhost:3000/api/profile', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify(profileData),
                });

               
                const data = await response.json();

                if (response.ok) {
                    profileMessage.textContent = 'Profile updated successfully!';
                    profileMessage.style.color = 'green';
                   
                    editProfileFormContainer.style.display = 'none';
                    profileDisplay.style.display = 'block';
                    fetchProfile(token, userId); 
                } else {
                    profileMessage.textContent = data.message || (data.errors && data.errors[0] ? data.errors[0].msg : 'Failed to update profile.');
                    profileMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                profileMessage.textContent = 'Network error or invalid JSON response when updating profile. Check backend logs.';
                profileMessage.style.color = 'red';
            }
        });
    }

    // --- Delete Account Functionality ---
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            const currentToken = localStorage.getItem('token'); // Get token for this request
            if (!currentToken) {
                alert('You are not authenticated. Please log in again.');
                window.location.href = 'login.html';
                return;
            }

            if (confirm('Are you sure you want to delete your account? This will also delete all your posts and profile data. This cannot be undone!')) {
                try {
                    const response = await fetch('http://localhost:3000/api/profile', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${currentToken}`
                        }
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert(data.message);
                        localStorage.removeItem('token'); 
                        localStorage.removeItem('userId'); 
                        window.location.href = 'register.html'; 
                    } else {
                        alert(data.message || 'Failed to delete account.');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('Network error. Could not delete account.');
                }
            }
        });
    }

    // --- Event Listener for Like/Comment/Delete Buttons on Posts ---
    const attachPostEventListeners = () => {
        // Like/Unlike button
        document.querySelectorAll('.like-btn').forEach(button => {
            button.onclick = async (event) => {
                const postId = event.target.dataset.postId;
                const url = `http://localhost:3000/api/posts/like/${postId}`;
                const currentToken = localStorage.getItem('token'); // Re-get for this specific event type

                if (!currentToken) {
                    alert('Please log in to like/unlike posts.');
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${currentToken}`
                        }
                    });
                    const data = await response.json();

                    if (response.ok) {
                        fetchUserPosts(token, userId); // Re-fetch posts to update like counts and button state, pass token/userId
                    } else {
                        alert(data.message || 'Failed to like/unlike post.');
                    }
                } catch (error) {
                    console.error('Error liking/unliking post:', error);
                    alert('Network error. Could not like/unlike post.');
                }
            };
        });

        // Delete Post button
        document.querySelectorAll('.delete-btn').forEach(button => {
            const postId = button.dataset.postId;
            const currentToken = localStorage.getItem('token');
            const currentUserId = localStorage.getItem('userId'); 

            button.onclick = async () => {
                if (confirm('Are you sure you want to delete this post?')) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${currentToken}`
                            }
                        });
                        const data = await response.json();

                        if (response.ok) {
                            alert(data.message);
                            fetchUserPosts(token, userId); // Re-fetch to update the list, pass token/userId
                        } else {
                            alert(data.message || 'Failed to delete post.');
                        }
                    } catch (error) {
                        console.error('Error deleting post:', error);
                        alert('Network error. Could not delete post.');
                    }
                }
            };
        });

        // Comment form submission
        document.querySelectorAll('.comment-form').forEach(form => {
            form.onsubmit = async (event) => {
                event.preventDefault();
                const postId = event.target.dataset.postId;
                const commentInput = event.target.querySelector('.comment-input');
                const text = commentInput.value;
                const currentToken = localStorage.getItem('token'); // Re-get for this specific event type

                if (!currentToken) {
                    alert('Please log in to comment.');
                    window.location.href = 'login.html';
                    return;
                }

                if (!text.trim()) {
                    alert('Comment cannot be empty.');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/api/posts/comment/${postId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({ text })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        commentInput.value = ''; 
                        fetchUserPosts(token, userId); 
                    } else {
                        alert(data.message || 'Failed to add comment.');
                    }
                } catch (error) {
                    console.error('Error adding comment:', error);
                    alert('Network error. Could not add comment.');
                }
            };
        });

        // Delete Comment button
        document.querySelectorAll('.delete-comment-btn').forEach(button => {
            button.onclick = async (event) => {
                const postId = event.target.dataset.postId;
                const commentId = event.target.dataset.commentId;
                const currentToken = localStorage.getItem('token'); 
                const currentUserId = localStorage.getItem('userId'); 

                if (!currentToken) {
                    alert('Please log in to delete comments.');
                    window.location.href = 'login.html';
                    return;
                }

                if (confirm('Are you sure you want to delete this comment?')) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/posts/comment/${postId}/${commentId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${currentToken}`
                            }
                        });
                        const data = await response.json();

                        if (response.ok) {
                            alert(data.message || 'Comment deleted.');
                            fetchUserPosts(token, userId); 
                        } else {
                            alert(data.message || 'Failed to delete comment.');
                        }
                    } catch (error) {
                        console.error('Error deleting comment:', error);
                        alert('Network error. Could not delete comment.');
                    }
                }
            };
        });
    }; 

  
    fetchProfile(token, userId);
    fetchUserPosts(token, userId);
});