import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, Trash2, FilePlus, X, FileText } from "lucide-react"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import authService from "@/lib/authService"
import { searchCategories, deleteCategory } from "@/api/categories"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import type { CategorySearchResult } from "@/api/types"

const ALL = "__all__"

function CategoryListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<CategorySearchResult | null>(null)
    const [search, setSearch] = useState("")
    const [owner, setOwner] = useState<"" | "mine" | "global">("")
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        authService.getUser()
            .then((id) => setCurrentUserId(id ?? null))
            .catch((error: Error) => toast.error(error.message))
    }, [])

    const ownerParam = owner === "mine" ? (currentUserId ?? undefined) : owner === "global" ? "null" : undefined

    const {
        items: categories,
        page,
        setPage,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) => searchCategories({ page, pageSize, q: search || undefined, owner: ownerParam }))

    const parentName = (parentId: string) => categories.find((c) => c.id === parentId)?.name ?? "—"

    const handleAdd = () => navigate("/categories/add")

    const openCategory = (category: CategorySearchResult) => {
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

    // Debounce the name search so typing doesn't fire a request per keystroke.
    const didMount = useRef(false)
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true
            return
        }
        const timeout = setTimeout(() => {
            setPage(1)
            reload()
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search])

    const updateOwner = (value: string) => {
        setOwner(value === ALL ? "" : (value as "mine" | "global"))
        setPage(1)
        reload()
    }

    const clearFilters = () => {
        setSearch("")
        setOwner("")
        setPage(1)
        reload()
    }

    const hasFilters = search || owner

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add category</Button>
            </div>

            <Card className="p-4 m-2 rounded-2xl shadow-md border">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Search</Label>
                        <Input
                            className="w-56"
                            placeholder="Search by name"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Owner</Label>
                        <Select value={owner || ALL} onValueChange={updateOwner}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All</SelectItem>
                                <SelectItem value="mine" disabled={!currentUserId}>Mine</SelectItem>
                                <SelectItem value="global">Global</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {hasFilters && (
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            <X />Clear filters
                        </Button>
                    )}
                </div>
            </Card>

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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Owner</TableHead>
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
                                                    <span className="font-medium truncate">{category.name}</span>
                                                    {category.parent_id && (
                                                        <span className="text-sm text-muted-foreground truncate">
                                                            in {parentName(category.parent_id)}
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <FileText className="size-3" />{category.transaction_count}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge variant="outline">{isGlobal ? "Global" : "Mine"}</Badge>
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

                                        <span className="text-muted-foreground">Transactions</span>
                                        <span className="inline-flex items-center gap-1">
                                            <FileText className="size-3" />{selectedCategory.transaction_count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <SheetFooter className="mt-6">
                                    {!isGlobal && (
                                        <>
                                            <Button onClick={() => navigate(`/categories/${selectedCategory.id}`, { state: { category: selectedCategory } })}>
                                                <FilePenLine />Edit
                                            </Button>
                                            <Alert
                                                button_text={<><Trash2 />Delete</>}
                                                title="Confirm Delete"
                                                description="This action cannot be undone. This will permanently deactivate this category."
                                                action={() => handleDelete(selectedCategory.id)}
                                            />
                                        </>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/transactions?category=${encodeURIComponent(selectedCategory.name)}`)}
                                    >
                                        <FileText />View Transactions
                                    </Button>
                                </SheetFooter>
                            </>
                        )
                    })()}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default CategoryListPage
