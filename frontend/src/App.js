import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TemplateList from './components/TemplateList/TemplateList.js';
import TemplateDetail from './components/TemplateDetails/TemplateDetail.js';
import SideBar from './components/SideBar/SideBar.js';
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";
import axios from 'axios';


function App() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  const fetchTemplates = async () => {
    try {
      const templatesResponse = await axios.get('/api/templates');
      const fieldsResponse = await axios.get('/api/template-fields');

      const fieldsByTemplateId = fieldsResponse.data.reduce((acc, field) => {
        acc[field.templateId] = acc[field.templateId] || [];
        acc[field.templateId].push(field);
        return acc;
      }, {});

      const templatesWithFields = templatesResponse.data.map(template => ({
        ...template,
        fields: fieldsByTemplateId[template.id] || [],
      }));

      setTemplates(templatesWithFields);
      setFilteredTemplates(templatesWithFields);
    } catch (error) {
      console.error('Error fetching templates or fields:', error);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container" >
          <SideBar className="side-bar" fetchTemplates={fetchTemplates} />
          <div className='app-template-list'>
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<TemplateList />} />
                <Route path="/home"
                  element={<TemplateList
                    fetchTemplates={fetchTemplates}
                    templates={templates}
                    setTemplates={setTemplates}
                    filteredTemplates={filteredTemplates}
                    setFilteredTemplates={setFilteredTemplates}
                  />} />
                <Route path="/template/:templateName"
                  element={<TemplateDetail />} />
              </Route>
            </Routes>

          </div>
        </div>
      </Router>
    </AuthProvider >
  );
}

export default App;