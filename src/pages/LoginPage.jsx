import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // watch auth state


  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  if (currentUser) {
    navigate("/dashboard");
  }
  
  return <AuthForm mode="login" onSubmit={handleLogin} />;
}

export default Login;