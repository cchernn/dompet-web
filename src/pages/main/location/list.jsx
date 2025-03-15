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
import Alert from "@/lib/alertDialog"
import authService from "@/lib/authService"

function LocationListPage() {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchLocations()
    }, [])

    async function fetchLocations() {
        try {
            const response = await authService.fetchData("/locations")
            const data = processLocations(response)
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

    return (
        <>
            <h2>Locations</h2>
            { loading && (<p>Loading Locations</p>) }
            { !loading && locations.length <= 0 && (<p>No Locations found</p>)}
            { !loading && locations.length > 0 && 
                <>
                    <Button onClick={handleAdd}><FilePlus />Add</Button>
                    <Table>
                        <TableCaption>List of locations</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Google Page Link</TableHead>
                                <TableHead>Google Maps Link</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Access Type</TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locations.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.name}</TableCell>
                                    <TableCell>{tx.url ? <Button onClick={() => handleRedirect(tx.url)}><Link />{tx.url}</Button> : "NA"}</TableCell>
                                    <TableCell>{tx.google_page_link ? <Button onClick={() => handleRedirect(tx.google_page_link)}><StickyNote />{tx.google_page_link}</Button> : "NA"}</TableCell>
                                    <TableCell>{tx.google_maps_link ? <Button onClick={() => handleRedirect(tx.google_maps_link)}><Map />{tx.google_maps_link}</Button> : "NA"}</TableCell>
                                    <TableCell>{tx.category}</TableCell>
                                    <TableCell>{tx.access_type}</TableCell>
                                    <TableCell><Button onClick={() => handleEdit(tx.id)}><FilePenLine /></Button></TableCell>
                                    <TableCell><Alert 
                                        button_text={<Trash2 />}
                                        title="Confirm Delete"
                                        description="This action cannot be undone. This will permanently remove this attachment."
                                        action={() => handleDelete(tx.id)}
                                    /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            }
        </>
    )
}

export default LocationListPage