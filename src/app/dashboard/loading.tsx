import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid gap-8 auto-rows-min">
                    <div className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="h-48 rounded-lg" />
                        <Skeleton className="h-48 rounded-lg" />
                    </div>
                    <Skeleton className="h-64 rounded-lg" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-80 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
