async function registration() {
    const formData = new FormData();
    formData.append("email", document.getElementById("email").value);
    formData.append("fname", document.getElementById("fname").value);
    formData.append("lname", document.getElementById("lname").value);
    formData.append("user", document.getElementById("user").value);
    formData.append("pwd", document.getElementById("pwd").value);

    try {
        const response = await fetch("/register", {
            method: "POST",
            body: formData,
        });
        console.log(await response.json());
    } catch (error) {
        console.error("Error sending data:", error);
    }
}
