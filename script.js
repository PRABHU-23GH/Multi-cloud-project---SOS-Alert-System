import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Replace with the actual number OR prompt the user dynamically
const userPhoneNumber = "+917397598892";  
const awsApiUrl = "https://y0odshyhl8.execute-api.us-east-1.amazonaws.com/SOSAlert";

const statusLog = document.getElementById("statusLog");

// Function to send SOS alert
async function sendSOS() {
  const time = new Date().toLocaleTimeString();

  try {
    // 1️⃣ Save alert to Firestore
    await addDoc(collection(window.db, "alerts"), {
      from: userPhoneNumber,
      message: "🚨 It's an Emergency, Help me now please.",
      timestamp: serverTimestamp()
    });
    console.log("Alert saved to Firestore");

    // 2️⃣ Call AWS Lambda via API Gateway
    const response = await fetch(awsApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: userPhoneNumber })
    });

    const data = await response.json();
    console.log("Lambda response:", data);

    if (data.success) {
      Swal.fire({
        title: "🚨 SOS Alert Sent!",
        text: `Emergency alert sent from ${userPhoneNumber}`,
        icon: "success",
        confirmButtonText: "Stay Safe",
        confirmButtonColor: "#ff4d4d",
        background: "#1a1a40",
        color: "#fff"
      });
    } else {
      Swal.fire("❌ Failed", "Could not send alert via SMS", "error");
    }

  } catch (error) {
    console.error("Error sending SOS:", error);
    Swal.fire("❌ Error", "Something went wrong while sending SOS", "error");
  }
}

// Attach event listener to SOS button
document.getElementById("sosBtn").addEventListener("click", sendSOS);

// Real-time Firestore listener to display alerts
const q = query(collection(window.db, "alerts"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
  statusLog.innerHTML = ""; // clear old list
  snapshot.forEach((doc) => {
    const data = doc.data();
    const alertTime = data.timestamp?.toDate().toLocaleTimeString() || "⏳ Pending";
    const li = document.createElement("li");
    li.textContent = `📞 ${data.from} — ${data.message} at ${alertTime}`;
    statusLog.appendChild(li);
  });
});
