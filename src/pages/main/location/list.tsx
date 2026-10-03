import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePenLine, Trash2, FilePlus, Link, X } from "lucide-react"
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
import { toast } from "@/lib/toast"
import Alert from "@/lib/alertDialog"
import authService from "@/lib/authService"
import { usePaginatedList } from "@/hooks/use-paginated-list"
import { searchLocations, deleteLocation, getLocation } from "@/api/locations"
import type { LocationSearchResult, LocationType } from "@/api/types"

const LOCATION_TYPE_LABELS = {
    physical: "Physical",
    online: "Online",
}

const ALL = "__all__"

function LocationListPage() {
    const navigate = useNavigate()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null)
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [owner, setOwner] = useState<"" | "mine" | "public">("")
    const [type, setType] = useState<LocationType | "">("")
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        authService.getUser()
            .then((id) => setCurrentUserId(id ?? null))
            .catch((error: Error) => toast.error(error.message))
    }, [])

    const ownerParam = owner === "mine" ? (currentUserId ?? undefined) : owner === "public" ? "null" : undefined

    const {
        items: locations,
        page,
        setPage,
        totalPages,
        totalCount,
        loading,
        nextPage,
        previousPage,
        reload,
    } = usePaginatedList(({ page, pageSize }) =>
        searchLocations({ page, pageSize, q: search || undefined, owner: ownerParam, type: type || undefined })
    )

    const handleAdd = () => {
        navigate(`/locations/add`)
    }

    const openLocation = (location: LocationSearchResult) => {
        setSelectedLocation(location)
        setSelectedUrl(null)
        setSheetOpen(true)
        // The search view doesn't carry google_maps_url/url — fetch the full
        // record on demand, same pattern as the attachments page's on-demand
        // presigned download_url fetch.
        getLocation(location.id)
            .then(({ data }) => setSelectedUrl((data.type === "physical" ? data.google_maps_url : data.url) ?? null))
            .catch((error: Error) => toast.error(error.message))
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteLocation(id)
            toast.success("Location deleted.")
            setSheetOpen(false)
            reload()
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const handleOpenUrl = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer")
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
        setOwner(value === ALL ? "" : (value as "mine" | "public"))
        setPage(1)
        reload()
    }

    const updateType = (value: string) => {
        setType(value === ALL ? "" : (value as LocationType))
        setPage(1)
        reload()
    }

    const clearFilters = () => {
        setSearch("")
        setOwner("")
        setType("")
        setPage(1)
        reload()
    }

    const hasFilters = search || owner || type

    return (
        <div className="min-h-svh m-2">
            <div className="flex items-baseline gap-3 m-2">
                <h1 className="text-2xl font-semibold tracking-tight">Locations</h1>
                <span className="text-2xl font-semibold text-muted-foreground">{totalCount.toLocaleString()}</span>
            </div>
            <div className="m-2">
                <Button className="min-w-[12rem]" onClick={handleAdd}><FilePlus />Add location</Button>
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
                        <Label>Type</Label>
                        <Select value={type || ALL} onValueChange={updateType}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All types</SelectItem>
                                {(Object.entries(LOCATION_TYPE_LABELS) as [LocationType, string][]).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Owner</Label>
                        <Select value={owner || ALL} onValueChange={updateOwner}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All</SelectItem>
                                <SelectItem value="mine">Mine</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
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
                    {
                        loading ?
                            <div>
                                <Skeleton className="h-6 w-full my-2" />
                                <Skeleton className="h-6 w-full my-2" />
                            </div>
                        :
                        locations.length === 0 ?
                            <div className="h-20 flex text-center items-center justify-center w-full">
                                <h2>No Locations Available</h2>
                            </div>
                        :
                        <Table className="min-w-full">
                            <TableCaption>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={previousPage}
                                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Location</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-sm text-muted-foreground">Owner</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map((location) => (
                                    <TableRow
                                        key={location.id}
                                        className="cursor-pointer"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openLocation(location)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                openLocation(location)
                                            }
                                        }}
                                    >
                                        <TableCell className="py-3 font-medium">{location.name}</TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant="outline">{LOCATION_TYPE_LABELS[location.type]}</Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant="outline">{location.user_id == null ? "Public" : "Private"}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
            </Card>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Location</SheetTitle>
                        <SheetDescription className="sr-only">Location details</SheetDescription>
                    </SheetHeader>
                    {selectedLocation && (
                        <>
                            <div className="flex flex-col gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold">{selectedLocation.name}</div>
                                    <Badge variant="outline">{LOCATION_TYPE_LABELS[selectedLocation.type]}</Badge>
                                    {selectedLocation.user_id == null && <Badge variant="outline">Public</Badge>}
                                </div>

                                {selectedLocation.user_id == null && (
                                    <p className="text-sm text-muted-foreground">
                                        Public locations can&apos;t be edited or deleted from this app.
                                    </p>
                                )}

                                {selectedUrl && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="self-start"
                                        onClick={() => handleOpenUrl(selectedUrl)}
                                    >
                                        <Link />{selectedUrl}
                                    </Button>
                                )}
                            </div>

                            {selectedLocation.user_id != null && (
                                <SheetFooter className="mt-6">
                                    <Button onClick={() => navigate(`/locations/${selectedLocation.id}`)}>
                                        <FilePenLine />Edit
                                    </Button>
                                    <Alert
                                        button_text={<><Trash2 />Delete</>}
                                        title="Confirm Delete"
                                        description="This action cannot be undone and cannot be reversed from this app."
                                        action={() => handleDelete(selectedLocation.id)}
                                    />
                                </SheetFooter>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default LocationListPage
