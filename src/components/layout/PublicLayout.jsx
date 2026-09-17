import Navbar from "@/components/Navbar";
import { Footer } from "./Footer";

// Wraps every page outside the dashboard. `bare` drops the navbar for
// pages that render their own (the home page puts it inside the hero).
export function PublicLayout({ children, bare = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-moon">
      {!bare && (
        <div className="bg-imperial">
          <Navbar />
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
