import { useState, useEffect } from "react"
import {
    Table,
    TableCaption,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table"
import authService from "@/lib/authService"

function TransactionsPage() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

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
        }))
    }


    return (
        <>
            <h2>Transactions</h2>
            { loading && (<p>Loading Transactions</p>) }
            { !loading && transactions.length <= 0 && (<p>No Transactions found</p>)}
            { !loading && transactions.length > 0 && 
                <Table>
                    <TableCaption>List of transactions to latest date</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Category</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell>{tx.name}</TableCell>
                                <TableCell>{tx.amount}</TableCell>
                                <TableCell>{tx.payment_method}</TableCell>
                                <TableCell>{tx.category}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }
        </>
    )
}

export default TransactionsPage