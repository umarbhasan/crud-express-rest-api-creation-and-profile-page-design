document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (token && window.location.pathname === '/login.html') {
        window.location.href = "/profile.html";
        return;
    }
    if (!token && window.location.pathname === '/profile.html') {
        window.location.href = "/login.html";
        return;
    }

    const registrationForm = document.querySelector("#register-form");
    const loginForm = document.querySelector("#login-form");

    const profileForm = document.getElementById("profile-form");
    const editBtn = document.getElementById("edit-btn");
    const updateBtn = document.getElementById("update-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const imageForm = document.getElementById("image-form");
    const profileImageInput = document.getElementById("profile-image");
    const profileImageDisplay = document.getElementById("profile-image-display");
    const passwordForm = document.getElementById("password-form");

// Fetch profile data
async function fetchProfile() {
    try {
        const response = await fetch("/api/profile", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const user = await response.json();
            document.getElementById("first-name").value = user.first_name;
            document.getElementById("last-name").value = user.last_name;
            document.getElementById("gender").value = user.gender;
            document.getElementById("dob").value = user.date_of_birth;
            document.getElementById("email").value = user.email;
            document.getElementById("password").value = user.password;

            // Display profile image if it exists
            if (user.profile_image_url) {
                const profileImageDisplay = document.getElementById("profile-image-display");
                profileImageDisplay.src = `/${user.profile_image_url}`;
                profileImageDisplay.style.display = "block";
            }
        } else {
            alert("Failed to fetch profile");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("An error occurred while fetching the profile. Please try again.");
    }
}



    if (profileForm) {
        fetchProfile();

        editBtn.addEventListener("click", () => {
            profileForm.querySelectorAll("input, select").forEach(input => input.disabled = false);
            editBtn.style.display = "none";
            deleteBtn.style.display = "none";
            updateBtn.style.display = "inline-block";
            imageForm.style.display = "block";
            passwordForm.style.display = "block";
            profileImageDisplay.style.display = "none";
        });

        profileForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData(profileForm);
            const payload = Object.fromEntries(formData.entries());

            try {
                const response = await fetch("/api/profile", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (response.ok) {
                    alert("Profile updated successfully!");
                    window.location.reload();  // Reload the entire page
                } else {
                    const result = await response.json();
                    alert(result.message);
                }
            } catch (error) {
                console.error("Error updating profile:", error);
                alert("An error occurred while updating the profile. Please try again.");
            }
        });

        deleteBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                try {
                    const response = await fetch("/api/profile", {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        alert("Account deleted successfully!");
                        localStorage.removeItem("token");
                        window.location.href = "/register.html";
                    } else {
                        const result = await response.json();
                        alert(result.message);
                    }
                } catch (error) {
                    console.error("Error deleting account:", error);
                    alert("An error occurred while deleting the account. Please try again.");
                }
            }
        });

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
        });

        imageForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const formData = new FormData();
            formData.append("profile_image", profileImageInput.files[0]);

            try {
                const response = await fetch("/api/profile/image", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: formData,
                });
                if (response.ok) {
                    alert("Profile image uploaded successfully!");
                    window.location.reload();  // Reload the entire page after image upload
                } else {
                    const result = await response.json();
                    alert(result.message);
                }
            } catch (error) {
                console.error("Error uploading profile image:", error);
                alert("An error occurred while uploading the profile image. Please try again.");
            }
        });

        passwordForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const newPassword = document.getElementById("new-password").value;

            try {
                const response = await fetch("/api/profile/password", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ newPassword }),
                });
                if (response.ok) {
                    alert("Password updated successfully!");
                    window.location.reload();  // Reload the entire page after password update
                } else {
                    const result = await response.json();
                    alert(result.message);
                }
            } catch (error) {
                console.error("Error updating password:", error);
                alert("An error occurred while updating the password. Please try again.");
            }
        });
    }

    if (registrationForm) {
        registrationForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const first_name = document.querySelector("#first-name").value;
            const last_name = document.querySelector("#last-name").value;
            const gender = document.querySelector("#gender").value;
            const date_of_birth = document.querySelector("#dob").value;
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;
            const retype_password = document.querySelector("#retype-password").value;

            if (password !== retype_password) {
                alert("Passwords do not match");
                return;
            }

            const profile_image = document.querySelector("#profile-image").files[0];
            const formData = new FormData();
            formData.append("first_name", first_name);
            formData.append("last_name", last_name);
            formData.append("gender", gender);
            formData.append("date_of_birth", date_of_birth);
            formData.append("email", email);
            formData.append("password", password);
            if (profile_image) {
                formData.append("profile_image", profile_image);
            }

            try {
                const response = await fetch("/api/register", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    alert("Registration successful!");
                    window.location.href = "/login.html";
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }

    // Load remembered email
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        document.querySelector("#login-email").value = rememberedEmail;
        document.querySelector("#remember-me").checked = true;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.querySelector("#login-email").value;
            const password = document.querySelector("#login-password").value;
            const rememberMe = document.querySelector("#remember-me").checked;

            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });
                const result = await response.json();
                if (response.ok) {
                    localStorage.setItem("token", result.token);
                    if (rememberMe) {
                        localStorage.setItem("rememberedEmail", email);
                    } else {
                        localStorage.removeItem("rememberedEmail");
                    }
                    alert("Login successful!");
                    window.location.href = "/profile.html";
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }
});
