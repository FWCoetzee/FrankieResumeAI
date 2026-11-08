/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyDownloadToken } from '@/lib/payments/store';
import { PdfService } from '@/lib/pdf/pdf-service';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Simple internal template for PDF generation
const ResumePdfTemplate = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{data.title || 'My Resume'}</Text>
        <Text style={styles.subtitle}>{data.email || 'Email not provided'}</Text>
      </View>
      <View style={styles.content}>
        <Text>{JSON.stringify(data.content, null, 2)}</Text>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: { margin: 40, fontFamily: 'Helvetica' },
  section: { marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 12, color: 'grey' },
  content: { fontSize: 10, lineHeight: 1.5 },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing download token.' }, { status: 400 });
  }

  const db = await getDb();

  try {
    // 1. Verify the token
    const paymentInfo = await verifyDownloadToken(db, token);
    if (!paymentInfo) {
      return NextResponse.json({ error: 'Invalid or expired download token. Payment required.' }, { status: 402 });
    }

    const { resumeId, ownerHash } = paymentInfo;

    // 2. Fetch the latest version of the resume
    const resumeRes = await db.query(
      `SELECT r.title, v.content 
       FROM resumes r
       JOIN resume_versions v ON r.current_version_id = v.id
       WHERE r.id = $1 AND r.owner_hash = $2`,
      [resumeId, ownerHash]
    );

    if (resumeRes.rows.length === 0) {
      return NextResponse.json({ error: 'Resume not found.' }, { status: 404 });
    }

    const resumeData = resumeRes.rows[0];
    const content = JSON.parse(resumeData.content);

    // 3. Generate the PDF
    const pdfBuffer = await PdfService.generatePdf({
      document: <ResumePdfTemplate data={{ ...resumeData, content }} />,
    });

    // 4. Mark as exported
    await db.query(
      `UPDATE public.payment_transactions 
       SET status = 'exported', updated_at = NOW() 
       WHERE resume_id = $1 AND owner_hash = $2 AND status = 'paid'`,
      [resumeId, ownerHash]
    );

    // 5. Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_${resumeId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
