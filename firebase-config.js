// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1i77a8faq42l7aptWxzw9bwbIGgkVPLg",
  authDomain: "flordoluar-72d3a.firebaseapp.com",
  databaseURL: "https://flordoluar-72d3a-default-rtdb.firebaseio.com",
  projectId: "flordoluar-72d3a",
  storageBucket: "flordoluar-72d3a.firebasestorage.app",
  messagingSenderId: "532960589206",
  appId: "1:532960589206:web:902ba77a7f68e57904d9b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export for use in other modules
export { app, database };
