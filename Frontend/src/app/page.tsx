import Landing from "../components/Landing";
import Mainlayout from "../components/layout/Mainlayout";
import { AuthProvider, useAuth } from "../context/AuthContext";


export default function Home() {
  const { user } = useAuth();
  return (
    <AuthProvider>
      <Mainlayout>
        <Landing />
      </Mainlayout>
    </AuthProvider>
  );
}
