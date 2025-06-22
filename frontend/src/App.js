import { useState } from 'react';
import axios from 'axios';

function App() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTextSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const inputLines = textInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const res = await axios.post("http://localhost:8000/extract_from_text", {
        input_texts: inputLines,
      });
      console.log("Text API Response:", res.data);
      setOutput(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to extract from text.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrorMsg("⚠️ Please select a file first.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/extract_from_image", formData);
      console.log("Image API Response:", res.data);
      setOutput(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Failed to extract from image.');
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
      setErrorMsg('❌ Failed to download Excel file.');
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-primary mb-4">📦 OrderIQ</h1>
      <p className="text-muted">Smart Order Extraction from Email or Fax</p>

      <div className="mb-4">
        <label className="form-label fw-semibold">📤 Paste Order Text</label>
        <textarea
          className="form-control"
          rows={6}
          placeholder={`e.g.\nHi, send 6 cartons of Bru Coffee to Hyderabad by 25th July 2025.\nCustomer: Ravi | Phone: 9876543210 | Company: ABC Corp | Payment: COD | Remarks: Urgent`}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleTextSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Extracting...
            </>
          ) : (
            'Extract from Text'
          )}
        </button>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">🖼️ Upload Fax Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="btn btn-success mt-2" onClick={handleFileUpload} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing...
            </>
          ) : (
            'Extract from Image'
          )}
        </button>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {Array.isArray(output) && output.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-3">✅ Extracted Order Details</h4>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Shipping Address</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Delivery Date</th>
                  <th>Payment Terms</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {output.map((item, i) => (
                  <tr key={i}>
                    <td>{item.product}</td>
                    <td>{item.quantity}</td>
                    <td>{item.shipping_address}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.phone}</td>
                    <td>{item.company}</td>
                    <td>{item.delivery_date}</td>
                    <td>{item.payment_terms}</td>
                    <td>{item.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-outline-primary mt-3" onClick={handleDownloadExcel}>
            ⬇️ Download Excel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
