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
            <h2>Transactions</h2>
            { loading && (<p>Loading Transactions</p>) }
            { !loading && transactions.length <= 0 && (<p>No Transactions found</p>)}
            { !loading && transactions.length > 0 && 
                <>
                    <Button onClick={handleAdd}><FilePlus />Add</Button>
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
                                <TableHead>Actions</TableHead>
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
                                            <Badge variant="secondary">{group.name}</Badge>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>{
                                        tx.attachments ? tx.attachments.map((attachment) => 
                                            <Badge variant="secondary">{attachment.name}</Badge>
                                        ) : ""}
                                    </TableCell>
                                    <TableCell>{tx.payment_method}</TableCell>
                                    <TableCell>{tx.category}</TableCell>
                                    <TableCell>
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
                </>
            }
        </>
    )
}

export default TransactionListPage