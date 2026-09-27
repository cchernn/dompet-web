import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, Trash2, FilePlus } from "lucide-react"
import { toast } from "@/lib/toast"
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Alert from "@/lib/alertDialog"
import { listCategories, deleteCategory } from "@/api/categories"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import type { Category } from "@/api/types"

function CategoryListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const {
        items: categories,
        page,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => listCategories({ page, pageSize }))

    const parentName = (parentId: string) => categories.find((c) => c.id === parentId)?.name ?? "—"

    const handleAdd = () => navigate("/categories/add")

    const openCategory = (category: Category) => {
        setSelectedCategory(category)
        setSheetOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id)
            toast.success("Category deleted")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add category</Button>
            </div>
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Category</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => {
                                    const isGlobal = category.user_id === null || category.user_id === undefined
                                    return (
                                        <TableRow
                                            key={category.id}
                                            className="cursor-pointer"
                                            tabIndex={0}
                                            role="button"
                                            onClick={() => openCategory(category)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault()
                                                    openCategory(category)
                                                }
                                            }}
                                        >
                                            <TableCell className="py-3">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="font-medium truncate flex items-center gap-2">
                                                        {category.name}
                                                        {isGlobal && <Badge variant="outline">Global</Badge>}
                                                    </span>
                                                    {category.parent_id && (
                                                        <span className="text-sm text-muted-foreground truncate">
                                                            in {parentName(category.parent_id)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Category</SheetTitle>
                        <SheetDescription className="sr-only">Category details</SheetDescription>
                    </SheetHeader>
                    {selectedCategory && (() => {
                        const isGlobal = selectedCategory.user_id === null || selectedCategory.user_id === undefined
                        return (
                            <>
                                <div className="flex flex-col gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl font-semibold">{selectedCategory.name}</div>
                                        <Badge variant="secondary">{isGlobal ? "Global" : "Mine"}</Badge>
                                    </div>

                                    <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
                                        <span className="text-muted-foreground">Parent</span>
                                        <span>{selectedCategory.parent_id ? parentName(selectedCategory.parent_id) : "—"}</span>
                                    </div>
                                </div>

                                {!isGlobal && (
                                    <SheetFooter className="mt-6">
                                        <Button onClick={() => navigate(`/categories/${selectedCategory.id}`, { state: { category: selectedCategory } })}>
                                            <FilePenLine />Edit
                                        </Button>
                                        <Alert
                                            button_text={<><Trash2 />Delete</>}
                                            title="Confirm Delete"
                                            description="This action cannot be undone. This will permanently deactivate this category."
                                            action={() => handleDelete(selectedCategory.id)}
                                        />
                                    </SheetFooter>
                                )}
                            </>
                        )
                    })()}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default CategoryListPage
