import { Outlet } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { Toaster } from "react-hot-toast";
export default function App() {
    return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 3000
            }}
        />
      <main className="flex-1 max-w-5xl mx-auto p-4">
        <Outlet />
      </main>
      <Footer />
    </div> 
  );
}
