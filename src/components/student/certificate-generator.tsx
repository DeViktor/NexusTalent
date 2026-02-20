'use client';

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { getCourseById } from "@/lib/course-service";
import type { Course } from "@/lib/types";
import { useEffect, useState } from "react";

interface CertificateGeneratorProps {
  courseId: string;
  grade: number;
}

// Extend jsPDF interface to include autoTable method for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Helper to fetch image and convert to base64
const toBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


export function CertificateGenerator({ courseId, grade }: CertificateGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentName, setStudentName] = useState<string>("Formando");
  const course = getCourseById(courseId);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const json = await res.json();
        if (!active) return;
        if (json?.ok && json?.user) {
          setStudentName(json.user.displayName || json.user.email || "Formando");
        } else {
          setStudentName("Formando");
        }
      } catch {
        if (active) setStudentName("Formando");
      }
    };
    loadSession();
    return () => { active = false; };
  }, []);

  const generatePdf = async () => {
    if (!course) {
        alert("Detalhes do curso não encontrados!");
        return;
    }
    setIsLoading(true);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const certNumber = `Nº: ${Date.now()}-${course.id.substring(0,4)}`;
    const validationUrl = `https://nexustalent.com/validate?cert=${certNumber}`;

    // --- Generate QR Code ---
    let qrCodeBase64 = '';
    try {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`;
        qrCodeBase64 = await toBase64(qrCodeUrl) as string;
    } catch (error) {
        console.error("Failed to generate QR code:", error);
    }

    // 1. Borders
    doc.setDrawColor(33, 150, 243); // Primary color
    doc.setLineWidth(2);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    doc.setLineWidth(0.5);
    doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

    // 2. Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 150, 243);
    doc.text("CONEXÃO ACADÊMICA", pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Formação e Consultoria", pageWidth / 2, 32, { align: 'center' });

    // 3. Main Title
    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 52, 98); // Dark blue color
    doc.text("CERTIFICADO", pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(14);
    doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 58, { align: 'center' });
    
    // 4. Main Body Text
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Este Certificado atesta que: (This is to certify that:)", pageWidth / 2, 75, { align: 'center' });
    
    // 5. Student Name
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(studentName.toUpperCase(), pageWidth / 2, 88, { align: 'center' });
    
    // 6. Course Conclusion Text
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Completou com sucesso o curso: (Has successfully completed the training course on:)", pageWidth / 2, 100, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(course.name.toUpperCase(), pageWidth / 2, 110, { align: 'center' });

    doc.setFontSize(10);
    const dates = "20.01.2025 a 24.01.2025";
    const location = course.format === 'Presencial' ? "no Centro de Formação Profissional Conexão Acadêmica em Luanda" : "em formato Online";
    const workload = `com carga horária de ${course.duration}.`;
    doc.text(`Realizado de ${dates} ${location}, ${workload}`, pageWidth / 2, 120, { align: 'center' });
    
    const locationEn = course.format === 'Presencial' ? 'at Conexão Acadêmica Training Center in Luanda' : 'in an Online format';
    doc.text(`Conducted from ${dates} ${locationEn} with a workload ${course.duration}.`, pageWidth / 2, 125, { align: 'center' });

    // --- Table ---
    const tableData = course.modules.map(module => [
      `${module.title.split(' / ')[0]}\n${module.title.split(' / ')[1] || ''}`,
      `${module.duration || 'N/A'}`
    ]);

    doc.autoTable({
        startY: 135,
        head: [['Módulos/Module', 'Carga Horária/Workload']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 52, 98], halign: 'center' },
        columnStyles: { 1: { halign: 'center' } },
        didParseCell: function (data) {
            if (data.section === 'head') {
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });
    
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Final text
    doc.setFontSize(10);
    const finalText1 = `Este curso foi conduzido pelo Centro de Formação Profissional Conexão Acadêmica realizado no período de 20 a 24 de Janeiro de 2025, com carga horária de ${course.duration}. Tendo obtido uma classificação final de ${grade}% numa escala de 0 a 100%.`;
    const finalText2 = `This course was conducted by the Conexão Acadêmica Professional Training Center held from January 20th to 24th, 2025, with a 30-hour workload. Having obtained a final rating of ${grade}% on a scale of 0 to 100%.`

    doc.text(doc.splitTextToSize(finalText1, pageWidth - 40), pageWidth / 2, finalY, { align: 'center', maxWidth: pageWidth - 40 });
    finalY += 15;
    doc.text(doc.splitTextToSize(finalText2, pageWidth - 40), pageWidth / 2, finalY, { align: 'center', maxWidth: pageWidth - 40 });

    finalY += 20;

    // Issue Date
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`(Emitido em: ${new Date().toLocaleDateString('pt-PT')})`, pageWidth / 2, finalY, { align: 'center' });


    // QR Code & Certificate Number
    const qrSize = 30;
    const qrX = 20;
    const qrY = pageHeight - 15 - qrSize;
    if (qrCodeBase64) {
        doc.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);
    } else {
        // Fallback placeholder if QR fails
        doc.setDrawColor(0);
        doc.rect(qrX, qrY, qrSize, qrSize);
        doc.setFontSize(8);
        doc.text("QR Code", qrX + qrSize/2, qrY + qrSize/2, {align: 'center'});
    }
    
    doc.setFontSize(9);
    doc.text(certNumber, qrX, qrY + qrSize + 5);
    doc.text("Valide o certificado aqui", qrX, qrY + qrSize + 9);


    // Signature Line
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("A Direção Pedagógica", pageWidth - 50, pageHeight - 25, { align: 'center' });

    setIsLoading(false);
    doc.save(`Certificado_${course.name.replace(/ /g, '_')}_${studentName.replace(/ /g, '_')}.pdf`);
  };

  return (
    <Button variant="default" size="sm" onClick={generatePdf} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />} 
      Emitir
    </Button>
  );
}
