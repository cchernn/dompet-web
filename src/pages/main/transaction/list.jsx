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
import { Badge } from "@/components/ui/badge"
import Alert from "@/lib/alertDialog"
import authService from "@/lib/authService"

function TransactionListPage() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchTransactions()
    }, [])

    async function fetchTransactions() {
        try {
            const response = await authService.fetchData("/transactions")
            const data = processTransactions(response)
            setTransactions(data)
        } catch (error) {
            console.error("Error", error)
        } finally {
            setLoading(false)
        }
    }

    function processTransactions(data) {
        return data.map((tx) => ({
            id: tx.id,
            date: tx.date,
            name: tx.name,
            amount: tx.amount.toFixed(2),
            payment_method: tx.payment_method,
            category: tx.category,
            location_name: tx.location_name,
            groups: tx.groups,
            attachments: tx.attachments,
        }))
    }

    const handleEdit = async (id) => {
        try {
            navigate(`/transactions/${id}`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleDelete = async (id) => {
        try {
            await authService.deleteData(`/transactions/${id}`)
            window.location.reload()
        } catch (error) {
            console.error("Error", error)
        }
    }

    const handleAdd = async (id) => {
        try {
            navigate(`/transactions/add`)
        } catch (error) {
            console.error("Error", error)
        }
    }

    return (
        <>
            { loading && (<p>Loading Transactions</p>) }
            { !loading && transactions.length <= 0 && (
                <div>
                    <Button className="w-36 m-2" onClick={handleAdd}><FilePlus />Add</Button>
                    <p>No Transactions found</p>
                </div>
            )}
            { !loading && transactions.length > 0 && 
                <div>
                    <Button className="w-36 m-2" onClick={handleAdd}><FilePlus />Add</Button>
                    <div className="min-h-svh m-2">
                        <Card className="flex p-6 items-center justify-center">
                            <Table>
                                <TableCaption>List of transactions to latest date</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Groups</TableHead>
                                        <TableHead>Attachments</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{tx.date}</TableCell>
                                            <TableCell>{tx.name}</TableCell>
                                            <TableCell>{tx.amount}</TableCell>
                                            <TableCell>{tx.location_name}</TableCell>
                                            <TableCell>{
                                                tx.groups ? tx.groups.map((group) => 
                                                    <Badge key={group.id} variant="secondary">{group.name}</Badge>
                                                ) : null}
                                            </TableCell>
                                            <TableCell>{
                                                tx.attachments ? tx.attachments.map((attachment) => 
                                                    <Badge key={attachment.id} variant="secondary">{attachment.name}</Badge>
                                                ) : ""}
                                            </TableCell>
                                            <TableCell>{tx.payment_method}</TableCell>
                                            <TableCell>{tx.category}</TableCell>
                                            <TableCell className="flex justify-end">
                                                <Button onClick={() => handleEdit(tx.id)}><FilePenLine /></Button>
                                                <Alert 
                                                    button_text={<Trash2 />}
                                                    title="Confirm Delete"
                                                    description="This action cannot be undone. This will permanently remove this transaction."
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

export default TransactionListPage