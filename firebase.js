import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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

let isSubmitting = false;

// Function to upload PDF to Firebase Storage
async function uploadPDF(pdfBlob, fileName) {
  try {
    const storageRef = ref(storage, `signed_pdfs/${fileName}`);
    await uploadBytes(storageRef, pdfBlob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}

// Function to generate PDF
async function generatePDF(formData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.text("Student Authorization Form", 10, 10);
  doc.setFont("helvetica", "normal");

  let y = 20;
  for (const [key, value] of Object.entries(formData)) {
    doc.text(`${key.replace("_", " ")}: ${value}`, 10, y);
    y += 10;
  }

  if (formData.signature) {
    doc.addImage(formData.signature, "PNG", 10, y, 80, 40);
  }

  return doc.output("blob");
}

// Function to handle form submission
export async function handleFormSubmission(signaturePad) {
  if (isSubmitting) return;
  isSubmitting = true;

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
    signature: signaturePad.toDataURL("image/png"),
  };

  if (
    !formData.student_name ||
    !formData.dob ||
    !formData.guardian1_name ||
    !formData.guardian1_phone
  ) {
    alert("Please fill in all required fields.");
    isSubmitting = false;
    return;
  }

  const pdfBlob = await generatePDF(formData);
  const fileName = `signed_document_${Date.now()}.pdf`;

  const pdfURL = await uploadPDF(pdfBlob, fileName);

  if (pdfURL) {
    alert("Form submitted successfully!");
    console.log("PDF Uploaded:", pdfURL);
    location.reload();
  } else {
    alert("Error submitting form.");
  }

  isSubmitting = false;
}

// Signature Pad setup
const canvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(canvas, {
  backgroundColor: "white",
  penColor: "black",
});

// **Resize Canvas Correctly**
function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear(); // Clears signature to avoid distortion
}

// Call resize on page load and window resize
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

document
  .getElementById("clear-signature")
  .addEventListener("click", () => signaturePad.clear());

document
  .getElementById("permissionForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    if (signaturePad.isEmpty()) {
      alert("Please sign the form before submitting.");
      return;
    }

    await handleFormSubmission(signaturePad);
  });

