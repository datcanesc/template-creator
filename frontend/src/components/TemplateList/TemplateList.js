import React, { useEffect, useState } from 'react';
import { Table, Button, ConfigProvider, message, Input, Modal } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditFilled, DeleteFilled, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import TemplateEditModal from './TemplateEditModal';
import './Templates.css';
import colorPalette from '../../colorPalette.js';
import { useRole } from '../../AuthContext.js';

const TemplateList = ({ fetchTemplates, templates, setTemplates, filteredTemplates, setFilteredTemplates }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const isAdmin = useRole('admin');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleEditClick = (template) => {
        setSelectedTemplate(template);
        setIsModalVisible(true);
    };

    const handleModalClose = async () => {
        setIsModalVisible(false);
        setSelectedTemplate(null);
        await fetchTemplates();
    };

    const handleDeleteClick = (template) => {
        setSelectedTemplate(template);
        setIsDeleteModalVisible(true);
    };

    const deleteTemplate = async (template) => {
        try {
            await axios.delete(`/api/templates/${template.id}`);
            setTemplates(prevTemplates => prevTemplates.filter(t => t.id !== template.id));
            setFilteredTemplates(prevTemplates => prevTemplates.filter(t => t.id !== template.id));

            setIsDeleteModalVisible(false);
            setSelectedTemplate(null);

            message.success('Model başarıyla silindi');
        } catch (error) {
            console.error('Error deleting template:', error);
            message.error('Model silinirken bir hata oluştu.');
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);

        const filtered = templates.filter(template =>
            template.templateName.toLowerCase().includes(value.toLowerCase()) ||
            template.description.toLowerCase().includes(value.toLowerCase()) ||
            template.fields.some(field => field.fieldName.toLowerCase().includes(value.toLowerCase()))
        );

        setFilteredTemplates(filtered);
    };

    const handleSaveTemplate = (updatedTemplate) => {
        setTemplates(prevTemplates =>
            prevTemplates.map(template =>
                template.id === updatedTemplate.id ? updatedTemplate : template
            )
        );
    };

    const columns = [
        {
            title: 'Model Adı',
            dataIndex: 'templateName',
            key: 'templateName',
            align: 'center',
            sorter: (a, b) => a.templateName.localeCompare(b.templateName),
            render: (text, record) => (
                <Button
                    className='template-list-name-button'
                    onClick={() =>
                        navigate(`/template/${record.templateName}`, {
                            state: {
                                templateId: record.id
                            }
                        })
                    }
                >
                    {text}
                </Button>
            ),
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Model Alanları',
            dataIndex: 'fields',
            key: 'fields',
            render: (fields) => fields.map(field => field.fieldName).join(', ') || 'Model Alanı Bulunmamaktadır',
        },

        //kullanıcı izinleri
        ...(isAdmin ? [
            {
                title: 'Aksiyonlar',
                key: 'actions',
                align: 'center',
                render: (record) => (
                    <span className='template-list-actions-buttons'>
                        <Button
                            className='template-list-edit-button'
                            onClick={() => handleEditClick(record)}
                        >
                            <EditFilled />
                        </Button>

                        <Button
                            className='template-list-delete-button'
                            onClick={() => handleDeleteClick(record)}
                            danger
                        >
                            <DeleteFilled />
                        </Button>
                    </span>
                ),
            }
        ] : []),
    ];

    return (
        <div className='template-list-container'>
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
                <div className="search-bar-container">
                    <Input
                        className="search-bar"
                        placeholder="Template adını veya açıklamasını ara"
                        value={searchText}
                        onChange={handleSearch}
                        prefix={<SearchOutlined className='search-icon' />}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredTemplates}
                    rowKey="id"
                    pagination={{ pageSize: 11 }}
                />

                <TemplateEditModal
                    visible={isModalVisible}
                    template={selectedTemplate}
                    onClose={handleModalClose}
                    onSave={handleSaveTemplate}
                />

                <Modal
                    title="Model Silme Onayı"
                    open={isDeleteModalVisible}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    onOk={() => deleteTemplate(selectedTemplate)}
                    okText="Evet"
                    okType="danger"
                    cancelText="Hayır"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ExclamationCircleOutlined style={{ fontSize: '24px', color: colorPalette.hoverOrange }} />
                        <p>Bu Modeli silmek istediğinizden emin misiniz?</p>
                    </div>
                </Modal>
            </ConfigProvider>
        </div>
    );
};

export default TemplateList;
