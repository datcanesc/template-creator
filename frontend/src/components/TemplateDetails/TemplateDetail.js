import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, ConfigProvider, Button, Modal, message, Input } from 'antd';
import { EditFilled, DeleteFilled, ExclamationCircleOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import colorPalette from '../../colorPalette';
import './TemplateDetail.css';
import { useRole } from '../../AuthContext';
import TemplateEditModal from '../TemplateList/TemplateEditModal';


const TemplateDetail = () => {
    const location = useLocation();
    const { templateId } = location.state || {};

    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');

    const [templateFields, setTemplateFields] = useState([]);
    const [records, setRecords] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const isAdmin = useRole('admin');

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    const [searchText, setSearchText] = useState('');
    const [filteredRecords, setFilteredRecords] = useState([]);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Template field verilerini getiren fonksiyon
    const fetchTemplateFields = useCallback(async (templateId) => {
        try {
            const response = await axios.get(`/api/template-fields/template/${templateId}`);
            const fields = response.data;
            setTemplateFields(fields);
            const dynamicColumns = fields.map(field => ({
                title: field.fieldName,
                dataIndex: field.id,
                key: field.id,
                editable: true,
                align: 'center',
                sorter: (a, b) => {
                    if (typeof a[field.id] === 'number' && typeof b[field.id] === 'number') {
                        return a[field.id] - b[field.id];
                    }
                    return a[field.id]?.localeCompare(b[field.id]);
                },
            }));

            if (isAdmin) {
                dynamicColumns.push({
                    title: 'Aksiyonlar',
                    key: 'aksiyonlar',
                    align: 'center',
                    render: (_, record) => (
                        <span className='template-detail-actions-buttons'>
                            <Button
                                className='template-detail-edit-button'
                                onClick={() => handleEditRecord(record)}
                                icon={<EditFilled />}
                            />
                            <Button
                                className='template-detail-delete-button'
                                icon={<DeleteFilled />}
                                danger
                                onClick={() => showDeleteModal(record)}
                            />
                        </span>
                    ),
                });
            }

            setColumns(dynamicColumns);
        } catch (error) {
            console.error('Error fetching template fields:', error);
        }
    }, [isAdmin]);

    const fetchTemplateRecords = async (templateId) => {
        try {
            const response = await axios.get(`/api/template-records/template/${templateId}`);
            const recordsData = response.data.map(record => ({
                ...record.recordData,
                id: record.id,
            }));
            setRecords(recordsData);
        } catch (error) {
            console.error('Error fetching template records:', error);
        }
    };

    const fetchTemplateDetails = async (templateId) => {
        try {
            const response = await axios.get(`/api/templates/${templateId}`);
            setTemplateName(response.data.templateName);
            setTemplateDescription(response.data.description);
        } catch (error) {
            console.error('Error fetching template details:', error);
        }
    };

    useEffect(() => {
        if (templateId) {
            fetchTemplateDetails(templateId);
            fetchTemplateFields(templateId);
            fetchTemplateRecords(templateId);
        }
    }, [templateId, fetchTemplateFields]);

    useEffect(() => {
        if (templateId) {
            setSelectedTemplate({
                id: templateId,
                templateName: templateName,
                description: templateDescription,
                fields: templateFields.map((field) => ({
                    id: field.id,
                    fieldName: field.fieldName,
                    fieldType: field.fieldType,
                    isRequired: field.isRequired,
                })),
            });
        }
    }, [templateId, templateName, templateDescription, templateFields]);


    const validateForm = () => {
        const emptyFields = templateFields.filter(
            (field) => field.isRequired && !selectedRecord[field.id]
        );

        if (emptyFields.length > 0) {
            message.error('Zorunlu alanları doldurduğunuzdan emin olun!');
            return false;
        }
        return true;
    };


    // Kayıt silme fonksiyonu
    const deleteRecord = async () => {
        if (!recordToDelete) return;
        try {
            await axios.delete(`/api/template-records/${recordToDelete.id}`);
            message.success('Kayıt başarıyla silindi!');
            setRecords((prevRecords) =>
                prevRecords.filter((record) => record.id !== recordToDelete.id)
            );
            setFilteredRecords((prevRecords) =>
                prevRecords.filter((record) => record.id !== recordToDelete.id)
            );
            setIsDeleteModalVisible(false);
            setRecordToDelete(null);
        } catch (error) {
            console.error('Error deleting record:', error);
            message.error('Kayıt silinirken bir hata oluştu.');
        }
    };

    // Silme onay modali
    const showDeleteModal = (record) => {
        setRecordToDelete(record);
        setIsDeleteModalVisible(true);
    };

    const handleAddNewRecord = () => {
        setIsEditing(false);
        setSelectedRecord(null);
        setIsModalVisible(true);
    };

    const handleEditRecord = (record) => {
        setIsEditing(true);
        setSelectedRecord(record);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedRecord(null);
    };

    const handleEditTemplate = () => {
        setIsEditModalVisible(true);
    };

    const handleEditTemplateClose = () => {
        setIsEditModalVisible(false);
    };

    const handleSaveTemplate = async () => {
        try {
            await fetchTemplateFields(templateId);
            await fetchTemplateRecords(templateId);
            await fetchTemplateDetails(templateId);

            message.success('Model başarıyla kaydedildi!');
        } catch (error) {
            console.error('Error saving template:', error);
            message.error('Template kaydedilirken bir hata oluştu.');
        }
    };

    const handleSaveRecord = async () => {
        if (!selectedRecord) return;
        if (!validateForm()) return;

        try {
            const url = isEditing
                ? `/api/template-records/${selectedRecord.id}`
                : `/api/template-records`;

            const method = isEditing ? 'put' : 'post';

            const response = await axios({
                method,
                url,
                data: {
                    templateId,
                    recordData: selectedRecord,
                },
            });

            if (response.status === 200 || response.status === 201) {
                message.success(
                    isEditing ? 'Kayıt başarıyla güncellendi!' : 'Yeni kayıt başarıyla oluşturuldu!'
                );
                fetchTemplateRecords(templateId);
                setIsModalVisible(false);
                setSelectedRecord(null);
            }
        } catch (error) {
            console.error('Error saving record:', error);
            message.error('Kayıt kaydedilirken bir hata oluştu.');
        }
    };

    const handleSearchRecords = (e) => {
        const value = e.target.value.toLowerCase().trim();
        setSearchText(value);

        if (!value) {
            setFilteredRecords(records);
            return;
        }

        const filtered = records.filter((record) =>
            Object.values(record).some(
                (fieldValue) =>
                    fieldValue &&
                    fieldValue.toString().toLowerCase().includes(value)
            )
        );

        setFilteredRecords(filtered);
    };

    const fieldTypeLabels = {
        STRING: "Metin",
        INTEGER: "Tam Sayı",
        FLOAT: "Ondalık Sayı",
        BOOLEAN: "Boolean",
        DATE: "Tarih",
    };



    return (
        <div className='template-details-container'>
            <h1 className='template-details-title'>{templateName}</h1>

            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            colorText: colorPalette.white,
                            colorBgContainer: colorPalette.darkBlue,
                            rowHoverBg: colorPalette.hoverBlue,
                            borderColor: colorPalette.darkBlue2,

                            // Header
                            headerBg: colorPalette.darkBlue2,
                            headerColor: colorPalette.white,
                        },
                        Pagination: {
                            colorText: colorPalette.white,
                            colorBgContainer: colorPalette.darkBlue,
                            colorPrimary: colorPalette.darkBlue,
                            colorPrimaryHover: colorPalette.hoverBlue,
                            colorBorder: colorPalette.darkBlue2,
                            itemActiveBg: colorPalette.lightBlue,
                        },
                        Button: {
                            colorText: colorPalette.white,
                            colorBgContainer: colorPalette.darkBlue2,
                            lineWidth: 1,
                            defaultBorderColor: colorPalette.darkBlue2,
                        },
                        Input: {
                            colorBgContainer: colorPalette.darkBlue,
                            lineWidth: 1,
                            colorText: colorPalette.white,
                            colorTextPlaceholder: colorPalette.lightBlue,
                            colorBorder: colorPalette.darkBlue2,
                            colorPlaceholder: colorPalette.darkBlue2,
                        },
                        Modal: {
                            contentBg: colorPalette.darkBlue2,
                            titleColor: colorPalette.white,
                            headerBg: colorPalette.darkBlue2,
                        },
                        Select: {
                            colorBgContainer: colorPalette.darkBlue,
                            colorText: colorPalette.white,
                            colorBorder: colorPalette.darkBlue2,
                            colorError: colorPalette.red,
                            colorHelp: colorPalette.darkBlue,
                            optionSelectedBg: colorPalette.hoverBlue,
                            optionActiveBg: colorPalette.lightBlue,
                            optionSelectedColor: colorPalette.white,
                            multipleItemBg: colorPalette.hoverBlue,
                        },
                    },
                }}
            >

                <div className="template-detail-search-bar-container">
                    {/* kullanıcı izinleri */}
                    {isAdmin && (
                        <Button
                            className='template-detail-edit-template-button'
                            type="primary"
                            onClick={handleEditTemplate}
                            icon={<EditFilled />}
                        >
                            Modeli Düzenle
                        </Button>)}

                    <Input
                        className="search-bar-template-detail"
                        placeholder="Kayıtlar arasında ara..."
                        value={searchText}
                        onChange={handleSearchRecords}
                        prefix={<SearchOutlined className='search-icon' />}
                    />

                    {/* kullanıcı izinleri */}
                    {isAdmin && (
                        <Button
                            className='template-detail-add-new-row-button'
                            type="primary"
                            onClick={handleAddNewRecord}
                            icon={<PlusOutlined />}
                        >
                            Yeni Kayıt Ekle
                        </Button>)}

                </div>

                <Table columns={columns} dataSource={filteredRecords.length > 0 ? filteredRecords : records} rowKey="id" />

                <TemplateEditModal
                    visible={isEditModalVisible}
                    template={selectedTemplate}
                    onClose={handleEditTemplateClose}
                    onSave={handleSaveTemplate}
                />

                <Modal
                    title="Kayıt Silme Onayı"
                    open={isDeleteModalVisible}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    onOk={deleteRecord}
                    okText="Evet"
                    okType="danger"
                    cancelText="Hayır"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ExclamationCircleOutlined style={{ fontSize: '24px', color: colorPalette.hoverOrange }} />
                        <p>Bu kaydı silmek istediğinizden emin misiniz?</p>
                    </div>
                </Modal>

                <Modal
                    title={isEditing ? "Kayıt Düzenle" : "Yeni Kayıt Ekle"}
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={[
                        <Button key="cancel" onClick={handleModalClose}>İptal</Button>,
                        <Button key="submit" onClick={handleSaveRecord} type="primary">Kaydet</Button>,
                    ]}
                >
                    {templateFields.map((field) => (
                        <div key={field.id} className="field-container">
                            {field.fieldType === 'DATE' ? (
                                <div>
                                    <p style={{ color: '#80A4DB' }} >
                                        <strong style={{ color: 'white' }} >{field.fieldName} - {fieldTypeLabels[field.fieldType]} </strong>
                                        :GG-AA-YYYY
                                    </p>
                                </div>
                            ) : (
                                <p><strong>{field.fieldName} - {fieldTypeLabels[field.fieldType]}</strong>:</p>
                            )}
                            <Input
                                placeholder={field.isRequired ? 'Bu alan zorunludur' : ''}
                                type={field.fieldType === 'DATE' ? "text" : (field.fieldType === 'STRING' || field.fieldType === 'BOOLEAN') ? "text" : "number"}
                                value={selectedRecord?.[field.id] || ''}
                                step={field.fieldType === 'FLOAT' ? 0.001 : undefined}
                                status={
                                    field.isRequired && !selectedRecord?.[field.id]
                                        ? 'error'
                                        : ''
                                }
                                onChange={(e) => {
                                    const inputValue = e.target.value;

                                    if (field.fieldType === 'DATE') {
                                        let numericValue = inputValue.replace(/[^0-9]/g, '');


                                        if (numericValue.length <= selectedRecord?.[field.id]?.replace(/[^0-9]/g, '').length) {
                                            setSelectedRecord((prev) => ({
                                                ...prev,
                                                [field.id]: inputValue, // Silme işlemini doğrudan kaydet
                                            }));
                                            return;
                                        }


                                        if (numericValue.length > 8) numericValue = numericValue.slice(0, 8);


                                        const formattedDate = numericValue
                                            .replace(/^(\d{2})(\d{0,2})/, '$1-$2')
                                            .replace(/^(\d{2}-\d{2})(\d{0,4})/, '$1-$2');

                                        setSelectedRecord((prev) => ({
                                            ...prev,
                                            [field.id]: formattedDate,
                                        }));
                                    } else {
                                        setSelectedRecord((prev) => ({
                                            ...prev,
                                            [field.id]: inputValue,
                                        }));
                                    }
                                }}
                            />
                        </div>
                    ))}
                </Modal>
            </ConfigProvider>
        </div>
    );
};

export default TemplateDetail;
