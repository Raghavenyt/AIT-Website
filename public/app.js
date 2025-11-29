const toolsListEl = document.getElementById("tools-list");
const toolsCountEl = document.getElementById("tools-count");
const emptyStateEl = document.getElementById("empty-state");
const searchInputEl = document.getElementById("search-input");
const categoryFilterEl = document.getElementById("category-filter");
const searchBtnEl = document.getElementById("search-btn");
const addToolFormEl = document.getElementById("add-tool-form");
const toolNameEl = document.getElementById("tool-name");
const toolCategoryEl = document.getElementById("tool-category");
const toolWebsiteEl = document.getElementById("tool-website");
const toolDescriptionEl = document.getElementById("tool-description");
const formMessageEl = document.getElementById("form-message");

document.getElementById("year").textContent = new Date().getFullYear();

async function fetchTools() {
  const q = searchInputEl.value.trim();
  const category = categoryFilterEl.value;
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (category && category !== "All") params.append("category", category);
  const url = "/api/tools" + (params.toString() ? `?${params.toString()}` : "");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch tools");
    const tools = await res.json();
    renderTools(tools);
  } catch (err) {
    console.error(err);
    toolsListEl.innerHTML = "";
    emptyStateEl.hidden = false;
    emptyStateEl.textContent = "Error loading tools. Make sure the backend is running.";
    toolsCountEl.textContent = "0 tools";
  }
}

function renderTools(tools) {
  toolsListEl.innerHTML = "";
  if (!tools.length) {
    emptyStateEl.hidden = false;
    emptyStateEl.textContent = "No tools found. Try a different search or category.";
    toolsCountEl.textContent = "0 tools";
    return;
  }
  emptyStateEl.hidden = true;
  toolsCountEl.textContent = tools.length === 1 ? "1 tool" : `${tools.length} tools`;
  tools.forEach(tool => {
    const card = document.createElement("article");
    card.className = "tool-card";
    card.innerHTML = `
      <div class="tool-header">
        <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
        <span class="tool-category">${escapeHtml(tool.category)}</span>
      </div>
      <p class="tool-description">${escapeHtml(tool.description)}</p>
      <p class="tool-link"><a href="${escapeAttribute(tool.website)}" target="_blank" rel="noopener noreferrer">Visit website →</a></p>
    `;
    toolsListEl.appendChild(card);
  });
}

searchBtnEl.addEventListener("click", fetchTools);
searchInputEl.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); fetchTools(); }});
categoryFilterEl.addEventListener("change", fetchTools);

addToolFormEl.addEventListener("submit", async e => {
  e.preventDefault();
  formMessageEl.textContent = "";
  formMessageEl.className = "form-message";
  const name = toolNameEl.value.trim();
  const category = toolCategoryEl.value;
  const website = toolWebsiteEl.value.trim();
  const description = toolDescriptionEl.value.trim();
  if (!name || !category || !website || !description) {
    formMessageEl.textContent = "Please fill in all fields.";
    formMessageEl.classList.add("error");
    return;
  }
  try {
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, website, description })
    });
    if (!res.ok) {
      const data = await res.json().catch(()=>({}));
      throw new Error(data.error || "Failed to add tool");
    }
    const newTool = await res.json();
    formMessageEl.textContent = `Tool "${newTool.name}" added successfully!`;
    formMessageEl.classList.add("success");
    addToolFormEl.reset();
    fetchTools();
  } catch (err) {
    console.error(err);
    formMessageEl.textContent = err.message || "Something went wrong.";
    formMessageEl.classList.add("error");
  }
});

function escapeHtml(str){
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escapeAttribute(str){
  return String(str).replace(/"/g,"&quot;");
}

// initial load
fetchTools();
