import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    FilePenLine,
    Trash2,
    FilePlus,
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

function GroupListPage() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchGroups()
    }, [])

    async function fetchGroups() {
        try {
            const response = await authService.fetchData("/transactions/groups")
            const data = processGroups(response)
            setGroups(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processGroups(data) {
        return data.map((tx) => ({
            id: tx.id,
            name: tx.name,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/transactions/groups/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/transactions/groups/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/transactions/groups/add`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    return (
        <>
            <h2>Groups</h2>
            { loading && (<p>Loading Groups</p>) }
            { !loading && groups.length <= 0 && (<p>No Groups found</p>)}
            { !loading && groups.length > 0 && 
                <>
                    <Button onClick={handleAdd}><FilePlus />Add</Button>
                    <Table>
                        <TableCaption>List of groups</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.name}</TableCell>
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

export default GroupListPage