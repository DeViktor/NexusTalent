
'use client';

import { Mail, Phone, MapPin, Linkedin, Globe, GraduationCap } from "lucide-react";
import { type UserProfile } from "@/lib/types";
import { Logo } from "../shared/logo";
import Image from 'next/image';

type CvData = {
    firstName?: string;
    lastName?: string;
    academicTitle?: string;
    phoneNumber?: string;
    email?: string;
    cidade?: string;
    summary?: string;
    profilePictureUrl?: string;
    workExperience?: { role: string; company: string; period: string; description?: string }[];
    academicHistory?: { degree: string; institution: string; year?: string }[];
    skills?: { value: string }[];
}

const getInitials = (firstName?: string, lastName?: string) => `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

export const CvPreviewTemplate = ({ data }: { data: CvData }) => {
    return (
        <div className="a4-page bg-white text-gray-800 font-sans leading-relaxed">
             <header className="px-10 py-6 flex justify-between items-center border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                     <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 relative overflow-hidden">
                        {data.profilePictureUrl ? (
                            <Image src={data.profilePictureUrl} alt="Foto de Perfil" fill className="object-cover" />
                        ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-bold">
                                {getInitials(data.firstName, data.lastName)}
                            </div>
                        )}
                     </div>
                     <div>
                        <h1 className="cv-name">
                            {data.firstName} {data.lastName}
                        </h1>
                        <p className="cv-section-title">
                            {data.academicTitle}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <Logo />
                </div>
            </header>
            
            <div className="grid grid-cols-12 gap-x-8 p-10">
                {/* Left Column */}
                <div id="cv-sidebar" className="col-span-4 space-y-8 bg-primary/5 p-6 rounded-lg">
                    <div>
                        <h2 className="section-title-side text-primary">CONTACTO</h2>
                        <div className="mt-4 space-y-3 cv-secondary-details">
                            {data.phoneNumber && <div className="flex items-start gap-3"><Phone size={14} className="mt-1 flex-shrink-0" /><span>{data.phoneNumber}</span></div>}
                            {data.email && <div className="flex items-start gap-3"><Mail size={14} className="mt-1 flex-shrink-0" /><span>{data.email}</span></div>}
                            {data.cidade && <div className="flex items-start gap-3"><MapPin size={14} className="mt-1 flex-shrink-0" /><span>{data.cidade}</span></div>}
                             <div className="flex items-start gap-3"><Linkedin size={14} className="mt-1 flex-shrink-0" /><span>linkedin.com/in/...</span></div>
                        </div>
                    </div>

                    {data.skills && data.skills.length > 0 && (
                        <div>
                            <h2 className="section-title-side text-primary">COMPETÊNCIAS</h2>
                            <ul className="mt-4 space-y-2 cv-body-text">
                                {data.skills.map((skill, index) => (
                                   skill.value && <li key={index}>- {skill.value}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                     <div>
                        <h2 className="section-title-side text-primary">LÍNGUAS</h2>
                        <ul className="mt-4 space-y-2 cv-body-text">
                            <li>Português (Nativo)</li>
                            <li>Inglês (Fluente)</li>
                        </ul>
                    </div>
                </div>

                {/* Right Column */}
                <div className="col-span-8 space-y-8">
                     {data.summary && (
                         <section>
                            <h2 className="section-title-main">RESUMO PROFISSIONAL</h2>
                            <p className="mt-4 cv-body-text text-justify">{data.summary}</p>
                        </section>
                    )}

                    {data.workExperience && data.workExperience.length > 0 && (
                        <section>
                            <h2 className="section-title-main">EXPERIÊNCIA PROFISSIONAL</h2>
                            <div className="mt-4 space-y-6">
                                {data.workExperience.map((exp, index) => (
                                    <div key={index}>
                                        <p className="cv-secondary-details font-semibold uppercase">{exp.period}</p>
                                        <h3 className="cv-section-title mt-1">{exp.role}</h3>
                                        <p className="cv-body-text font-medium">{exp.company}</p>
                                        {exp.description && <p className="mt-2 cv-body-text text-justify">{exp.description}</p>}
                                    </div>
                                ))}
                           </div>
                        </section>
                    )}
                    
                    {data.academicHistory && data.academicHistory.length > 0 && (
                        <section>
                           <h2 className="section-title-main">FORMAÇÃO ACADÉMICA</h2>
                           <div className="mt-4 space-y-5">
                                {data.academicHistory.map((edu, index) => (
                                    <div key={index}>
                                         <p className="cv-secondary-details font-semibold uppercase">{edu.year}</p>
                                        <h3 className="cv-section-title mt-1">{edu.degree}</h3>
                                        <p className="cv-body-text font-medium">{edu.institution}</p>
                                    </div>
                                ))}
                           </div>
                        </section>
                    )}
                </div>
            </div>
            <style jsx global>{`
                .a4-page {
                    width: 210mm;
                    min-height: 297mm;
                    font-family: 'Inter', sans-serif;
                    line-height: 1.5;
                }
                .cv-name { font-size: 28pt !important; font-weight: 700; }
                .cv-section-title { font-size: 13pt !important; font-weight: 700; }
                .cv-body-text { font-size: 11pt !important; }
                .cv-secondary-details { font-size: 12pt !important; }
                
                .section-title-side {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 13pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding-bottom: 4px;
                    border-bottom: 1.5px solid hsl(var(--primary));
                    letter-spacing: 0.1em;
                }
                 .section-title-main {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 13pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: hsl(var(--foreground));
                    padding-bottom: 6px;
                    border-bottom: 2px solid hsl(var(--primary));
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
};
