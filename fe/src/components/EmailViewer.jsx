import { useEffect, useState } from "react";
import { useEmailStore } from "../store/useEmailStore";
import { Trash2 } from "lucide-react";
import DeleteConfirmationModal from "./skeletons/DeleteConfirmationModal";
const EmailViewer = () => {
  const { selectedEmail, getEmailById, deleteEmail, isEmailLoading } = useEmailStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const replaceImageSources = (html, email) => {
    if (!email || !email.attachments || email.attachments.length === 0) {
      return html;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.getElementsByTagName('img');
    const attachment = email.attachments[0];
    
    for (let img of images) {
      const originalSrc = img.getAttribute('src');

      if (attachment && attachment.url) {
        img.setAttribute('src', attachment.url);
      }
    }
    const resultHtml = doc.body.innerHTML;
    return resultHtml;
  };



  useEffect(() => {
    if (selectedEmail && !selectedEmail.html) {
      getEmailById(selectedEmail._id);
    }
  }, [selectedEmail, getEmailById]);

  if (!selectedEmail) return <div className="p-5 text-center">Select an email to view</div>;
  if (isEmailLoading) return <div className="p-5 text-center">Loading...</div>;
  if (!selectedEmail || !selectedEmail.attachments) {
    return <div className="p-5 text-center">Loading email data...</div>;
  }

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteEmail(selectedEmail._id);
    setShowDeleteModal(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-5 h-full flex flex-col items-center max-w-3xl mx-auto">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{selectedEmail.subject}</h2>
        <button
          onClick={handleDelete}
          className="btn btn-ghost btn-circle"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
      <div className="w-full mb-4">
        <p><strong>From:</strong> {selectedEmail.from}</p>
        <p><strong>To:</strong> {selectedEmail.to}</p>
        <p><strong>Date:</strong> {new Date(selectedEmail.receivedAt).toLocaleString()}</p>
      </div>
      <div className="flex-grow w-full overflow-hidden">
        {selectedEmail.html ? (
          <div className="overflow-auto max-h-[calc(100vh-300px)] border border-base-300 rounded-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: replaceImageSources(selectedEmail.html, selectedEmail) }} />
          </div>
        ) : (
          <div className="text-center">{selectedEmail.text}</div>
        )}
      </div>

      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
        <div className="w-full mt-4">
          <h3 className="text-lg font-semibold mb-2">Attachments:</h3>
          <ul className="list-disc pl-5">
            {selectedEmail.attachments.map((attachment) => (
              <li key={attachment._id}>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attachment.filename} ({formatFileSize(attachment.size)})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EmailViewer;