import React from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"

export function AppHeader({ route, paths }) {
    const crumbs = route.split("_")

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">
                        dompet
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {crumbs.map((crumb, index) => {
                    const href = index < paths.length ? paths[index] : "#"
                    
                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href={href}>{crumb}</BreadcrumbLink>
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}