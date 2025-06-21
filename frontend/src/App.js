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
      const res = await axios.post("http://localhost:8000/extract_from_text", {
        input_text: textInput,
      });
      setOutput(res.data.data);
    } catch (err) {
      setErrorMsg('Failed to extract from text.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setErrorMsg("Please select a file first.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/extract_from_image", formData);
      setOutput(res.data.data);
    } catch (err) {
      setErrorMsg('Failed to extract from image.');
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
      link.setAttribute("download", "structured_output.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErrorMsg('Failed to download Excel file.');
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
          rows={4}
          placeholder="e.g. Send 5 packs of Amul Butter to Mumbai"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleTextSubmit} disabled={loading}>
          {loading ? "Extracting..." : "Extract from Text"}
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
          {loading ? "Processing..." : "Extract from Image"}
        </button>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {output.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-3">✅ Extracted Data</h4>
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {output.map((item, i) => (
                <tr key={i}>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>{item.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-outline-primary" onClick={handleDownloadExcel}>
            ⬇️ Download Excel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
