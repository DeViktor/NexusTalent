
'use client';

import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { Logo } from "../shared/logo";
import Image from "next/image";

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

export const CvPreviewModernTemplate = ({ data }: { data: CvData }) => {
    return (
        <div className="a4-page bg-white text-gray-800 font-sans">
            <div className="grid grid-cols-12 min-h-[297mm]">
                {/* Main Column */}
                <div className="col-span-8 p-10 pr-6">
                    <header className="mb-10">
                        <h1 className="cv-name">
                            {data.firstName} {data.lastName}
                        </h1>
                        <h2 className="cv-section-title-modern text-primary mt-1">
                            {data.academicTitle}
                        </h2>
                    </header>

                    {data.summary && (
                         <section className="mb-8">
                            <h3 className="section-title-main">Resumo Profissional</h3>
                            <p className="mt-3 cv-body-text text-justify">{data.summary}</p>
                        </section>
                    )}

                    {data.workExperience && data.workExperience.length > 0 && (
                        <section className="mb-8">
                            <h3 className="section-title-main">Experiência Profissional</h3>
                            <div className="mt-4 space-y-6">
                                {data.workExperience.map((exp, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="cv-section-title-modern">{exp.role}</h4>
                                            <p className="cv-secondary-details">{exp.period}</p>
                                        </div>
                                        <p className="cv-body-text text-primary">{exp.company}</p>
                                        {exp.description && <p className="mt-2 cv-body-text text-justify">{exp.description}</p>}
                                    </div>
                                ))}
                           </div>
                        </section>
                    )}

                     {data.academicHistory && data.academicHistory.length > 0 && (
                        <section>
                           <h3 className="section-title-main">Formação Académica</h3>
                           <div className="mt-4 space-y-5">
                                {data.academicHistory.map((edu, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="cv-section-title-modern">{edu.degree}</h4>
                                            <p className="cv-secondary-details">{edu.year}</p>
                                        </div>
                                        <p className="cv-body-text">{edu.institution}</p>
                                    </div>
                                ))}
                           </div>
                        </section>
                    )}
                </div>
                {/* Right Column */}
                <div className="col-span-4 bg-gray-50 p-8">
                     <div className="space-y-8">
                        {data.profilePictureUrl && (
                            <div className="relative w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-white shadow-lg">
                                <Image src={data.profilePictureUrl} alt="Foto de Perfil" fill className="object-cover" />
                            </div>
                        )}
                        <div>
                            <h3 className="section-title-side">Contacto</h3>
                            <div className="mt-3 space-y-3 cv-secondary-details">
                                {data.email && <div className="flex items-center gap-2"><Mail size={14} className="text-primary" /><span>{data.email}</span></div>}
                                {data.phoneNumber && <div className="flex items-center gap-2"><Phone size={14} className="text-primary" /><span>{data.phoneNumber}</span></div>}
                                {data.cidade && <div className="flex items-center gap-2"><MapPin size={14} className="text-primary" /><span>{data.cidade}</span></div>}
                                <div className="flex items-center gap-2"><Linkedin size={14} className="text-primary" /><span>linkedin.com/in/...</span></div>
                            </div>
                        </div>

                        {data.skills && data.skills.length > 0 && (
                            <div>
                                <h3 className="section-title-side">Competências</h3>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {data.skills.map((skill, index) => (
                                       skill.value && <span key={index} className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">{skill.value}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="section-title-side">Línguas</h3>
                            <ul className="mt-3 space-y-1 cv-body-text">
                                <li>Português (Nativo)</li>
                                <li>Inglês (Avançado)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
             <style jsx global>{`
                .a4-page {
                    width: 210mm;
                    min-height: 297mm;
                    line-height: 1.5;
                }
                .cv-name { font-size: 28pt !important; font-weight: 700; }
                .cv-section-title-modern { font-size: 13pt !important; font-weight: 700; }
                .cv-body-text { font-size: 11pt !important; }
                .cv-secondary-details { font-size: 12pt !important; }

                .section-title-main {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 13pt;
                    font-weight: 700;
                    color: hsl(var(--primary));
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 4px;
                    letter-spacing: 0.025em;
                }
                 .section-title-side {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 11pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: hsl(var(--foreground));
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
};
