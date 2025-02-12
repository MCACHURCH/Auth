// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIrzWiMokd0BA2GvA9NEqCOW9SqKX84wM",
  authDomain: "authorization-861a9.firebaseapp.com",
  projectId: "authorization-861a9",
  storageBucket: "authorization-861a9.firebasestorage.app",
  messagingSenderId: "618751378522",
  appId: "1:618751378522:web:769afd53fc31f39362c463",
  measurementId: "G-5P08NL17QD",
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Function to upload PDF to Firebase Storage
async function uploadPDF(pdfBlob, fileName) {
  try {
    const storageRef = ref(storage, `signed_pdfs/${fileName}`);
    await uploadBytes(storageRef, pdfBlob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Upload Error:", error);
  }
}

// Function to handle form submission
export async function handleFormSubmission(signaturePad) {
  const formData = {
    student_name: document.getElementById("student_name").value,
    dob: document.getElementById("dob").value,
    guardian1_name: document.getElementById("guardian1_name").value,
    guardian1_phone: document.getElementById("guardian1_phone").value,
    guardian2_name: document.getElementById("guardian2_name").value || "N/A",
    guardian2_phone: document.getElementById("guardian2_phone").value || "N/A",
    emergency_name: document.getElementById("emergency_name").value,
    emergency_relationship: document.getElementById("emergency_relationship")
      .value,
    emergency_phone: document.getElementById("emergency_phone").value,
    medical_info: document.getElementById("medical_info").value || "None",
    signature_date: document.getElementById("signature_date").value,
    signature: signaturePad.toDataURL("image/png"), // Convert signature to image
  };

  if (
    !formData.student_name ||
    !formData.dob ||
    !formData.guardian1_name ||
    !formData.guardian1_phone
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  // Generate PDF with Signature
  const pdfBlob = await generatePDF(formData);
  const fileName = `signed_document_${Date.now()}.pdf`;

  // Upload PDF to Firebase
  const pdfURL = await uploadPDF(pdfBlob, fileName);

  if (pdfURL) {
    alert("Form submitted successfully!");
    console.log("PDF Uploaded:", pdfURL);
    location.reload(); // Refresh the page after successful submission
  } else {
    alert("Error submitting form.");
  }
}

// Function to generate PDF with signature
async function generatePDF(formData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.text("Student Authorization Form", 10, 10);
  doc.setFont("helvetica", "normal");
  doc.text(`Student Name: ${formData.student_name}`, 10, 20);
  doc.text(`Date of Birth: ${formData.dob}`, 10, 30);
  doc.text(`Parent Name: ${formData.guardian1_name}`, 10, 40);
  doc.text(`Parent Phone: ${formData.guardian1_phone}`, 10, 50);
  doc.text(`Parent Name: ${formData.guardian2_name}`, 10, 60);
  doc.text(`Parent Phone: ${formData.guardian2_phone}`, 10, 70);
  doc.text(`Emergency Contact: ${formData.emergency_name}`, 10, 80);
  doc.text(`Relationship: ${formData.emergency_relationship}`, 10, 90);
  doc.text(`Phone: ${formData.emergency_phone}`, 10, 100);
  doc.text(`Medical Info: ${formData.medical_info}`, 10, 110);
  doc.text(`Date Signed: ${formData.signature_date}`, 10, 120);

  // Add certification statement
  doc.text(
    "I hereby certify that the prior information is correct and give permission for the",
    10,
    130
  );
  doc.text(
    "listed student to participate in the event/activity specified above.",
    10,
    140
  );
  doc.text(
    "In case of an emergency, I give MCA staff permission to seek medical care.",
    10,
    150
  );

  // Add signature image
  if (formData.signature) {
    doc.addImage(formData.signature, "PNG", 10, 160, 80, 40);
  }

  return doc.output("blob");
}
const canvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "white",
  penColor: "black",
});

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
}

// Ensure the signature pad resizes correctly
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.getElementById("clear-signature").addEventListener("click", () => {
  signaturePad.clear();
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  if (signaturePad.isEmpty()) {
    alert("Please sign the form before submitting.");
    return;
  }

  try {
    await handleFormSubmission(signaturePad);
  } catch (error) {
    alert("There was an error submitting the form. Please try again.");
    console.error("Submission error:", error);
  }
});


