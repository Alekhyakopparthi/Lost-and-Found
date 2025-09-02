const API = "http://localhost:5000"; 

/* ---------------- AUTH ---------------- */
function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

/* ---------------- SIGNUP ---------------- */
async function signup() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    alert("Signup successful! Please login.");
  } else {
    alert(data.error || "Signup failed");
  }
}

/* ---------------- LOGIN ---------------- */
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(API + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", username);
    window.location.href = "dashboard.html";
  } else {
    alert(data.error || "Login failed");
  }
}

/* ---------------- UPLOAD ---------------- */
async function upload(type) {
  const input = document.getElementById(type + "File");
  const file = input.files[0];
  if (!file) return alert("Choose a file!");

  const title = document.getElementById(type + "Title").value;
  const description = document.getElementById(type + "Desc").value;
  const contactName = document.getElementById(type + "ContactName").value;
  const contactPhone = document.getElementById(type + "ContactPhone").value;

  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);
  formData.append("userId", localStorage.getItem("userId"));
  formData.append("title", title);
  formData.append("description", description);
  formData.append("contact_name", contactName);
  formData.append("contact_phone", contactPhone);

  const res = await fetch(API + "/items/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (data.success) {
    // Reset form after upload
    document.getElementById(type + "Title").value = "";
    document.getElementById(type + "Desc").value = "";
    document.getElementById(type + "ContactName").value = "";
    document.getElementById(type + "ContactPhone").value = "";
    document.getElementById(type + "File").value = "";

    alert("Upload successful!");
  } else {
    alert(data.error || "Upload failed!");
  }
}

/* ---------------- LOAD ITEMS ---------------- */
async function loadItems() {
  if (!window.location.pathname.includes("dashboard.html")) return;

  // Load Lost Items
  const lostRes = await fetch(API + "/items/lost");
  const lostData = await lostRes.json();
  document.getElementById("lostGallery").innerHTML =
    lostData.map(i => `
      <div style="margin:10px; display:inline-block; text-align:center; border:1px solid #ccc; border-radius:8px; padding:10px; width:200px;">
        <img src="${API}${i.image_path}" alt="Lost Item" width="150"><br>
        <strong>${i.title || "No title"}</strong><br>
        <p>${i.description || ""}</p>
        <p><b>Contact:</b> ${i.contact_name || "N/A"}</p>
        <p><b>Phone:</b> ${i.contact_phone || "N/A"}</p>
        ${i.uploaded_by == localStorage.getItem("userId") 
          ? `<button onclick="deleteItem(${i.id})" style="background:red; color:white; border:none; padding:5px 10px; margin-top:5px; cursor:pointer; border-radius:4px;">Delete</button>` 
          : ""}
      </div>
    `).join("");

  // Load Found Items
  const foundRes = await fetch(API + "/items/found");
  const foundData = await foundRes.json();
  document.getElementById("foundGallery").innerHTML =
    foundData.map(i => `
      <div style="margin:10px; display:inline-block; text-align:center; border:1px solid #ccc; border-radius:8px; padding:10px; width:200px;">
        <img src="${API}${i.image_path}" alt="Found Item" width="150"><br>
        <strong>${i.title || "No title"}</strong><br>
        <p>${i.description || ""}</p>
        <p><b>Contact:</b> ${i.contact_name || "N/A"}</p>
        <p><b>Phone:</b> ${i.contact_phone || "N/A"}</p>
        ${i.uploaded_by == localStorage.getItem("userId") 
          ? `<button onclick="deleteItem(${i.id})" style="background:red; color:white; border:none; padding:5px 10px; margin-top:5px; cursor:pointer; border-radius:4px;">Delete</button>` 
          : ""}
      </div>
    `).join("");
}

/* ---------------- DELETE ---------------- */
async function deleteItem(itemId) {
  const confirmDel = confirm("Are you sure you want to delete this item?");
  if (!confirmDel) return;

  const res = await fetch(API + "/items/" + itemId, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: localStorage.getItem("userId") })
  });

  const data = await res.json();
  if (data.success) {
    alert("Item deleted successfully");
    location.reload();
  } else {
    alert(data.error || "Delete failed");
  }
}

window.onload = loadItems;
