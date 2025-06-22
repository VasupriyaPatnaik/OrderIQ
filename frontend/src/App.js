import { useState } from 'react';
import axios from 'axios';

function App() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setErrorMsg('⚠️ Please enter some text to extract');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post("http://localhost:8000/extract_from_text", {
        input_texts: [textInput.trim()],
      });
      setOutput(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to extract from text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileToUpload) => {
    if (!fileToUpload) {
      setErrorMsg("⚠️ Please select a file first.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await axios.post("http://localhost:8000/extract_from_image", formData);
      setOutput(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to extract from image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get("http://localhost:8000/download_excel", {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "OrderIQ_Output.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to download Excel file. Please try again.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleFileUpload(droppedFile);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '1200px' }}>
      <div className="text-center mb-5">
        <h1 className="text-primary mb-2" style={{ fontWeight: '700', fontSize: '2.5rem' }}>
          <span style={{ color: '#4a6bff' }}>Order</span>
          <span style={{ color: '#00c853' }}>IQ</span>
          <span className="ms-2" style={{ fontSize: '1.5rem' }}>🧠</span>
        </h1>
        <p className="text-muted fs-5">Smart Order Extraction from Email or Fax</p>
      </div>

      <div className="row g-4">
        {/* Text Input Section */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">
                <i className="bi bi-text-paragraph me-2"></i>Text Extraction
              </h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Paste your order text</label>
                <textarea
                  className="form-control"
                  rows={8}
                  style={{ resize: 'none' }}
                  placeholder={`Example:\n\nHi, please send 6 cartons of Bru Coffee to Hyderabad by 25th July 2025.\nCustomer: Ravi | Phone: 9876543210\nCompany: ABC Corp | Payment: COD\nRemarks: Urgent delivery required`}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <small className="text-muted d-block mt-1">
                  ✨ Separate multiple orders with a blank line
                </small>
              </div>
              <button 
                className="btn btn-primary w-100 py-2" 
                onClick={handleTextSubmit} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic me-2"></i>Extract from Text
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title text-primary mb-4">
                <i className="bi bi-image me-2"></i>Image Extraction
              </h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Upload fax/email image</label>
                <input
                  type="file"
                  className="form-control mb-3"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    handleFileUpload(e.target.files[0]);
                  }}
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border rounded-3 p-5 text-center ${
                    dragOver ? 'border-primary bg-light-primary' : 'border-light-subtle'
                  }`}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: dragOver ? 'rgba(74, 107, 255, 0.05)' : 'transparent'
                  }}
                >
                  <div className="mb-3" style={{ fontSize: '2rem' }}>
                    {dragOver ? '📤' : '📁'}
                  </div>
                  <h6 className="mb-1">
                    {dragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                  </h6>
                  <p className="text-muted small mb-0">
                    Supports JPG, PNG, or PDF files
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="alert alert-danger mt-4 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Results Section */}
      {Array.isArray(output) && output.length > 0 && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-primary">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              Extracted Order Details
            </h3>
            <button 
              className="btn btn-success d-flex align-items-center"
              onClick={handleDownloadExcel}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              Download Excel
            </button>
          </div>
          
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Address</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Company</th>
                      <th>Delivery Date</th>
                      <th>Payment</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {output.map((item, i) => (
                      <tr key={i}>
                        <td className="fw-semibold">{item.product || '-'}</td>
                        <td>{item.quantity || '-'}</td>
                        <td>{item.shipping_address || '-'}</td>
                        <td>{item.customer_name || '-'}</td>
                        <td>{item.phone || '-'}</td>
                        <td>{item.company || '-'}</td>
                        <td>{item.delivery_date || '-'}</td>
                        <td>
                          <span className={`badge ${item.payment_terms === 'COD' ? 'bg-warning text-dark' : 'bg-info'}`}>
                            {item.payment_terms || '-'}
                          </span>
                        </td>
                        <td>
                          {item.remarks ? (
                            <span className="badge bg-light text-dark">{item.remarks}</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-5 pt-4 text-center text-muted small border-top">
        <p>OrderIQ - Smart Order Processing System</p>
        <p className="mb-0">© {new Date().getFullYear()} All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;