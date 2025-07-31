import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AuthForm from "../components/AuthForm";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
    navigate("/dashboard");
  };

  return <AuthForm mode="signup" onSubmit={handleSignup} />;
}

export default Signup;