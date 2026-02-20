'use client';

import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import { Logo } from "../shared/logo";

type CvData = {
    firstName?: string;
    lastName?: string;
    academicTitle?: string;
    phoneNumber?: string;
    email?: string;
    cidade?: string;
    summary?: string;
    workExperience?: { role: string; company: string; period: string; description?: string }[];
    academicHistory?: { degree: string; institution: string; year?: string }[];
    skills?: { value: string }[];
}

export const CvPreviewClassicTemplate = ({ data }: { data: CvData }) => {
    return (
        <div className="a4-page bg-white text-gray-800 font-serif p-6">
             <header className="text-center border-b-2 border-gray-800 pb-4 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="cv-name">
                        {data.firstName} {data.lastName}
                    </h1>
                    <h2 className="cv-section-title-classic mt-2">
                        {data.academicTitle}
                    </h2>
                </div>
                <div className="text-right">
                    <Logo />
                </div>
            </header>
            <div className="text-center mb-8">
                <div className="mt-4 flex justify-center items-center gap-x-6 gap-y-2 cv-secondary-details flex-wrap">
                    {data.email && <div className="flex items-center gap-2"><Mail size={12} /><span>{data.email}</span></div>}
                    {data.phoneNumber && <div className="flex items-center gap-2"><Phone size={12} /><span>{data.phoneNumber}</span></div>}
                    {data.cidade && <div className="flex items-center gap-2"><MapPin size={12} /><span>{data.cidade}</span></div>}
                </div>
            </div>
            
            <div className="space-y-8">
                {data.summary && (
                    <section>
                        <h3 className="cv-section-title-classic-main">Resumo</h3>
                        <p className="mt-3 cv-body-text text-justify">{data.summary}</p>
                    </section>
                )}

                {data.workExperience && data.workExperience.length > 0 && (
                    <section>
                        <h3 className="cv-section-title-classic-main">Experiência Profissional</h3>
                        <div className="mt-4 space-y-5">
                            {data.workExperience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="cv-section-title-classic">{exp.role}</h4>
                                        <p className="cv-secondary-details">{exp.period}</p>
                                    </div>
                                    <p className="cv-body-text italic">{exp.company}</p>
                                    {exp.description && <p className="mt-2 cv-body-text text-justify">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {data.academicHistory && data.academicHistory.length > 0 && (
                    <section>
                        <h3 className="cv-section-title-classic-main">Formação Académica</h3>
                        <div className="mt-4 space-y-4">
                            {data.academicHistory.map((edu, index) => (
                                <div key={index}>
                                     <div className="flex justify-between items-baseline">
                                        <h4 className="cv-section-title-classic">{edu.degree}</h4>
                                        <p className="cv-secondary-details">{edu.year}</p>
                                    </div>
                                    <p className="cv-body-text italic">{edu.institution}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {data.skills && data.skills.length > 0 && (
                    <section>
                        <h3 className="cv-section-title-classic-main">Competências</h3>
                        <p className="mt-3 cv-body-text text-justify">
                            {data.skills.map(s => s.value).filter(Boolean).join(' • ')}
                        </p>
                    </section>
                )}
            </div>
            
            <style jsx global>{`
                .a4-page {
                    width: 210mm;
                    min-height: 297mm;
                    font-family: 'Times New Roman', serif;
                    line-height: 1.5;
                }
                .cv-name { font-size: 28pt !important; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
                .cv-section-title-classic { font-size: 13pt !important; font-weight: 700; }
                .cv-section-title-classic-main {
                    font-size: 13pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: hsl(var(--foreground));
                    letter-spacing: 0.15em;
                    text-align: center;
                    border-bottom: 1px solid #ccc;
                    border-top: 1px solid #ccc;
                    padding: 4px 0;
                }
                .cv-body-text { font-size: 11pt !important; }
                .cv-secondary-details { font-size: 12pt !important; }
            `}</style>
        </div>
    );
};
