import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, Trash2, FilePlus, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableCaption,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Alert from "@/lib/alertDialog"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { listLocations, deleteLocation } from "@/api/locations"
import type { Location } from "@/api/types"

function LocationListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

    const {
        items: locations,
        page,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listLocations({ page, pageSize }))

    const handleAdd = () => {
        navigate(`/locations/add`)
    }

    const openLocation = (location: Location) => {
        setSelectedLocation(location)
        setSheetOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteLocation(id)
            toast.success("Location deleted.")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleOpenUrl = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer")
    }

    const selectedUrl = selectedLocation
        ? (selectedLocation.type === "physical" ? selectedLocation.google_maps_url : selectedLocation.url)
        : null

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-center gap-3 m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add</Button>
                {!loading && <span className="text-sm text-muted-foreground">{totalCount} location{totalCount === 1 ? "" : "s"}</span>}
            </div>
            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {
                        loading ?
                            <div>
                                <Skeleton className="h-6 w-full my-2" />
                                <Skeleton className="h-6 w-full my-2" />
                            </div>
                        :
                        locations.length === 0 ?
                            <div className="h-20 flex text-center items-center justify-center w-full">
                                <h2>No Locations Available</h2>
                            </div>
                        :
                        <Table className="min-w-full">
                            <TableCaption>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={previousPage}
                                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink className="font-bold text-primary cursor-default">
                                                {page} / {totalPages}
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={nextPage}
                                                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((location) => (
                                    <TableRow
                                        key={location.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openLocation(location)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openLocation(location)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3">
                                            <span className="font-medium truncate flex items-center gap-2">
                                                {location.name}
                                                <Badge variant="outline">{location.type}</Badge>
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Location</SheetTitle>
                        <SheetDescription className="sr-only">Location details</SheetDescription>
                    </SheetHeader>
                    {selectedLocation && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold">{selectedLocation.name}</div>
                                    <Badge variant="outline">{selectedLocation.type}</Badge>
                                </div>

                                {selectedUrl && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="self-start"
                                        onClick={() => handleOpenUrl(selectedUrl)}
                                    >
                                        <Link />{selectedUrl}
                                    </Button>
                                )}
                            </div>

                            <SheetFooter className="mt-6">
                                <Button onClick={() => navigate(`/locations/${selectedLocation.id}`)}>
                                    <FilePenLine />Edit
                                </Button>
                                <Alert
                                    button_text={<><Trash2 />Delete</>}
                                    title="Confirm Delete"
                                    description="This action cannot be undone and cannot be reversed from this app."
                                    action={() => handleDelete(selectedLocation.id)}
                                />
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default LocationListPage
