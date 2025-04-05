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
import {
    Card,
} from "@/components/ui/card"
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
            { loading && (<p>Loading Attachments</p>) }
            { !loading && attachments.length <= 0 && (
                <div>
                    <Button className="w-36 m-2" onClick={handleAdd}><FilePlus />Add</Button>
                    <p>No Attachments found</p>
                </div>
            )}
            { !loading && attachments.length > 0 && 
                <div>
                    <Button className="w-36 m-2" onClick={handleAdd}><FilePlus />Add</Button>
                    <div className="min-h-svh m-2">
                        <Card className="flex p-6 items-center justify-center">
                            <Table>
                                <TableCaption>List of attachments to latest date</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>File</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attachments.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{tx.date}</TableCell>
                                            <TableCell>{tx.name}</TableCell>
                                            <TableCell>{
                                                tx.url ? <Button onClick={() => handleRedirect(tx.url)}><File /><span className="hidden xl:inline">{tx.filename}</span></Button> : ""
                                            }</TableCell>
                                            <TableCell>{tx.type}</TableCell>
                                            <TableCell className="flex justify-end">
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
                        </Card>
                    </div>
                </div>
            }
        </>
    )
}

export default AttachmentListPage