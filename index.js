let currentUser = null;

// 🔐 Login user
async function loginUser(email, password) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (res.ok) {
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); // ✅ Save to localStorage

    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('loggedInUser').innerText = `Logged in as: ${currentUser.fullName} (${currentUser.email})`;
    loadPosts();
  } else {
    alert('Login failed: ' + data.error);
  }
}

// 📰 Load posts and show UI
async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    const postList = document.getElementById('postList');
    postList.innerHTML = '';

    posts.forEach(post => {
      const isOwnPost = currentUser && post.user._id === currentUser._id;
      const isFollowing = currentUser && currentUser.following.includes(post.user._id);

      const postEl = document.createElement('div');
      postEl.className = 'post';

      postEl.innerHTML = `
        <strong><a href="#" onclick="viewProfile('${post.user._id}')">${post.user.fullName}</a> (@${post.user.username})</strong>
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

// ❤️ Like post
async function likePost(postId) {
  await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser._id })
  });
  loadPosts();
}

// 💬 Add comment
async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value;
  if (!text) return;

  await fetch(`/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, user: currentUser._id, post: postId })
  });

  input.value = '';
  loadPosts();
}

// 🔁 Toggle follow/unfollow
async function toggleFollow(targetUserId, button) {
  const isFollowing = currentUser.following.includes(targetUserId);
  const url = `/api/users/${targetUserId}/${isFollowing ? 'unfollow' : 'follow'}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser._id })
  });

  const data = await res.json();
  alert(data.message);

  // Update current user data from backend
  const updatedRes = await fetch(`/api/users/${currentUser._id}`);
  currentUser = await updatedRes.json();
  localStorage.setItem('currentUser', JSON.stringify(currentUser)); // ✅ Save new state

  loadPosts();
}

// 👤 View user profile
async function viewProfile(userId) {
  const res = await fetch(`/api/users/${userId}`);
  const user = await res.json();

  alert(`👤 Profile Info:\n\nName: ${user.fullName}\nUsername: ${user.username}\nEmail: ${user.email}\nFollowers: ${user.followers.length}\nFollowing: ${user.following.length}`);
}

// 🚪 Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser'); // ✅ Clear saved user
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('app').style.display = 'none';
}

// 🔐 Handle login form
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  loginUser(email, password);
});

// 📝 Handle post form
document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('postContent').value;
  if (!content) return;

  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: currentUser._id, content })
  });

  document.getElementById('postContent').value = '';
  loadPosts();
});

// ✅ On page load, restore logged-in user from localStorage
window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('loggedInUser').innerText = `Logged in as: ${currentUser.fullName} (${currentUser.email})`;
    loadPosts();
  }
});
