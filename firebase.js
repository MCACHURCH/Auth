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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIrzWiMokd0BA2GvA9NEqCOW9SqKX84wM",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "authorization-861a9",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth();

// Sign in anonymously for Firebase Storage access
signInAnonymously(auth).catch((error) => console.error("Auth Error:", error));

// Function to generate PDF
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const studentName = document.getElementById("student_name").value;
  const dob = document.getElementById("dob").value;
  const studentAddress = document.getElementById("student_address").value;
  const guardian1Name = document.getElementById("guardian1_name").value;
  const guardian1Phone = document.getElementById("guardian1_phone").value;
  const guardian2Name = document.getElementById("guardian2_name").value;
  const guardian2Phone = document.getElementById("guardian2_phone").value;
  const emergencyContact = document.getElementById("emergency_name").value;
  const medicalInfo = document.getElementById("medical_info").value;
  const signatureDate = new Date().toLocaleDateString();

  pdf.setFontSize(12);
  pdf.text("Authorization Form - Snow Trails Tubing Trip", 20, 20);
  pdf.text(`Student Name: ${studentName}`, 20, 30);
  pdf.text(`DOB: ${dob}`, 20, 40);
  pdf.text(`Address: ${studentAddress}`, 20, 50);
  pdf.text(`Guardian 1: ${guardian1Name}, Phone: ${guardian1Phone}`, 20, 60);
  pdf.text(`Guardian 2: ${guardian2Name}, Phone: ${guardian2Phone}`, 20, 70);
  pdf.text(`Emergency Contact: ${emergencyContact}`, 20, 80);
  pdf.text(`Medical Info: ${medicalInfo}`, 20, 90);
  pdf.text(`Date Signed: ${signatureDate}`, 20, 100);

  pdf.text("Authorization for travel and medical care:", 20, 120);
  pdf.text(
    "I hereby certify that the prior information is correct and give permission",
    20,
    130
  );
  pdf.text(
    "for the listed student to participate in the event/activity specified above.",
    20,
    140
  );
  pdf.text(
    "In the case of an illness or medical emergency, I give MCA staff and",
    20,
    150
  );
  pdf.text(
    "volunteers permission to seek professional medical care for the student.",
    20,
    160
  );

  // Convert signature to image and add to PDF
  const signaturePad = document.getElementById("signature-pad");
  const signatureData = signaturePad.toDataURL("image/png");
  pdf.addImage(signatureData, "PNG", 20, 170, 100, 40);

  return pdf.output("blob");
}

// Function to upload PDF to Firebase
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

// Function to send email with PDF link
async function sendEmailWithPDF(pdfURL) {
  const emailData = {
    service_id: "service_ab6qkyh",
    template_id: "template_3mailqi",
    user_id: "4txXtrtsBSv0JiH1V",
    template_params: {
      to_email: "matthewshawn89@gmail.com",
      subject: "New Signed Authorization Form",
      message: `A new signed form has been submitted. View it here: ${pdfURL}`,
    },
  };

  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });
    alert("Form submitted successfully!");
  } catch (error) {
    console.error("Email Error:", error);
  }
}

// Handle form submission
async function handleFormSubmission() {
  const pdfBlob = await generatePDF();
  const fileName = `signed_document_${Date.now()}.pdf`;
  const pdfURL = await uploadPDF(pdfBlob, fileName);
  if (pdfURL) {
    sendEmailWithPDF(pdfURL);
  }
}
