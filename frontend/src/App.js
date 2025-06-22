import { useState } from 'react';
import axios from 'axios';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [extractionType, setExtractionType] = useState(null);

  const clearInputs = () => {
    setTextInput('');
    setFile(null);
    setFileName('');
  };

  // Home Page Component
  const HomePage = () => (
    <div className="text-center py-5 my-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%)', borderRadius: '20px' }}>
      <div className="mb-5 px-4">
        <h1 className="mb-3" style={{ 
          fontWeight: '800', 
          fontSize: '3.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span style={{ color: '#4a6bff' }}>Order</span>
          <span style={{ color: '#00c853' }}>IQ📦</span>
        </h1>
        <p className="lead text-muted mb-4" style={{ fontSize: '1.25rem' }}>
          AI-powered order extraction from emails and faxes
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button 
            className="btn btn-primary btn-lg px-5 py-3 shadow"
            onClick={() => setCurrentPage('selection')}
            style={{
              background: 'linear-gradient(135deg, #4a6bff 0%, #00a8ff 100%)',
              border: 'none',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}
          >
            <i className="bi bi-lightning-fill me-2"></i>Get Started
          </button>
          <button className="btn btn-outline-primary btn-lg px-5 py-3 shadow" style={{ fontWeight: '600' }}>
            <i className="bi bi-info-circle-fill me-2"></i>Learn More
          </button>
        </div>
      </div>
      
      <div className="row g-4 mt-5 px-4">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-scale" style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}>
            <div className="card-body py-4">
              <div className="text-primary mb-3" style={{ fontSize: '2.5rem', color: '#4a6bff' }}>
                <i className="bi bi-text-paragraph"></i>
              </div>
              <h5 style={{ color: '#4a6bff' }}>✍️ Text Extraction</h5>
              <p className="text-muted">Extract order details from email text with AI precision</p>
              <div className="mt-3" style={{ 
                height: '4px', 
                background: 'linear-gradient(90deg, rgba(74, 107, 255, 0.2), rgba(0, 168, 255, 0.2))',
                borderRadius: '2px'
              }}></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-scale" style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}>
            <div className="card-body py-4">
              <div className="text-primary mb-3" style={{ fontSize: '2.5rem', color: '#00c853' }}>
                <i className="bi bi-image"></i>
              </div>
              <h5 style={{ color: '#00c853' }}>🖼️ Image Extraction</h5>
              <p className="text-muted">Process fax images to extract order information</p>
              <div className="mt-3" style={{ 
                height: '4px', 
                background: 'linear-gradient(90deg, rgba(0, 200, 83, 0.2), rgba(0, 230, 118, 0.2))',
                borderRadius: '2px'
              }}></div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm hover-scale" style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}>
            <div className="card-body py-4">
              <div className="text-primary mb-3" style={{ fontSize: '2.5rem', color: '#ff6b6b' }}>
                <i className="bi bi-file-earmark-excel"></i>
              </div>
              <h5 style={{ color: '#ff6b6b' }}>📊 Excel Export</h5>
              <p className="text-muted">Download structured data ready for your ERP system</p>
              <div className="mt-3" style={{ 
                height: '4px', 
                background: 'linear-gradient(90deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 142, 0.2))',
                borderRadius: '2px'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Selection Page Component
  const SelectionPage = () => (
    <div className="text-center py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%)', borderRadius: '20px', minHeight: '70vh' }}>
      <h2 className="mb-5" style={{ 
        fontWeight: '700',
        background: 'linear-gradient(135deg, #4a6bff 0%, #00c853 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Choose Extraction Method
      </h2>
      <div className="row justify-content-center g-4 px-4">
        <div className="col-md-5">
          <div 
            className="card h-100 cursor-pointer hover-scale shadow-sm" 
            onClick={() => {
              setExtractionType('text');
              setCurrentPage('extraction');
              clearInputs();
            }}
            style={{ 
              transition: 'transform 0.3s, box-shadow 0.3s',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
              border: 'none'
            }}
          >
            <div className="card-body py-5">
              <div className="mb-3" style={{ fontSize: '3.5rem', color: '#4a6bff' }}>
                <i className="bi bi-text-paragraph"></i>
              </div>
              <h3 style={{ color: '#4a6bff' }}>✍️ Text Extraction</h3>
              <p className="text-muted">Paste email or order text</p>
              <button className="btn btn-outline-primary mt-3 px-4 shadow-sm" style={{ 
                background: 'rgba(74, 107, 255, 0.1)',
                borderColor: '#4a6bff',
                color: '#4a6bff',
                fontWeight: '500'
              }}>
                Select <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <div 
            className="card h-100 cursor-pointer hover-scale shadow-sm" 
            onClick={() => {
              setExtractionType('image');
              setCurrentPage('extraction');
              clearInputs();
            }}
            style={{ 
              transition: 'transform 0.3s, box-shadow 0.3s',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
              border: 'none'
            }}
          >
            <div className="card-body py-5">
              <div className="mb-3" style={{ fontSize: '3.5rem', color: '#00c853' }}>
                <i className="bi bi-image"></i>
              </div>
              <h3 style={{ color: '#00c853' }}>🖼️ Image Extraction</h3>
              <p className="text-muted">Upload fax or image</p>
              <button className="btn btn-outline-success mt-3 px-4 shadow-sm" style={{ 
                background: 'rgba(0, 200, 83, 0.1)',
                borderColor: '#00c853',
                color: '#00c853',
                fontWeight: '500'
              }}>
                Select <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <button 
        className="btn btn-link mt-5" 
        onClick={() => setCurrentPage('home')}
        style={{ color: '#4a6bff', fontWeight: '500' }}
      >
        <i className="bi bi-arrow-left me-2"></i>Back to Home
      </button>
    </div>
  );

  // Extraction Page Component
  const ExtractionPage = () => {
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
        clearInputs();
        setCurrentPage('results');
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
        clearInputs();
        setCurrentPage('results');
      } catch (err) {
        console.error(err);
        setErrorMsg('❌ Failed to extract from image. Please try again.');
      } finally {
        setLoading(false);
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
        setFileName(droppedFile.name);
      }
    };

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      }
    };

    return (
      <div className="py-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%)', borderRadius: '20px', minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <button 
            className="btn btn-link mb-4" 
            onClick={() => setCurrentPage('selection')}
            style={{ color: '#4a6bff', fontWeight: '500' }}
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Selection
          </button>
          
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="card-title mb-4" style={{ 
                fontWeight: '600',
                color: extractionType === 'text' ? '#4a6bff' : '#00c853'
              }}>
                {extractionType === 'text' ? (
                  <><i className="bi bi-text-paragraph me-2"></i>✍️ Text Extraction</>
                ) : (
                  <><i className="bi bi-image me-2"></i>🖼️ Image Extraction</>
                )}
              </h3>
              
              {extractionType === 'text' ? (
                <div className="mb-3">
                  <div className="alert alert-info mb-3" style={{ borderLeft: '4px solid #4a6bff' }}>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Pro Tip:</strong> Separate multiple orders with a blank line
                  </div>
                  <label className="form-label fw-semibold">Paste your order text</label>
                  <textarea
                    className="form-control"
                    rows={8}
                    style={{ resize: 'none', border: '2px solid #e9ecef' }}
                    placeholder={`Enter your text....`}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary w-100 mt-3 py-3 shadow"
                    onClick={handleTextSubmit} 
                    disabled={loading || !textInput.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #4a6bff 0%, #00a8ff 100%)',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>Extract Order Data
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Upload fax/email image</label>
                  
                  {/* Updated file input with custom styling */}
                  <div className="position-relative mb-3">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      style={{
                        border: '2px solid #e9ecef',
                        padding: '0.375rem 0.75rem',
                        height: 'calc(2.25rem + 4px)',
                        opacity: 0,
                        position: 'absolute',
                        zIndex: 2,
                        cursor: 'pointer'
                      }}
                      key={fileName || 'file-input'}
                    />
                    <div className="d-flex align-items-center" style={{
                      border: '2px solid #e9ecef',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#fff',
                      height: 'calc(2.25rem + 4px)'
                    }}>
                      <button 
                        className="btn btn-sm btn-outline-secondary me-2" 
                        style={{ pointerEvents: 'none' }}
                      >
                        Choose File
                      </button>
                      <span className="text-muted small">
                        {fileName || 'No file chosen'}
                      </span>
                      {fileName && (
                        <button 
                          className="btn btn-sm btn-link ms-auto text-danger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFile(null);
                            setFileName('');
                          }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
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
                      backgroundColor: dragOver ? 'rgba(0, 200, 83, 0.05)' : 'transparent',
                      border: dragOver ? '2px dashed #00c853' : '2px dashed #adb5bd'
                    }}
                  >
                    <div className="mb-3" style={{ fontSize: '2.5rem', color: dragOver ? '#00c853' : '#6c757d' }}>
                      {dragOver ? '📤' : '📁'}
                    </div>
                    <h6 className="mb-1" style={{ color: dragOver ? '#00c853' : '#495057' }}>
                      {dragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                    </h6>
                    <p className="text-muted small mb-0">
                      Supports JPG and PNG files
                    </p>
                  </div>
                  <button 
                    className="btn btn-success w-100 mt-3 py-3 shadow"
                    onClick={() => file && handleFileUpload(file)} 
                    disabled={loading || !file}
                    style={{
                      background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      opacity: file ? 1 : 0.7
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>Extract Order Data
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {errorMsg && (
                <div className="alert alert-danger mt-3 d-flex align-items-center" role="alert" style={{ border: 'none' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{errorMsg}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Results Page Component
  const ResultsPage = () => {
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

    return (
      <div className="py-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%)', borderRadius: '20px' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              className="btn btn-link" 
              onClick={() => {
                clearInputs();
                setCurrentPage('extraction');
              }}
              style={{ color: '#4a6bff', fontWeight: '500' }}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Input
            </button>
            <button 
              className="btn btn-success d-flex align-items-center shadow"
              onClick={handleDownloadExcel}
              style={{
                background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
                border: 'none',
                fontWeight: '600'
              }}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              Download Excel
            </button>
          </div>
          
          <div className="card shadow-lg border-0">
            <div className="card-header bg-white" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <h4 className="mb-0" style={{ color: '#4a6bff', fontWeight: '600' }}>
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                Extracted Order Details
              </h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table table-hover mb-0">
                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ color: '#4a6bff', minWidth: '150px' }}>Product Name</th>
                      <th style={{ color: '#4a6bff', minWidth: '80px' }}>Quantity</th>
                      <th style={{ color: '#4a6bff', minWidth: '200px' }}>Shipping Address</th>
                      <th style={{ color: '#4a6bff', minWidth: '150px' }}>Customer Name</th>
                      <th style={{ color: '#4a6bff', minWidth: '120px' }}>Phone Number</th>
                      <th style={{ color: '#4a6bff', minWidth: '150px' }}>Company Name</th>
                      <th style={{ color: '#4a6bff', minWidth: '120px' }}>Delivery Date</th>
                      <th style={{ color: '#4a6bff', minWidth: '120px' }}>Payment Mode</th>
                      <th style={{ color: '#4a6bff', minWidth: '150px' }}>Remarks</th>
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
          
          {/* Enhanced Features Section */}
          <div className="row mt-4 g-3">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                border: '1px solid rgba(74, 107, 255, 0.2)'
              }}>
                <div className="card-body text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <i className="bi bi-graph-up text-primary" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="card-title" style={{ color: '#4a6bff' }}>Order Analytics</h5>
                  <p className="text-muted">View statistics and trends from your extracted orders</p>
                  <button className="btn btn-sm btn-primary px-4 shadow-sm mt-2">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                border: '1px solid rgba(0, 200, 83, 0.2)'
              }}>
                <div className="card-body text-center">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <i className="bi bi-save text-success" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="card-title" style={{ color: '#00c853' }}>Save to Database</h5>
                  <p className="text-muted">Store this extraction for future reference</p>
                  <button className="btn btn-sm btn-success px-4 shadow-sm mt-2">
                    Save Orders
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                border: '1px solid rgba(255, 107, 107, 0.2)'
              }}>
                <div className="card-body text-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <i className="bi bi-share text-danger" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="card-title" style={{ color: '#ff6b6b' }}>Share Results</h5>
                  <p className="text-muted">Send these results to your team members</p>
                  <button className="btn btn-sm btn-danger px-4 shadow-sm mt-2">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="container-fluid px-4" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4f0ff 100%)',
      minHeight: '100vh'
    }}>
      <div className="container py-4" style={{ maxWidth: '1400px' }}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'selection' && <SelectionPage />}
        {currentPage === 'extraction' && <ExtractionPage />}
        {currentPage === 'results' && <ResultsPage />}
        
        <footer className="mt-5 pt-4 text-center text-muted small">
          <p style={{ color: '#4a6bff', fontWeight: '500' }}>OrderIQ - AI-powered Order Processing System</p>
          <p className="mb-0" style={{ color: '#6c757d' }}>© {new Date().getFullYear()} All rights reserved</p>
        </footer>
      </div>
    </div>
  );
}

export default App;