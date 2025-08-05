import { signInWithEmailAndPassword } from "firebase/auth";
import { useRedirectIfAuthenticated } from "../hooks/useRedirectIfAuthenticated";
import { auth } from "../firebase";
import AuthForm from "../components/AuthForm";

function Login() {

  useRedirectIfAuthenticated();

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}

export default Login;