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
const auth = getAuth();

// Sign in anonymously (if needed for access control)
signInAnonymously(auth).catch((error) => console.error("Auth Error:", error));

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

// Convert form to PDF and upload
async function handleFormSubmission() {
  const pdfBlob = await generatePDF(); // Implement generatePDF()
  const fileName = `signed_document_${Date.now()}.pdf`;
  const pdfURL = await uploadPDF(pdfBlob, fileName);
  if (pdfURL) {
    sendEmailWithPDF(pdfURL); // Implement sendEmailWithPDF()
  }
}

document.getElementById("submitBtn").addEventListener("click", async () => {
  const studentName = document.getElementById("studentName").value;
  const parent1Name = document.getElementById("parent1Name").value;
  const parent2Name = document.getElementById("parent2Name").value || "N/A";
  const signature = document.getElementById("signaturePad").toDataURL();

  const pdfBlob = await generatePDF(
    studentName,
    parent1Name,
    parent2Name,
    signature
  );
  const fileName = `signed_document_${Date.now()}.pdf`;
  const pdfURL = await uploadPDF(pdfBlob, fileName);

  if (pdfURL) {
    sendEmailWithPDF(pdfURL);
  }
});
