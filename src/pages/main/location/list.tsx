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
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Alert from "@/lib/alertDialog"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { listLocations, deleteLocation } from "@/api/locations"

function LocationListPage() {
    const navigate = useNavigate()
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

    const handleEdit = (id: string) => {
        navigate(`/locations/${id}`)
    }

    const handleAdd = () => {
        navigate(`/locations/add`)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteLocation(id)
            toast.success("Location deleted.")
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleOpenUrl = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer")
    }

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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Link</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Status</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((location) => {
                                    const url = location.type === "physical" ? location.google_maps_url : location.url
                                    return (
                                        <TableRow key={location.id}>
                                            <TableCell className="text-sm">
                                                <Badge variant="secondary">{location.type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{location.name}</TableCell>
                                            <TableCell className="text-sm">
                                                {url ? (
                                                    <Button title={url} onClick={() => handleOpenUrl(url)}>
                                                        <Link /><span className="truncate max-w-[160px] hidden xl:inline">{url}</span>
                                                    </Button>
                                                ) : ""}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <Badge variant={location.is_active ? "secondary" : "outline"}>
                                                    {location.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="flex justify-center items-center gap-1">
                                                <Button onClick={() => handleEdit(location.id)}><FilePenLine /></Button>
                                                <Alert
                                                    button_text={<Trash2 />}
                                                    title="Confirm Delete"
                                                    description="This action cannot be undone and cannot be reversed from this app."
                                                    action={() => handleDelete(location.id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    }
                </div>
            </Card>
        </div>
    )
}

export default LocationListPage
