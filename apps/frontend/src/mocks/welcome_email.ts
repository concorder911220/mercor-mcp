export interface EmailTemplate {
  to: string;
  subject: string;
  content: string;
}

export const welcomeEmailTemplate: EmailTemplate = {
  to: 'linda.mock@gmail.com',
  subject: 'Welcome to Acacia Accounting – Please Complete Your Client Organizer',
  content: `
<p>Dear Linda,</p>
<br>
<p>Welcome to Acacia Accounting! I'm delighted to have the opportunity to assist you with your tax preparation this year.</p>
<br>
<p>To get started, please complete the Client Organizer, which helps us identify the documents and information needed to prepare your return accurately and efficiently.</p>
<br>
<p>You'll find your personalized organizer inside the secure Dropbox folder linked below:</p>
<br>
<p>👉 Access Your Client Organizer</p>
<br>
<p>Once you've filled it in, you can upload the completed organizer and your supporting documents back into the same Dropbox folder.</p>
<br>
<p>If you have any questions as you go through the organizer, don't hesitate to reach out—I'm here to help.</p>
<br>
<p>Thank you for choosing Acacia Accounting. I look forward to working with you.</p>
<br>
<p>Warm regards,<br>
Joe Smith<br>
Acacia Accounting</p>
  `.trim()
};

export const followUpEmailTemplate: EmailTemplate = {
  to: 'john.doe@email.com',
  subject: 'Follow-up: Outstanding Tax Documents Required',
  content: `
<p>Dear John,</p>
<br>
<p>I hope this message finds you well.</p>
<br>
<p>I wanted to follow up regarding your tax preparation. We're still missing a few important documents to complete your return.</p>
<br>
<p>Outstanding items:</p>
<ul>
<li>W-2 forms from all employers</li>
<li>1099 forms (if applicable)</li>
<li>Receipts for charitable donations</li>
</ul>
<br>
<p>Please upload these documents to your secure Dropbox folder at your earliest convenience.</p>
<br>
<p>If you have any questions or need assistance locating these documents, please don't hesitate to reach out.</p>
<br>
<p>Best regards,<br>
Joe Smith<br>
Acacia Accounting</p>
  `.trim()
};

export const completionEmailTemplate: EmailTemplate = {
  to: 'sarah.client@domain.com',
  subject: 'Your Tax Return is Ready for Review',
  content: `
<p>Dear Sarah,</p>
<br>
<p>Great news! Your tax return has been completed and is ready for your review.</p>
<br>
<p>Please review the following:</p>
<ul>
<li>Tax return summary</li>
<li>Refund/payment amount</li>
<li>Key deductions claimed</li>
</ul>
<br>
<p>You can access your completed return in the secure portal link below:</p>
<br>
<p>👉 Review Your Tax Return</p>
<br>
<p>Once you've reviewed everything and are satisfied, please let me know so we can proceed with filing.</p>
<br>
<p>Thank you for your business!</p>
<br>
<p>Best regards,<br>
Joe Smith<br>
Acacia Accounting</p>
  `.trim()
};

export const reminderEmailTemplate: EmailTemplate = {
  to: 'michele.herbert@gmail.com',
  subject: 'Action Needed – Missing & Incorrect Tax Documents',
  content: `
<p>Dear Michele,</p>
<br>
<p>Thank you for uploading your tax documents to Acacia Accounting. We've reviewed your submission and noticed the following items require your attention to ensure quick and accurate processing of your return:</p>
<br>
<p><strong>1099-DIV (Schwab):</strong> The document uploaded is for the wrong tax year and needs to be re-uploaded.</p>
<br>
<p><strong>1098 (Mortgage Interest):</strong> This required document has not yet been received.</p>
<br>
<p>To proceed, please upload the corrected 1099-DIV for the current tax year and your mortgage interest statement to your secure Dropbox folder at the link below:</p>
<br>
<p>👉 Access Your Dropbox Folder</p>
<br>
<p>Once these documents are uploaded, we'll be able to continue preparing your return without delay.</p>
<br>
<p>If you have any questions about which documents are needed or how to upload them, feel free to reach out—I'm happy to help.</p>
<br>
<p>Best regards,<br>
Joe Smith<br>
Acacia Accounting</p>
  `.trim()
};

export const requestForDocsEmailTemplate: EmailTemplate = {
  to: 'sara.randall@email.com',
  subject: 'Quick Follow-up on Your Tax Documents 📋',
  content: `
<p>Hi Sara,</p>
<br>
<p>I hope you're having a great week! I wanted to reach out with a quick update on your tax preparation.</p>
<br>
<p>I've been reviewing the documents you've uploaded so far, and I'm excited to get your return filed as soon as possible. However, I noticed we're missing a couple of pieces that will help us maximize your deductions and ensure everything is accurate.</p>
<br>
<p><strong>Here's what I need from you:</strong></p>
<ul>
<li><strong>Form 1098 (Mortgage Interest Statement):</strong> I don't see this one in your folder yet, but it's really important for your mortgage interest deduction. Your lender should have this ready for you by now.</li>
<li><strong>1099-Composite from Vanguard:</strong> I see you uploaded one, but it looks like it's from 2023 instead of 2024. No worries – this happens all the time! We just need the current year's version.</li>
</ul>
<br>
<p>Both of these documents are typically available in your online accounts, so it should be pretty quick to grab them. Once you have them, just pop them into your Dropbox folder:</p>
<br>
<p>👉 <strong>Upload Your Documents Here</strong></p>
<br>
<p>I know tax season can feel overwhelming, but you're doing great! These two documents will help us make sure you're getting every deduction you're entitled to, especially that mortgage interest – it can really add up.</p>
<br>
<p>If you run into any trouble finding these documents or have questions, just give me a call or reply to this email. I'm here to help make this as smooth as possible for you.</p>
<br>
<p>Thanks so much, Sara! Looking forward to getting your return completed soon.</p>
<br>
<p>Warm regards,<br>
Joe Smith<br>
Acacia Accounting<br>
📞 (555) 123-4567</p>
  `.trim()
};