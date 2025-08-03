import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import AuthForm from "../components/AuthForm";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Save profile info to Firestore
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    createdAt: new Date().toISOString(),
  });

  navigate("/dashboard");
};

  return <AuthForm mode="signup" onSubmit={handleSignup} />;
}

export default Signup;