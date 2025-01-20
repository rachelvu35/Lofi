import React, { useState } from 'react'
import avatar from '../assets/profile.png';
import toast, { Toaster } from 'react-hot-toast';
import { useFormik } from 'formik';
import { profileValidation } from '../helper/validate';
import convertToBase64 from '../helper/convert';
import useFetch from '../hooks/fetch.hook';
import { updateUser } from '../helper/helper'
import { useNavigate } from 'react-router-dom'
import { message, Table, Select, DatePicker, Input } from "antd";
import { BarsOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Spinner from "../components/Spinner";
import AddEditTransaction from "../components/AddEditTransaction";
import DefaultLayout from '../components/DefaultLayout';
import moment from "moment";
import Analytics from "../components/Analytics";
import styles from '../styles/Username.module.css';
import extend from '../styles/Profile.module.css';
import axios from "axios";
import { useEffect } from "react";



const { RangePicker } = DatePicker;

export default function Profile() {

  const [file, setFile] = useState();
  const [{ isLoading, apiData, serverError }] = useFetch();
  const navigate = useNavigate()
  const [showAddEditTransactionModal, setShowAddEditTransactionModal] =
  useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState (null)
  const [loading, setLoading] = useState(false);
  const [transactionsData, setTransactionsData] = useState([]);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [selectedRange, setselectedRange] = useState([]);
  const [viewType, setViewType] = useState("table");
  const [searchKeyword, setSearchKeyword] = useState('');
  const getTransactions = async (keyword = '') => {
    try {
      const user = JSON.parse(localStorage.getItem("lofi-user"));
      setLoading(true);
      const response = await axios.post(
        "/api/transactions/get-all-transactions",
        {
          userid: user._id,
          frequency,
          ...(frequency === "custom" && { selectedRange }),
          type,
        }
      );
      setLoading(false);

      const keywordTrimmed = keyword.trim();
      const numericKeyword = parseFloat(keywordTrimmed);
      const isNumericKeyword = !isNaN(numericKeyword); // Check if the parsed keyword is a number
  
      let filteredData = response.data.filter(transaction => {
        const textMatch = transaction.description?.toLowerCase().includes(keywordTrimmed.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(keywordTrimmed.toLowerCase()) ||
          transaction.reference?.toLowerCase().includes(keywordTrimmed.toLowerCase())||
          transaction.type?.toLowerCase().includes(keywordTrimmed.toLowerCase());
        
        const amountMatch = isNumericKeyword ? transaction.amount === numericKeyword : 
          transaction.amount.toString().includes(keywordTrimmed);
  
        return textMatch || amountMatch;
      });
      const processedData = filteredData.map((item, index) => ({
        ...item, 
          key: item._id || `item-${index}`
      }));

      setTransactionsData(processedData);
    } catch (error) {
      message.error("Something went wrong");

    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getTransactions(searchKeyword); 
  }, [frequency, selectedRange, type, searchKeyword]);


  const deleteTransaction = async (record) => {
    try {
      setLoading(true);
      await axios.post(
        "/api/transactions/delete-transaction",
        {
          transactionId : record._id
        }
      );
      message.success('Transaction Deleted Successfully')
      getTransactions();
      //setTransactionsData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("Something went wrong");
    }
  };

  useEffect(() => {
    getTransactions();
  }, [frequency, selectedRange, type]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => <span>{moment(date).format("YYYY-MM-DD")}</span>,
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Reference",
      dataIndex: "reference",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => {
        return (
          <div>
            <EditOutlined
              onClick={() => {
                setSelectedItemForEdit(record);
                setShowAddEditTransactionModal(true);
              }}
            />
            <DeleteOutlined className="mx-3" onClick={() => deleteTransaction(record)} />
          </div>
        );
      },
    },
  ];

  const formik = useFormik({
    initialValues : {
      firstName : apiData?.firstName || '',
      lastName: apiData?.lastName || '',
      email: apiData?.email || '',
      mobile: apiData?.mobile || '',
      address : apiData?.address || ''
    },
    enableReinitialize: true,
    validate : profileValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit : async values => {
      values = await Object.assign(values, { profile : file || apiData?.profile || ''})
      let updatePromise = updateUser(values);

      toast.promise(updatePromise, {
        loading: 'Updating...',
        success : <b>Update Successfully...!</b>,
        error: <b>Could not Update!</b>
      });

    }
  })

  /** handler for upload file */
  const onUpload = async e => {
    const base64 = await convertToBase64(e.target.files[0]);
    setFile(base64);
  }

  // logout handler function
  function userLogout(){
    localStorage.removeItem('token');
    navigate('/')
  }

  if(isLoading) return <h1 className='text-2xl font-bold'>isLoading</h1>;
  if(serverError) return <h1 className='text-xl text-red-500'>{serverError.message}</h1>

  return (
    <div className="container mx-auto">

      <Toaster position='top-center' reverseOrder={false}></Toaster>

      <div className='flex justify-center items-center h-screen'>
      <div className={`${styles.glass} ${extend.glass}`} style={{ width: "45%", paddingTop: '3em' }}>

          <div className="title flex flex-col items-center">
            <h4 className='text-5xl font-bold'>Profile</h4>
            <span className='py-4 text-xl w-2/3 text-center text-gray-500'>
                You can update the details.
            </span>
          </div>

          <form className='py-1' onSubmit={formik.handleSubmit}>
              <div className='profile flex justify-center py-4'>
                  <label htmlFor="profile">
                  <img
                      src={apiData?.profile || file || avatar}
                      className={`${styles.profile_img} ${extend.profile_img}`}
                      alt="avatar"
                  />    
                  </label>
                  
                  <input onChange={onUpload} type="file" id='profile' name='profile' />
              </div>

              <div className="textbox flex flex-col items-center gap-6">
              <div className="name flex w-3/4 gap-10">
                  <input {...formik.getFieldProps('firstName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder="FirstName" />
                  <input {...formik.getFieldProps('lastName')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder="LastName" />
               </div>

                <div className="name flex w-3/4 gap-10">
                  <input {...formik.getFieldProps('mobile')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder="Mobile No." />
                  <input {...formik.getFieldProps('email')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder="Email*" />
                </div>

               
                  <input {...formik.getFieldProps('address')} className={`${styles.textbox} ${extend.textbox}`} type="text" placeholder="Address" />
                  <button className={styles.btn} type='submit'>Update</button>
               
                  
              </div>

              <div className="text-center py-4">
                <span className='text-gray-500'>Come back later? <button onClick={userLogout} className='text-red-500' to="/">Logout</button></span>
              </div>

          </form>
          <DefaultLayout>
      {loading && <Spinner />}
      <div className="filter d-flex justify-content-between align-items-center">
        <div className="d-flex flex-colum">
          <div className="d-flex flex-column">
            <h6>Select Frequency</h6>
            <Select value={frequency} onChange={(value) => setFrequency(value)}>
              <Select.Option value="7">Last 1 Week</Select.Option>
              <Select.Option value="30">Last 30 Days</Select.Option>
              <Select.Option value="365">Last 1 Year</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>

            {frequency === "custom" && (
              <div className="mt-2">
                <RangePicker
                  value={selectedRange}
                  onChange={(values) => setselectedRange(values)}
                />
              </div>
            )}
          </div>
          <div className="d-flex flex-column mx-5">
            <h6>Select Type</h6>
            <Select value={type} onChange={(value) => setType(value)}>
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
              <Select.Option value="income">Income</Select.Option>
            </Select>
          </div>
        </div>
        <div className="search-and-date-filter">
  <Input
    placeholder="Search by keyword"
    size="large"
    value={searchKeyword}
    onChange={e => setSearchKeyword(e.target.value)}
    style={{ width: 200, marginRight: '10px' }}
  />
  
</div>

        <div className="d-flex">
          <div>
            <div className="view-switch mx-3">
            <BarsOutlined
                className={`mx-3 ${viewType === "table" ? "active-icon" : "inactive-icon"}`}
                onClick={() => setViewType('table')}
              />
              <AreaChartOutlined
                className={`${viewType === "analytics" ? "active-icon" : "inactive-icon"}`}
                onClick={() => setViewType('analytics')}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            className="primary"
            onClick={() => setShowAddEditTransactionModal(true)}
          >
            ADD NEW
          </button>
        </div>
      </div>

      <div className="table-analytics">
        {viewType==='table' ? <div className="table">
        
            <Table 
            rowKey={record => record._id.toString()}
            columns={columns} 
            dataSource={transactionsData} 
            Pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '50'], 
              position: ["bottomRight"]
            }}/>
        </div> : <Analytics transactions = {transactionsData} />}

      </div>

      {showAddEditTransactionModal && (
        <AddEditTransaction
          showAddEditTransactionModal={showAddEditTransactionModal}
          setShowAddEditTransactionModal={setShowAddEditTransactionModal}
          selectedItemForEdit = {selectedItemForEdit}
          setSelectedItemForEdit = {setSelectedItemForEdit}
          getTransactions={getTransactions}
        />
      )}
    </DefaultLayout>

        </div>
      </div>
    </div>
  )
};