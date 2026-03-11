import { Card } from '@/components/ui/card';
import { getSiteData } from '@/lib/site-data';
import { MapPin } from 'lucide-react';
 
export async function LocationsSection() {
    const data = await getSiteData();
    const locations = Array.isArray(data.locations) ? data.locations : [];
    return (
        <section className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold">Nossa Presença Global</h2>
                    <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">Estamos estrategicamente localizados para atender nossos clientes em todo o mundo.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {locations.map(location => {
                        return (
                            <Card key={location.id} className="overflow-hidden group">
                                <div className="relative h-64">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                                    <div className="absolute bottom-0 left-0 p-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="text-white" />
                                            <h3 className="font-headline text-2xl font-bold text-white">{location.name}</h3>
                                        </div>
                                        <p className="text-white/90">{location.address}</p>
                                        <p className="text-white/80 text-sm">{location.phone}</p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
