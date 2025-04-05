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
import {
    Card,
} from "@/components/ui/card"
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
            { loading && (<p>Loading Groups</p>) }
            { !loading && groups.length <= 0 && (
                <div>
                    <Button className="w-36 m-2" onClick={handleAdd}><FilePlus />Add</Button>
                    <p>No Groups found</p>
                </div>
            )}
            { !loading && groups.length > 0 && 
                <div>
                    <Button className="w-36 m-2" onClick={handleAdd}><FilePlus />Add</Button>
                    <div className="min-h-svh m-2">
                        <Card className="flex p-6 items-center justify-center">
                            <Table>
                                <TableCaption>List of groups</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groups.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{tx.name}</TableCell>
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

export default GroupListPage