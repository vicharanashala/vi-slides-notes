import nodemailer from 'nodemailer';

// Create transporter (will use environment variables)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

/**
 * Send grade notification email to student
 */
export const sendGradeNotification = async (
    studentEmail: string,
    studentName: string,
    assignmentTitle: string,
    marksObtained: number,
    maxMarks: number,
    feedback: string,
    teacherName: string
) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured. Skipping email notification.');
        return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const percentage = ((marksObtained / maxMarks) * 100).toFixed(2);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    background-color: #f5f7fb;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px;
                }
                .score-box {
                    background: #f0f4ff;
                    border-left: 4px solid #6366f1;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .score {
                    font-size: 32px;
                    font-weight: bold;
                    color: #6366f1;
                    margin: 10px 0;
                }
                .feedback-box {
                    background: #f8fafc;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer {
                    background: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .button {
                    display: inline-block;
                    background: #6366f1;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Assignment Graded</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${studentName}</strong>,</p>
                    <p>Your assignment <strong>"${assignmentTitle}"</strong> has been graded by ${teacherName}.</p>
                    
                    <div class="score-box">
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Your Score</div>
                        <div class="score">${marksObtained} / ${maxMarks}</div>
                        <div style="color: #6366f1; font-weight: 600; font-size: 18px;">Percentage: ${percentage}%</div>
                    </div>

                    ${feedback ? `
                        <div class="feedback-box">
                            <strong style="color: #334155;">Teacher's Feedback:</strong>
                            <p style="margin: 10px 0 0; color: #475569; line-height: 1.6;">${feedback}</p>
                        </div>
                    ` : ''}

                    <p style="margin-top: 30px;">You can view the full details in your Vi-SlideS dashboard.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/assignments" class="button">View Dashboard</a>
                </div>
                <div class="footer">
                    <p>This is an automated email from Vi-SlideS Learning Platform</p>
                    <p>© ${new Date().getFullYear()} Vi-SlideS. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Vi-SlideS" <${process.env.SMTP_USER}>`,
            to: studentEmail,
            subject: `Assignment Graded - ${assignmentTitle}`,
            html: htmlContent
        });

        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, message: 'Failed to send email', error };
    }
};

/**
 * Send session invitation email to student
 */
export const sendSessionInvitation = async (
    studentEmail: string,
    studentName: string,
    sessionTitle: string,
    sessionCode: string,
    joinUrl: string,
    teacherName: string,
) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured. Skipping email notification.');
        return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    try {
        await transporter.verify();
    } catch (verifyError) {
        console.error('SMTP transporter verification failed:', verifyError);
        return { success: false, message: 'Failed to verify SMTP transport', error: verifyError };
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    background-color: #f5f7fb;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px;
                }
                .session-box {
                    background: #f0f4ff;
                    border-left: 4px solid #6366f1;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #6366f1;
                    margin: 10px 0;
                    letter-spacing: 2px;
                }
                .footer {
                    background: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #64748b;
                }
                .button {
                    display: inline-block;
                    background: #6366f1;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 New Session Available</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${studentName}</strong>,</p>
                    <p>${teacherName} has created a new interactive session for you!</p>
                    <div class="session-box">
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Session Title</div>
                        <div style="font-size: 18px; font-weight: 600; color: #1e293b;">${sessionTitle}</div>
                        <div style="color: #64748b; font-size: 14px; margin: 10px 0 5px;">Session Code</div>
                        <div class="code">${sessionCode}</div>
                    </div>
                    <p>You can join the session using the code above or by scanning the QR code in your dashboard.</p>

                    <!-- ✅ FIXED HERE -->
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${sessionCode}" class="button">
                        Join Session
                    </a>

                </div>
                <div class="footer">
                    <p>This is an automated email from Vi-SlideS Learning Platform</p>
                    <p>© ${new Date().getFullYear()} Vi-SlideS. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        console.log(`Session invitation: sending to ${studentEmail} for session code ${sessionCode}`);
        const info = await transporter.sendMail({
            from: `"Vi-SlideS" <${process.env.SMTP_USER}>`,
            to: studentEmail,
            subject: `New Session: ${sessionTitle}`,
            html: htmlContent,
        });

        console.log('Session invitation email sent:', { studentEmail, messageId: info.messageId });

        return { success: true, message: 'Session invitation sent successfully', info };
    } catch (error) {
        console.error('Session invitation email failed:', error);
        return { success: false, message: 'Failed to send session invitation', error };
    }
};
export const sendCertificateEmail = async (
    studentEmail: string,
    studentName: string,
    sessionTitle: string,
    sessionCode: string,
    date: string,
    teacherName: string
) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured.');
        return;
    }

    const transporter = createTransporter();

    const htmlContent = `
    <div style="font-family: Arial; background:#1e1e2e; padding:20px;">
        <div style="max-width:600px;margin:auto;border:2px solid gold;padding:30px;border-radius:12px;color:white;background:linear-gradient(135deg,#1e1e2e,#28283c)">
            <div style="border:1px solid rgba(255,215,0,0.3);padding:20px;border-radius:8px;text-align:center;">
                
                <div style="font-size:40px;">🎓</div>

                <h2 style="color:gold;letter-spacing:2px;">
                    CERTIFICATE OF PARTICIPATION
                </h2>

                <p>This certifies that</p>

                <h1 style="font-family:cursive;">
                    ${studentName}
                </h1>

                <p>Has successfully participated in:</p>

                <h3 style="color:#a5b4fc;">${sessionTitle}</h3>
                <p>Session Code: ${sessionCode}</p>

                <table style="width:100%;margin-top:30px;text-align:center;color:white;">
    <tr>
        <td>
            <small style="opacity:0.7;">Date</small>
            <p style="margin:5px 0;">${new Date(date).toLocaleDateString()}</p>
        </td>
        <td>
            <small style="opacity:0.7;">Instructor</small>
            <p style="margin:5px 0;">${teacherName}</p>
        </td>
    </tr>
</table>
    
            </div>
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: `"Vi-SlideS" <${process.env.SMTP_USER}>`,
        to: studentEmail,
        subject: `🎓 Certificate - ${sessionTitle}`,
        html: htmlContent
    });
};