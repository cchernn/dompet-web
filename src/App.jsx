import AppRouter from "./routes"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
