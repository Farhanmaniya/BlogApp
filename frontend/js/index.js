// ─── Blogify Homepage JS ──────────────────────────────────────────────────
let currentPage = 1;
let currentCategory = "";
const LIMIT = 6;

// ── Format date nicely ──────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Load Categories for filter buttons ─────────────────────────────────
async function loadCategories() {
  try {
    const res = await apiFetch("/api/categories");
    const data = await res.json();
    const wrap = document.getElementById("categoryFilter");

    // "All" button
    const allBtn = document.createElement("button");
    allBtn.className = "btn-nav btn-ghost active-cat";
    allBtn.style.cssText = "font-size:0.78rem; padding:0.35rem 0.9rem;";
    allBtn.textContent = "All";
    allBtn.onclick = () => {
      currentCategory = "";
      currentPage = 1;
      loadPosts();
      setActiveCategory(allBtn);
    };
    wrap.appendChild(allBtn);

    if (data.categories) {
      data.categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.className = "btn-nav btn-ghost";
        btn.style.cssText = "font-size:0.78rem; padding:0.35rem 0.9rem;";
        btn.textContent = cat.name;
        btn.onclick = () => {
          currentCategory = cat._id;
          currentPage = 1;
          loadPosts();
          setActiveCategory(btn);
        };
        wrap.appendChild(btn);
      });
    }
  } catch (e) {
    // Categories failed silently — not critical
  }
}

function setActiveCategory(activeBtn) {
  document
    .querySelectorAll("#categoryFilter button")
    .forEach((b) => b.classList.remove("active-cat"));
  activeBtn.classList.add("active-cat");
}

// ── Load Posts ──────────────────────────────────────────────────────────
async function loadPosts() {
  const grid = document.getElementById("postsGrid");
  grid.innerHTML = '<div class="loading">Loading posts...</div>';

  try {
    let url = `/api/posts?page=${currentPage}&limit=${LIMIT}`;
    if (currentCategory) url += `&category=${currentCategory}`;

    const res = await apiFetch(url);
    const data = await res.json();

    if (!data.posts || data.posts.length === 0) {
      grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <h3>No posts yet</h3>
                    <p>Check back soon for new articles.</p>
                </div>`;
      return;
    }

    grid.innerHTML = data.posts
      .map(
        (post) => `
            <a href="post.html?slug=${post.slug}" class="post-card">
                <div class="post-card-img">
                    ${
                      post.coverImage
                        ? `<img src="${post.coverImage}" alt="${post.title}">`
                        : "📝"
                    }
                </div>
                <div class="post-card-body">
                    <div class="post-card-cat">${post.category?.name || "General"}</div>
                    <div class="post-card-title">${post.title}</div>
                    <div class="post-card-excerpt">${post.excerpt || post.content?.substring(0, 120) + "..." || ""}</div>
                    <div class="post-card-meta">
                        <span>${formatDate(post.createdAt)}</span>
                        <span>${post.views || 0} views</span>
                    </div>
                    <div class="read-more">Read More →</div>
                </div>
            </a>
        `,
      )
      .join("");

    // Render pagination
    renderPagination(data.totalPages || 1, data.currentPage || 1);

    // Load featured (first post on first page)
    if (currentPage === 1 && !currentCategory) {
      renderFeatured(data.posts[0]);
    }
  } catch (e) {
    grid.innerHTML = `<div class="error-msg" style="grid-column:1/-1">Failed to load posts. Make sure the backend is running.</div>`;
  }
}

// ── Featured Post ───────────────────────────────────────────────────────
function renderFeatured(post) {
  if (!post) return;
  document.getElementById("featuredPost").innerHTML = `
        <a href="post.html?slug=${post.slug}" class="hero-featured">
            <div class="hero-featured-img">
                ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}">` : "📝"}
            </div>
            <div class="hero-featured-body">
                <div class="hero-featured-cat">Featured · ${post.category?.name || "General"}</div>
                <div class="hero-featured-title">${post.title}</div>
                <div class="hero-featured-meta">${formatDate(post.createdAt)} · ${post.views || 0} views</div>
            </div>
        </a>`;
}

// ── Pagination ──────────────────────────────────────────────────────────
function renderPagination(totalPages, current) {
  const wrap = document.getElementById("pagination");
  if (totalPages <= 1) {
    wrap.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" onclick="goPage(${current - 1})" ${current === 1 ? "disabled" : ""}>←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === current ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${current + 1})" ${current === totalPages ? "disabled" : ""}>→</button>`;
  wrap.innerHTML = html;
}

function goPage(page) {
  currentPage = page;
  loadPosts();
  document.getElementById("latest").scrollIntoView({ behavior: "smooth" });
}

// ── Init ────────────────────────────────────────────────────────────────
loadCategories();
loadPosts();
