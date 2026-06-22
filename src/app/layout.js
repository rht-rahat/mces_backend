import "./globals.css";
import Providers from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LiveChat from "../components/LiveChat";

export const metadata = {
  title: "MCES - Overseas Group",
  description: "Worldwide Recruitment & Study Abroad",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <div className="min-h-screen flex flex-col justify-between">
            {children}
          </div>
          <Footer />
          <LiveChat />
        </Providers>
      </body>
    </html>
  );
}
