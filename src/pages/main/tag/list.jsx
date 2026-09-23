import { useNavigate } from "react-router-dom"
import { FilePenLine, Trash2, FilePlus } from "lucide-react"
import { toast } from "sonner"
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
import Alert from "@/lib/alertDialog"
import { listTags, deleteTag } from "@/api/tags"
import { usePaginatedList } from "@/hooks/use-paginated-list"

function TagListPage() {
    const navigate = useNavigate()
    const {
        items: tags,
        page,
        totalPages,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listTags({ page, pageSize }))

    const handleAdd = () => navigate("/tags/add")

    const handleEdit = (tag) => {
        navigate(`/tags/${tag.id}`, { state: { tag } })
    }

    const handleDelete = async (id) => {
        try {
            await deleteTag(id)
            toast.success("Tag deleted")
            reload()
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <Button className="min-w-[12rem] m-2" onClick={handleAdd}><FilePlus />Add</Button>
            <Card className="p-6 rounded-2xl shadow-md border">
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div>
                            <Skeleton className="h-6 w-full my-2" />
                            <Skeleton className="h-6 w-full my-2" />
                        </div>
                    ) : tags.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Tags Available</h2>
                        </div>
                    ) : (
                        <Table className="min-w-full">
                            <TableCaption>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={previousPage}
                                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Name</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Active</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tags.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell className="text-sm">{tag.name}</TableCell>
                                        <TableCell className="text-sm">{tag.is_active ? "Yes" : "No"}</TableCell>
                                        <TableCell className="flex justify-center items-center gap-1">
                                            <Button onClick={() => handleEdit(tag)}><FilePenLine /></Button>
                                            <Alert
                                                button_text={<Trash2 />}
                                                title="Confirm Delete"
                                                description="This action cannot be undone. This will permanently deactivate this tag."
                                                action={() => handleDelete(tag.id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default TagListPage
