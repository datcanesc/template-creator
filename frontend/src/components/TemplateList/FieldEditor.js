import React, { useState } from 'react';
import { Input, Select, Checkbox, Tooltip, Button, message, Modal } from 'antd';
import { DeleteFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import colorPalette from '../../colorPalette';
import axios from 'axios';

const FieldEditor = ({ field, onFieldChange, onDeleteField }) => {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const showDeleteModal = () => {
        setIsDeleteModalVisible(true);
    };

    const handleFieldNameChange = (value) => {
        onFieldChange({ ...field, fieldName: value });
    };

    const handleFieldTypeChange = (value) => {
        onFieldChange({ ...field, fieldType: value });
    };

    const handleIsRequiredChange = (checked) => {
        onFieldChange({ ...field, isRequired: checked });
    };

    const deleteField = async () => {
        try {
            // Sadece id'si olan alanlar silinebilir
            if (!field.id) {
                message.warning('Bu alan henüz kaydedilmedi, sadece kaldırıldı.');
                onDeleteField(field); // Sadece local state'den kaldır
                return;
            }

            await axios.delete(`/api/template-fields/${field.id}`);
            message.success('Alan başarıyla silindi.');
            onDeleteField(field);
        } catch (error) {
            console.error('Error deleting field:', error);
            message.error('Alan silinirken bir hata oluştu.');
        }
    };

    return (
        <div className='field-editor-modal-container'>
            <Input
                className='field-editor__field-names-input'
                placeholder='Model alanı için isim giriniz'
                value={field.fieldName}
                onChange={(e) => handleFieldNameChange(e.target.value)}
                status={field.fieldName.trim() === '' ? 'error' : ''}
            />
            <Select
                className='field-editor__field-types-select'
                defaultValue={field.fieldType}
                onChange={handleFieldTypeChange}
                placeholder="Alan türünü seçiniz"
                options={[
                    { value: "STRING", label: "Metin (String)" },
                    { value: "INTEGER", label: "Tam Sayı (Integer)" },
                    { value: "FLOAT", label: "Ondalık Sayı (Float)" },
                    { value: "BOOLEAN", label: "Doğru/Yanlış (Boolean)" },
                    { value: "DATE", label: "Tarih" }
                ]}
            />
            <Tooltip title="Bu alanın doldurulması zorunludur">
                <Checkbox
                    className='field-editor__is-required-checkbox'
                    checked={Boolean(field.isRequired)}
                    onChange={(e) => handleIsRequiredChange(e.target.checked)}
                />
            </Tooltip>
            <Button
                className='field-editor-delete-field-icon'
                onClick={showDeleteModal}
                danger
            >
                <DeleteFilled />
            </Button>

            <Modal
                title="Kayıt Silme Onayı"
                open={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onOk={deleteField}
                okText="Evet"
                okType="danger"
                cancelText="Hayır"
            >
                <div style={{display:'flex' }}>
                    <ExclamationCircleOutlined style={{ fontSize: '30px', color: colorPalette.hoverOrange ,marginRight:'20px'}} />
                    <div style={{ alignItems: 'center', gap: '10px' }}>
                        <p>Bu alanı silmek istediğinizden emin misiniz?</p>
                        <p>Alana bağlı olan kayıtlar da silinecektir!</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FieldEditor;
