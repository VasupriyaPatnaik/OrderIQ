import { useState } from 'react';
import axios from 'axios';

function App() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState([]);

  const handleTextSubmit = async () => {
    const res = await axios.post("http://localhost:8000/extract_from_text", {
      input_text: textInput,
    });
    setOutput(res.data.data);
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:8000/extract_from_image", formData);
    setOutput(res.data.data);
  };

  return (
    <div className="container my-5">
      <h1 className="text-primary mb-4">OrderIQ</h1>
      <p className="text-muted">Smart Order Extraction from Email or Fax</p>

      <div className="mb-3">
        <label className="form-label">Paste Order Text</label>
        <textarea
          className="form-control"
          rows={5}
          placeholder="e.g. Send 5 packs of Amul Butter to Mumbai"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
      </div>

      <button className="btn btn-primary me-3" onClick={handleTextSubmit}>
        Extract from Text
      </button>

      <div className="mt-4 mb-3">
        <label className="form-label">Upload Fax Image</label>
        <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn-success mt-2" onClick={handleFileUpload}>
          Extract from Image
        </button>
      </div>

      {output.length > 0 && (
        <div className="mt-5">
          <h4>Extracted Data</h4>
          <table className="table table-bordered mt-3">
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
        </div>
      )}
    </div>
  );
}

export default App;
