
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from './loading';

export default function DashboardRedirectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ email: string; role?: string } | null>(null);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const res = await fetch('/api/auth/session', { credentials: 'include' });
                if (!res.ok) {
                    router.replace('/login');
                    return;
                }
                const json = await res.json();
                if (json?.ok && json?.user) {
                    setUser({ email: json.user.email, role: json.user.role });
                } else {
                    router.replace('/login');
                    return;
                }
            } finally {
                setIsLoading(false);
            }
        };
        bootstrap();
    }, [router]);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!user) {
            router.replace('/login');
            return;
        }

        if (user.email === 'admin@nexustalent.com') {
            router.replace('/dashboard/admin');
            return;
        }
        
        if (user.email === 'recruiter@nexustalent.com.br') {
            router.replace('/dashboard/recruiter');
            return;
        }

        if (user.email === 'formador@nexustalent.com.br') {
            router.replace('/dashboard/instructor');
            return;
        }

        const role = user.role;

        if (role) {
            router.replace(`/dashboard/${role}`);
        } else {
            router.replace('/dashboard/student');
        }

    }, [user, isLoading, router]);

    return <Loading />;
}
