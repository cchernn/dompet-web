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
import { Badge } from "@/components/ui/badge"
import Alert from "@/lib/alertDialog"
import { listCategories, deleteCategory } from "@/api/categories"
import { usePaginatedList } from "@/hooks/use-paginated-list"

function CategoryListPage() {
    const navigate = useNavigate()
    const {
        items: categories,
        page,
        totalPages,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listCategories({ page, pageSize }))

    const parentName = (parentId) => categories.find((c) => c.id === parentId)?.name ?? "—"

    const handleAdd = () => navigate("/categories/add")

    const handleEdit = (category) => {
        navigate(`/categories/${category.id}`, { state: { category } })
    }

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id)
            toast.success("Category deleted")
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
                    ) : categories.length === 0 ? (
                        <div className="h-20 flex text-center items-center justify-center w-full">
                            <h2>No Categories Available</h2>
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Parent</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Owner</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Active</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => {
                                    const isGlobal = category.user_id === null || category.user_id === undefined
                                    return (
                                        <TableRow key={category.id}>
                                            <TableCell className="text-sm">{category.name}</TableCell>
                                            <TableCell className="text-sm">{category.parent_id ? parentName(category.parent_id) : "—"}</TableCell>
                                            <TableCell className="text-sm">
                                                <Badge variant="secondary">{isGlobal ? "Global" : "Mine"}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{category.is_active ? "Yes" : "No"}</TableCell>
                                            <TableCell className="flex justify-center items-center gap-1">
                                                {!isGlobal && (
                                                    <>
                                                        <Button onClick={() => handleEdit(category)}><FilePenLine /></Button>
                                                        <Alert
                                                            button_text={<Trash2 />}
                                                            title="Confirm Delete"
                                                            description="This action cannot be undone. This will permanently deactivate this category."
                                                            action={() => handleDelete(category.id)}
                                                        />
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default CategoryListPage
