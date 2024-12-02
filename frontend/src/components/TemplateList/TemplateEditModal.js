import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, message } from 'antd';
import axios from 'axios';
import FieldEditor from './FieldEditor';
import './Templates.css';

const { TextArea } = Input;

const TemplateEditModal = ({ visible, template, onClose, onSave, fetchTemplates }) => {
    const [templateName, setTemplateName] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (template) {
            setTemplateName(template.templateName);
            setDescription(template.description);
            setFields(template.fields);
        } else {
            setTemplateName('');
            setDescription('');
            setFields([]);
        }
    }, [template]);

    const handleFieldChange = (updatedField, index) => {
        const updatedFields = [...fields];
        updatedFields[index] = updatedField;
        setFields(updatedFields);
    };

    const updateTemplate = async () => {
        const updatedTemplate = { templateName, description };
        try {
            if (template && template.id) {
                await axios.put(`/api/templates/${template.id}`, updatedTemplate);
            } else {
                await axios.post(`/api/templates`, updatedTemplate);
            }
        } catch (error) {
            console.error('Error updating template:', error);
            throw new Error('Error updating template');
        }
    };

    const updateFields = async () => {
        const existingFields = fields.filter(field => field.id);
        if (existingFields.length > 0) {
            try {
                await axios.put(`/api/template-fields/template/${template.id}`, existingFields);
            } catch (error) {
                console.error('Error updating fields:', error);
                throw new Error('Error updating fields');
            }
        }
    };

    const addNewFields = async (templateId, newFields) => {
        if (newFields.length > 0) {
            try {
                for (const newField of newFields) {
                    await axios.post(`/api/template-fields`, {
                        templateId: templateId,
                        ...newField
                    });
                }
            } catch (error) {
                console.error('Error adding new fields:', error);
                throw new Error('Error adding new fields');
            }
        }
    };
    

    const handleSave = async () => {
        if (!templateName.trim()) {
            message.error('Model Adı boş bırakılamaz!');
            return; // İşlem durduruluyor
        }
    
        for (const field of fields) {
            if (!field.fieldName.trim()) {
                message.error('Model Alanı adı boş bırakılamaz!');
                return; 
            }
        }
    
        try {
            let templateResponse;
            if (template && template.id) {
                await updateTemplate();
                    } else {
                templateResponse = await axios.post(`/api/templates`, { templateName, description });
            }
    
            const templateId = templateResponse ? templateResponse.data.id : template.id;
    
            const newFields = fields.filter(field => !field.id);
            if (newFields.length > 0) {
                await addNewFields(templateId, newFields);
            }
    
            if (template && template.id) {
                await updateFields();
            }
            await onSave({ ...template, templateName, description, fields });
            onClose();
            await fetchTemplates();
            message.success(template ? 'Model başarıyla güncellendi!' : 'Yeni model başarıyla oluşturuldu!');
        } catch (error) {
            console.error('Error during save operation:', error);
        }
    };
    

    return (
        <Modal
            title={template ? "Model Düzenle" : "Yeni Model Oluştur"}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>İptal</Button>,
                <Button key="submit" type="primary" onClick={handleSave}>Kaydet</Button>,
            ]}
            centered
        >
            <p><strong>Model Adı:</strong></p>
            <Input
                className='template-edit-model__template-name-input'
                placeholder='Model Adı'
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                status={templateName.trim() === '' ? 'error' : ''}
            />
            <p><strong>Açıklama</strong></p>
            <TextArea
                className='template-edit-model__template-desciption-input'
                placeholder='Açıklama'
                autoSize={{ minRows: 1, maxRows: 7 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div>
                <p><strong>Model Alanları</strong></p>
                {fields.map((field, index) => (
                    <FieldEditor
                        key={index}
                        field={field}
                        onFieldChange={(updatedField) => handleFieldChange(updatedField, index)}
                        onDeleteField={(deletedField) => {
                            setFields(fields.filter((f) => f !== deletedField));
                        }}
                    />
                ))}
            </div>
            <Button className='yeni-alan-ekle' onClick={() => setFields([...fields, { fieldName: '', fieldType: '', isRequired: false }])}>
                Yeni Alan Ekle +
            </Button>
        </Modal>
    );
};

export default TemplateEditModal;
