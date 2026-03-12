import Landing from "../components/Landing";
import { AuthProvider, useAuth } from "../context/AuthContext";


export default function Home() {
  const {user}=useAuth();
  return (
    <AuthProvider>
      <Landing />
    </AuthProvider>
  );
}
