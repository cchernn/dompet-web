import AppRouter from "./routes"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { ConnectionErrorDialog } from "@/components/connection-error-dialog"

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster />
      <ConnectionErrorDialog />
    </BrowserRouter>
  )
}

export default App
