import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata = {
  title: "Collaborative Task Board",
  description: "A real-time collaborative task board application",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
