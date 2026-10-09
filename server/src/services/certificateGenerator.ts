import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export interface CertificateData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  teacherName: string;
  completionDate: Date;
  verificationUrl: string;
}

export const generateCertificatePDF = async (
  data: CertificateData
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const certificatesDir = path.resolve(__dirname, '../../uploads/certificates');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const fileName = `${data.certificateId}.pdf`;
      const filePath = path.join(certificatesDir, fileName);
      const relativeUrl = `/uploads/certificates/${fileName}`;

      // Create PDF in Landscape A4 (842 x 595 pt)
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 40,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const width = doc.page.width;
      const height = doc.page.height;

      // Background styling
      doc.rect(0, 0, width, height).fill('#f8fafc');

      // Outer border (Navy/Indigo)
      doc
        .lineWidth(4)
        .strokeColor('#4338ca')
        .rect(30, 30, width - 60, height - 60)
        .stroke();

      // Inner border (Gold/Amber)
      doc
        .lineWidth(1.5)
        .strokeColor('#f59e0b')
        .rect(38, 38, width - 76, height - 76)
        .stroke();

      // Decorative corner accents
      const cornerSize = 15;
      const corners = [
        [38, 38],
        [width - 38 - cornerSize, 38],
        [38, height - 38 - cornerSize],
        [width - 38 - cornerSize, height - 38 - cornerSize],
      ];
      corners.forEach(([x, y]) => {
        doc.rect(x, y, cornerSize, cornerSize).fill('#fef3c7');
      });

      // EduGo Brand Header
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#4338ca')
        .text('EDUGO', 0, 75, { align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#64748b')
        .text('LEARN ON THE MOVE', 0, 102, { align: 'center', characterSpacing: 2 });

      // Title
      doc
        .font('Helvetica-Bold')
        .fontSize(30)
        .fillColor('#1e293b')
        .text('CERTIFICATE OF COMPLETION', 0, 140, { align: 'center', characterSpacing: 1.5 });

      // Presentation text
      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor('#64748b')
        .text('This is proudly presented to', 0, 190, { align: 'center' });

      // Student Name
      doc
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor('#4338ca')
        .text(data.studentName, 0, 220, { align: 'center' });

      // Underline accent
      const nameWidth = doc.widthOfString(data.studentName);
      const startX = (width - nameWidth) / 2;
      doc
        .moveTo(startX - 20, 260)
        .lineTo(startX + nameWidth + 20, 260)
        .lineWidth(2)
        .strokeColor('#f59e0b')
        .stroke();

      // Course text
      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor('#475569')
        .text('for successfully completing all required modules and learning milestones of', 0, 280, {
          align: 'center',
        });

      // Course Title
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#0f172a')
        .text(data.courseTitle, 0, 310, { align: 'center' });

      // Instructor line
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#64748b')
        .text(`Instructed by ${data.teacherName}`, 0, 345, { align: 'center' });

      // Date formatted
      const formattedDate = new Date(data.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Bottom Metadata Columns
      const bottomY = height - 130;

      // Column 1: Date Issued
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1e293b')
        .text('DATE ISSUED', 90, bottomY);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#64748b')
        .text(formattedDate, 90, bottomY + 16);

      // Column 2: Instructor Signature line
      doc
        .moveTo(width / 2 - 80, bottomY + 10)
        .lineTo(width / 2 + 80, bottomY + 10)
        .lineWidth(1)
        .strokeColor('#cbd5e1')
        .stroke();
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Instructor: ${data.teacherName}`, width / 2 - 80, bottomY + 16, {
          width: 160,
          align: 'center',
        });

      // Column 3: Verification info
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1e293b')
        .text('CERTIFICATE ID', width - 260, bottomY);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#4338ca')
        .text(data.certificateId, width - 260, bottomY + 16);
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#64748b')
        .text(`Verify: ${data.verificationUrl}`, width - 260, bottomY + 34, { width: 200 });

      // Seal Badge in middle bottom
      doc
        .circle(width / 2, height - 60, 18)
        .fillAndStroke('#fef3c7', '#f59e0b');
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor('#b45309')
        .text('VERIFIED', width / 2 - 18, height - 64, { width: 36, align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(relativeUrl);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
