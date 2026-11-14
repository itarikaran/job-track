import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { companyService } from "../services/companyService";
import { Toast } from "../components/ui/Toast";

const COMPANY_TYPES = ["Product","Service","Consulting","Startup","MNC","Other"];

export default function EditCompany() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [formData, setFormData] = useState({name:"",district:"",address:"",additionalAddress:"",website:"",contactPerson:"",contactNumber:"",email:"",companyType:"Other",notes:""});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    companyService.getCompany(id).then(r => setFormData(p => ({ ...p, ...(r.data || {}) }))).catch((err) => setServerError(err.response?.data?.message || "Failed to load company")).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const {name,value} = e.target;
    setFormData(p=>({...p,[name]:value}));
    if(errors[name]) setErrors(p=>{const n={...p};delete n[name];return n;});
    setServerError("");
  };
  const validate = () => {
    const n={};
    if(!formData.name.trim())n.name="Company name is required";
    if(!formData.district.trim())n.district="District is required";
    if(formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))n.email="Invalid email";
    setErrors(n);
    return Object.keys(n).length===0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!validate())return;
    setLoading(true);setServerError("");
    try{
      await companyService.updateCompany(id, formData);
      setToast({type:"success",message:"Company updated successfully"});
      setTimeout(()=>navigate("/companies"),1500);
    }catch(err){setServerError(err.response?.data?.message || "Failed to update company");}
    finally{setLoading(false);}
  };
  if(loading) return (<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-600">Loading company...</p></div></div>);
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Toast toast={toast} onRemove={()=>setToast(null)}/>
        <div className="mb-6"><Link to="/companies" className="text-indigo-600 hover:underline">← Back to Companies</Link></div>
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Edit Company</h1>
          {serverError && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100 text-sm">{serverError}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label><input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name?"w-full px-3 py-2 border border-red-500 rounded-md focus:ring-red-500":"w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"}/>{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}</div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">District <span className="text-red-500">*</span></label><select name="district" value={formData.district} onChange={handleChange} className={errors.district?"w-full px-3 py-2 border border-red-500 rounded-md focus:ring-red-500":"w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"}>
                <option value="">Select District</option><option value="Colombo">Colombo</option><option value="Gampaha">Gampaha</option><option value="Kalutara">Kalutara</option><option value="Kandy">Kandy</option><option value="Galle">Galle</option><option value="Jaffna">Jaffna</option><option value="Other">Other</option>
              </select>{errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}</div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Additional Address / Branch Details</label><input type="text" name="additionalAddress" value={formData.additionalAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Website</label><input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={errors.email?"w-full px-3 py-2 border border-red-500 rounded-md focus:ring-red-500":"w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"}/>{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}</div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Type</label><select name="companyType" value={formData.companyType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">{COMPANY_TYPES.map(t=> <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"/></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={()=>navigate("/companies")} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors">{loading?"Updating...":"Update Company"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
