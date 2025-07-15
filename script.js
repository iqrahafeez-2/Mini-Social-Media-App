async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.className = 'post';

      const isOwnPost = currentUser && post.user._id === currentUser._id;
      const isFollowing = currentUser && currentUser.following.includes(post.user._id);

      // Create clickable profile link
      const userProfileLink = `<a href="profile.html?id=${post.user._id}">${post.user.fullName} (@${post.user.username})</a>`;

      postEl.innerHTML = `
        <p><strong>${userProfileLink}</strong></p>
        <p>${post.content}</p>
        <button onclick="likePost('${post._id}')">❤️ Like (${post.likes.length})</button>
        ${!isOwnPost && currentUser ? `
          <button onclick="toggleFollow('${post.user._id}', this)">
            ${isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        ` : ''}
        <div><strong>Comments:</strong></div>
        <div id="comments-${post._id}">
          ${post.comments.map(c => `<p><strong>${c.user.fullName}:</strong> ${c.text}</p>`).join('')}
        </div>
        <input placeholder="Add a comment..." id="comment-input-${post._id}" />
        <button onclick="addComment('${post._id}')">💬 Comment</button>
        <hr>
      `;

      postList.appendChild(postEl);
    });
  } catch (err) {
    console.error('Error loading posts:', err);
  }
}

async function toggleFollow(targetUserId, button) {
  if (!currentUser) return;

  const isFollowing = currentUser.following.includes(targetUserId);
  const url = `/api/users/${targetUserId}/${isFollowing ? 'unfollow' : 'follow'}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser._id })
  });

  const data = await res.json();
  alert(data.message);

  // Refresh user data from server
  const updatedUser = await fetch(`/api/users/${currentUser._id}`);
  const newUser = await updatedUser.json();
  currentUser = newUser;

  // Refresh posts to update UI
  loadPosts();
}
