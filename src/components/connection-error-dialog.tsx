import { WifiOff } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useConnectionError, clearConnectionError } from "@/lib/connectionError"

// Mounted once in App.tsx — pops up whenever apiClient.ts reports a request
// that couldn't reach the server at all (offline, DNS failure, timeout,
// CORS), as opposed to one that reached it and came back with an error,
// which keeps surfacing as a toast instead.
export function ConnectionErrorDialog() {
    const open = useConnectionError()

    return (
        <AlertDialog open={open} onOpenChange={(next) => { if (!next) clearConnectionError() }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <WifiOff className="size-5 text-destructive" />
                        Connection lost
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Dompet can&apos;t reach the server. Check your internet connection and try again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={clearConnectionError}>Dismiss</AlertDialogCancel>
                    <AlertDialogAction onClick={() => window.location.reload()}>Retry</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
