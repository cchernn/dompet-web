import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
    File,
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

function AttachmentListPage() {
    const [attachments, setAttachments] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchAttachments()
    }, [])

    async function fetchAttachments() {
        try {
            const response = await authService.fetchData("/attachments")
            const data = processAttachments(response)
            setAttachments(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processAttachments(data) {
        return data.map((tx) => ({
            id: tx.id,
            date: tx.date,
            name: tx.name,
            url: tx.url,
            filename: tx.filename,
            type: tx.type,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/attachments/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/attachments/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/attachments/add`)
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
            <h2>Attachments</h2>
            { loading && (<p>Loading Attachments</p>) }
            { !loading && attachments.length <= 0 && (<p>No Attachments found</p>)}
            { !loading && attachments.length > 0 && 
                <>
                    <Button onClick={handleAdd}><FilePlus />Add</Button>
                    <Table>
                        <TableCaption>List of attachments to latest date</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>{tx.name}</TableCell>
                                    {/* <TableCell><a href={tx.url}><File />{tx.filename}</a></TableCell> */}
                                    <TableCell><Button onClick={() => handleRedirect(tx.url)}><File />{tx.filename}</Button></TableCell>
                                    <TableCell>{tx.type}</TableCell>
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

export default AttachmentListPage