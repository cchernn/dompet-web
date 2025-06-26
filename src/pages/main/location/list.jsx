import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
    Link,
    Map,
    StickyNote,
} from "lucide-react"
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
import {
    Card,
} from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { 
    Skeleton 
} from "@/components/ui/skeleton"
import Alert from "@/lib/alertDialog"
import authService from "@/lib/authService"

function LocationListPage() {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const navigate = useNavigate()

    useEffect(() => {
        fetchLocations()
    }, [])

    async function fetchLocations() {
        try {
            const response = await authService.fetchData("/locations")
            const data = processLocations(response.data)
            setLocations(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processLocations(data) {
        return data.map((tx) => ({
            id: tx.id,
            name: tx.name,
            url: tx.url,
            google_page_link: tx.google_page_link,
            google_maps_link: tx.google_maps_link,
            category: tx.category,
            access_type: tx.access_type,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/locations/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/locations/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/locations/add`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleRedirect = async(url) => {
        try {
            window.open(url, "_blank", "noopener,noreferrer")
        } catch (error) {
            console.log("Error", error)
        }
    }

    const handlePreviousPage = () => {
        try {
            if (page > 1) {
                setPage(page - 1)
            }
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleNextPage = () => {
        try {
            setPage(page + 1)
        } catch (error) {
            console.error("Error", error)
        }
    }

    return (
        <>
            <div className="min-h-svh m-2">
                <Button className="min-w-[12rem] m-2" onClick={handleAdd}><FilePlus />Add</Button>
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
                                                    onClick={handlePreviousPage} 
                                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink 
                                                    className="font-bold text-primary cursor-default"
                                                >{page}</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext 
                                                    onClick={handleNextPage} 
                                                    className="cursor-pointer"
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">URL</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Google Page Link</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Google Maps Link</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Category</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground">Access Type</TableHead>
                                        <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-sm">{tx.name}</TableCell>
                                            <TableCell className="text-sm">{
                                                tx.url ? <Button title={tx.url} onClick={() => handleRedirect(tx.url)}><Link /><span className="truncate max-w-[120px] hidden xl:inline">{tx.url}</span></Button> : ""}
                                            </TableCell>
                                            <TableCell className="text-sm">{
                                                tx.google_page_link ? <Button title={tx.google_page_link} onClick={() => handleRedirect(tx.google_page_link)}><StickyNote /><span className="truncate max-w-[120px] hidden xl:inline">{tx.google_page_link}</span></Button> : ""}
                                            </TableCell>
                                            <TableCell className="text-sm">{
                                                tx.google_maps_link ? <Button title={tx.google_maps_link} onClick={() => handleRedirect(tx.google_maps_link)}><Map /><span className="truncate max-w-[120px] hidden xl:inline">{tx.google_maps_link}</span></Button> : ""}
                                            </TableCell>
                                            <TableCell className="text-sm">{tx.category}</TableCell>
                                            <TableCell className="text-sm">{tx.access_type}</TableCell>
                                            <TableCell className="flex justify-center items-center gap-1">
                                                <Button onClick={() => handleEdit(tx.id)}><FilePenLine /></Button>
                                                <Alert 
                                                    button_text={<Trash2 />}
                                                    title="Confirm Delete"
                                                    description="This action cannot be undone. This will permanently remove this attachment."
                                                    action={() => handleDelete(tx.id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </div>
                </Card>
            </div>
        </>
    )
}

export default LocationListPage