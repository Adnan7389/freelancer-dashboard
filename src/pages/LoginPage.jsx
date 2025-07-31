import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AuthForm from "../components/AuthForm";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/dashboard");
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}

export default Login;