import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-dvh flex-col">
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
