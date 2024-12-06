document.addEventListener("DOMContentLoaded", () => {
    const blogList = document.getElementById("blog-list");
    const blogForm = document.getElementById("blog-form");
  
    // Load blogs from localStorage
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];
  
    const saveBlogs = () => {
      localStorage.setItem("blogs", JSON.stringify(blogs));
    };
  
    const renderBlogs = () => {
      blogList.innerHTML = blogs
        .map(
          (blog, index) => `
        <li>
          <h3>${blog.title}</h3>
          <p><strong>Category:</strong> ${blog.category}</p>
          <p><strong>Tags:</strong> ${blog.tags.join(", ")}</p>
          <button class="edit" onclick="editBlog(${index})">Edit</button>
          <button onclick="deleteBlog(${index})">Delete</button>
        </li>
      `
        )
        .join("");
    };
  
    blogForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("blog-title").value;
      const category = document.getElementById("blog-category").value;
      const tags = document.getElementById("blog-tags").value.split(",").map(tag => tag.trim());
  
      blogs.push({ title, category, tags });
      saveBlogs(); // Save to localStorage
      blogForm.reset();
      renderBlogs();
    });
  
    window.deleteBlog = (index) => {
      blogs.splice(index, 1);
      saveBlogs(); // Update localStorage
      renderBlogs();
    };
  
    window.editBlog = (index) => {
      const blog = blogs[index];
      document.getElementById("blog-title").value = blog.title;
      document.getElementById("blog-category").value = blog.category;
      document.getElementById("blog-tags").value = blog.tags.join(", ");
      blogs.splice(index, 1);
      saveBlogs(); // Update localStorage
      renderBlogs();
    };
  
    // Initial render
    renderBlogs();
  });
  